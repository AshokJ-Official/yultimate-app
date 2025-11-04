'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { sessionAPI } from '@/lib/api';
import socketManager from '@/lib/socket';
import { CheckCircle, XCircle, Clock, Users, UserCheck, UserX, Save, ArrowLeft } from 'lucide-react';

export default function SessionAttendance() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [socket, setSocket] = useState(null);
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });

  useEffect(() => {
    fetchSession();
    
    // Initialize socket connection
    const newSocket = socketManager.connect();
    setSocket(newSocket);
    
    // Join session room for real-time updates
    socketManager.joinSession(params.id);
    
    // Listen for attendance updates from other users
    socketManager.onAttendanceUpdate((data) => {
      if (data.sessionId === params.id) {
        setAttendance(prev => ({
          ...prev,
          [data.childId]: {
            present: data.present,
            notes: data.notes,
            markedBy: data.markedBy,
            markedAt: data.markedAt
          }
        }));
        updateStats(data.totalPresent, data.totalChildren);
      }
    });

    socketManager.onBulkAttendanceUpdate((data) => {
      if (data.sessionId === params.id) {
        const newAttendance = { ...attendance };
        data.updates.forEach(update => {
          newAttendance[update.childId] = {
            present: update.present,
            notes: update.notes,
            markedBy: data.markedBy,
            markedAt: data.markedAt
          };
        });
        setAttendance(newAttendance);
        updateStats(data.totalPresent, data.totalChildren);
      }
    });

    return () => {
      socketManager.leaveSession(params.id);
    };
  }, [params.id]);

  const fetchSession = async () => {
    try {
      const [sessionResponse, childrenResponse] = await Promise.all([
        sessionAPI.getById(params.id),
        sessionAPI.getSessionChildren(params.id)
      ]);
      
      const sessionData = sessionResponse.data?.data || sessionResponse.data;
      const childrenData = childrenResponse.data?.data || childrenResponse.data;
      
      setSession(sessionData);
      
      // Initialize attendance state from children data
      const attendanceMap = {};
      if (childrenData.children) {
        childrenData.children.forEach(item => {
          attendanceMap[item.child._id] = {
            present: item.present || false,
            notes: item.notes || '',
            markedBy: item.markedBy?.name,
            markedAt: item.markedAt
          };
        });
      }
      setAttendance(attendanceMap);
      
      // Use stats from API or calculate
      if (childrenData.stats) {
        setStats(childrenData.stats);
      } else {
        const present = Object.values(attendanceMap).filter(att => att.present).length;
        const total = Object.keys(attendanceMap).length;
        setStats({ present, absent: total - present, total });
      }
      
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (present, total) => {
    setStats({ present, absent: total - present, total });
  };

  const markAttendance = async (childId, present, notes = '') => {
    try {
      await sessionAPI.markAttendance(params.id, { childId, present, notes });
      
      // Emit real-time update
      socketManager.emitAttendanceUpdate({
        sessionId: params.id,
        childId,
        present,
        notes
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const bulkSave = async () => {
    setSaving(true);
    try {
      const attendanceData = Object.entries(attendance).map(([childId, data]) => ({
        childId,
        present: data.present,
        notes: data.notes
      }));
      
      await sessionAPI.bulkMarkAttendance(params.id, { attendanceData });
      
      // Emit bulk update
      socketManager.emitBulkAttendanceUpdate({
        sessionId: params.id,
        updates: attendanceData
      });
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleAttendance = (childId, currentStatus) => {
    setAttendance(prev => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        present: !currentStatus
      }
    }));
    
    // Update stats immediately
    const newPresent = currentStatus ? stats.present - 1 : stats.present + 1;
    setStats(prev => ({ ...prev, present: newPresent, absent: prev.total - newPresent }));
    
    // Mark attendance in real-time
    markAttendance(childId, !currentStatus, attendance[childId]?.notes || '');
  };

  const updateNotes = (childId, notes) => {
    setAttendance(prev => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        notes
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Session
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={bulkSave}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save All'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">📋 Attendance Tracking</h1>
              <p className="text-gray-600">{session?.title}</p>
              <p className="text-sm text-gray-500">
                {new Date(session?.scheduledDate).toLocaleDateString()} • {session?.location?.name}
              </p>
            </div>
            
            {/* Real-time Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <UserCheck className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                <div className="text-sm text-green-700">Present</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <UserX className="h-6 w-6 text-red-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                <div className="text-sm text-red-700">Absent</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-700">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Children Attendance</h2>
            <p className="text-gray-600 mt-1">Click to mark present/absent • Updates in real-time</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {session?.attendance && session.attendance.length > 0 ? session.attendance.map((att) => {
              const childAttendance = attendance[att.child._id] || {};
              const isPresent = childAttendance.present;
              
              return (
                <div key={att.child._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => toggleAttendance(att.child._id, isPresent)}
                        className={`p-2 rounded-full transition-all transform hover:scale-105 ${
                          isPresent 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        {isPresent ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <XCircle className="h-6 w-6" />
                        )}
                      </button>
                      
                      <div>
                        <h3 className="font-semibold text-gray-800">{att.child.name}</h3>
                        <p className="text-sm text-gray-600">
                          Age: {att.child.age} • {att.child.gender}
                        </p>
                        {childAttendance.markedBy && (
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            Marked by {childAttendance.markedBy} at{' '}
                            {new Date(childAttendance.markedAt).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isPresent 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isPresent ? 'Present' : 'Absent'}
                      </span>
                      
                      <input
                        type="text"
                        placeholder="Notes..."
                        value={childAttendance.notes || ''}
                        onChange={(e) => updateNotes(att.child._id, e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="p-8 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No children registered</p>
                <p className="text-sm">Children need to be registered for this session first.</p>
                <button
                  onClick={() => router.push(`/sessions/${params.id}/children`)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Registered Children →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                const allPresent = {};
                session.attendance.forEach(att => {
                  allPresent[att.child._id] = { ...attendance[att.child._id], present: true };
                });
                setAttendance(allPresent);
                setStats({ present: session.attendance.length, absent: 0, total: session.attendance.length });
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Mark All Present
            </button>
            <button
              onClick={() => {
                const allAbsent = {};
                session.attendance.forEach(att => {
                  allAbsent[att.child._id] = { ...attendance[att.child._id], present: false };
                });
                setAttendance(allAbsent);
                setStats({ present: 0, absent: session.attendance.length, total: session.attendance.length });
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Mark All Absent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}