'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { coachAPI, sessionAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import socketManager from '@/lib/socket';
import { ArrowLeft, Clock, Users, Home, Calendar, MapPin, Play, Pause, CheckCircle } from 'lucide-react';

export default function CoachDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [workloadData, setWorkloadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const isCoach = user?.role === 'coach';
  const canAssignWork = ['programme_manager', 'programme_director'].includes(user?.role);

  useEffect(() => {
    fetchWorkload();
  }, [params.id, selectedDate]);

  // Separate effect for socket connection to avoid dependency issues
  useEffect(() => {
    const handleWorkloadUpdate = (data) => {
      if (data.coachId === params.id) {
        fetchWorkload();
      }
    };

    try {
      const socket = socketManager.connect();
      socketManager.on('work-assigned', handleWorkloadUpdate);
      socketManager.on('coach-workload-updated', handleWorkloadUpdate);
    } catch (error) {
      console.log('Socket connection failed, continuing without real-time updates');
    }

    return () => {
      try {
        socketManager.off('work-assigned', handleWorkloadUpdate);
        socketManager.off('coach-workload-updated', handleWorkloadUpdate);
      } catch (error) {
        // Ignore cleanup errors
      }
    };
  }, [params.id]);

  const fetchWorkload = async () => {
    try {
      // Get a wider date range to ensure we capture all assigned work
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // 30 days ago
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // 30 days ahead

      const response = await coachAPI.getWorkload(params.id, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      console.log('Workload response:', response.data); // Debug log
      setWorkloadData(response.data?.data || response.data);
    } catch (error) {
      console.error('Error fetching workload:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSessionTime = async (sessionId, timeData) => {
    try {
      await coachAPI.updateSessionTime({
        sessionId,
        ...timeData
      });
      fetchWorkload();
    } catch (error) {
      console.error('Error updating session time:', error);
    }
  };

  const startSession = async (sessionId) => {
    try {
      await sessionAPI.start(sessionId);
      await updateSessionTime(sessionId, { startTime: new Date().toISOString() });
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const completeSession = async (sessionId) => {
    try {
      await sessionAPI.complete(sessionId);
      await updateSessionTime(sessionId, { endTime: new Date().toISOString() });
    } catch (error) {
      console.error('Error completing session:', error);
    }
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
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchWorkload}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Refresh
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Coach Workload</h1>
          <p className="text-gray-600">Real-time activity tracking and management</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Sessions</p>
                <p className="text-2xl font-bold text-blue-600">{workloadData?.stats?.totalSessions || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Home Visits</p>
                <p className="text-2xl font-bold text-green-600">{workloadData?.stats?.totalHomeVisits || 0}</p>
              </div>
              <Home className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Hours</p>
                <p className="text-2xl font-bold text-purple-600">{workloadData?.stats?.totalHours?.toFixed(1) || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-2xl font-bold text-orange-600">{workloadData?.stats?.inProgressSessions || 0}</p>
              </div>
              <Play className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">📅 Sessions ({workloadData?.sessions?.length || 0})</h2>
          
          <div className="space-y-4">
            {workloadData?.sessions && workloadData.sessions.length > 0 ? workloadData.sessions.map((session) => (
              <div key={session._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-gray-800">{session.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(session.scheduledDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {session.location?.name}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {session.attendance?.length || 0} children
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      session.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                      session.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {session.status === 'in_progress' ? '🟢 Ongoing' : 
                       session.status === 'completed' ? '✅ Completed' :
                       session.status === 'scheduled' ? '📋 Scheduled' : session.status}
                    </span>
                    
                    {session.status === 'scheduled' && (
                      <button
                        onClick={() => startSession(session._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                      >
                        <Play className="h-4 w-4" />
                        <span>Start</span>
                      </button>
                    )}
                    
                    {session.status === 'in_progress' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/sessions/${session._id}/attendance`)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Attendance</span>
                        </button>
                        <button
                          onClick={() => completeSession(session._id)}
                          className="bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-1"
                        >
                          <Pause className="h-4 w-4" />
                          <span>Complete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {session.actualStartTime && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span>Started: {new Date(session.actualStartTime).toLocaleTimeString()}</span>
                      {session.actualEndTime && (
                        <span>Ended: {new Date(session.actualEndTime).toLocaleTimeString()}</span>
                      )}
                      {session.actualStartTime && session.actualEndTime && (
                        <span className="font-medium text-purple-600">
                          Duration: {((new Date(session.actualEndTime) - new Date(session.actualStartTime)) / (1000 * 60 * 60)).toFixed(1)}h
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <p>{isCoach ? 'No sessions assigned to you yet' : 'No sessions assigned to this coach'}</p>
                {canAssignWork && (
                  <button
                    onClick={() => router.push(`/coaches/${params.id}/assign`)}
                    className="mt-2 text-blue-600 hover:text-blue-700"
                  >
                    Assign Work →
                  </button>
                )}
                {isCoach && (
                  <p className="mt-2 text-sm text-gray-400">
                    Contact your programme manager to get sessions assigned
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Home Visits */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">🏠 Home Visits ({workloadData?.homeVisits?.length || 0})</h2>
          
          <div className="space-y-4">
            {workloadData?.homeVisits && workloadData.homeVisits.length > 0 ? workloadData.homeVisits.map((visit) => (
              <div key={visit._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">Home Visit</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(visit.scheduledDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Child visit
                      </span>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    visit.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    visit.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {visit.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <p>No home visits assigned to this coach</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}