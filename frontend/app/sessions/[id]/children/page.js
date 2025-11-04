'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { sessionAPI, childAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ArrowLeft, Users, Eye, Phone, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function SessionChildrenPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const sessionRes = await sessionAPI.getById(id);
      const sessionData = sessionRes.data?.data;
      
      // Get children from attendance
      const attendanceChildren = [];
      if (sessionData?.attendance) {
        for (const attendance of sessionData.attendance) {
          try {
            const childRes = await childAPI.getById(attendance.child._id || attendance.child);
            const childData = childRes.data?.data?.child || childRes.data?.data || childRes.data;
            attendanceChildren.push({
              ...childData,
              attendanceStatus: attendance.present,
              attendanceNotes: attendance.notes,
              markedAt: attendance.markedAt
            });
          } catch (error) {
            console.error('Error fetching child:', error);
          }
        }
      }
      
      setSession(sessionData);
      setChildren(attendanceChildren);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h2>
          <Button onClick={() => router.push('/sessions')}>Back to Sessions</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.push('/sessions')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            👥 Registered Participants
          </h1>
          <p className="text-gray-600">{session.title} - {children.length} participants</p>
        </div>
      </div>

      {/* Session Summary */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-blue-900">{session.title}</h2>
            <p className="text-blue-700 capitalize">{session.type} Session</p>
            <p className="text-blue-600">
              📅 {session.scheduledDate ? new Date(session.scheduledDate).toLocaleDateString() : 'Date TBD'}
              {session.scheduledStartTime && ` at ${new Date(session.scheduledStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
            </p>
            <p className="text-blue-600">📍 {typeof session.location === 'string' ? session.location : session.location?.name || 'Location TBD'}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-900">{children.length}</div>
            <div className="text-sm text-blue-600">registered participants</div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
              session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
              session.status === 'in_progress' ? 'bg-green-100 text-green-800' :
              session.status === 'completed' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {session.status === 'in_progress' ? '🟢 Ongoing' : 
               session.status === 'completed' ? '✅ Completed' :
               session.status === 'scheduled' ? '📋 Scheduled' : session.status}
            </span>
          </div>
        </div>
      </Card>

      {/* Children List */}
      {children.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child, index) => (
            <Card key={child._id} className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {child.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'CH'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{child.name}</h3>
                    <p className="text-sm text-gray-600">Age {child.age}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.status === 'completed' && (
                    child.attendanceStatus !== undefined ? (
                      child.attendanceStatus ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Present
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Absent
                        </span>
                      )
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        Not marked
                      </span>
                    )
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    child.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {child.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{child.guardianName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{child.guardianPhone}</span>
                </div>
                {child.guardianEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{child.guardianEmail}</span>
                  </div>
                )}
                {child.markedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Registered: {new Date(child.markedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {child.attendanceNotes && (
                <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800">
                    <strong>Notes:</strong> {child.attendanceNotes}
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100"
                onClick={() => router.push(`/children/${child._id}`)}
              >
                <Eye className="w-4 h-4" />
                View Profile
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-white">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Participants Registered</h3>
          <p className="text-gray-600 mb-4">This session doesn't have any registered participants yet.</p>
          <Button onClick={() => router.push('/children')} className="bg-gradient-to-r from-blue-500 to-purple-500">
            Browse Children
          </Button>
        </Card>
      )}
    </div>
  );
}