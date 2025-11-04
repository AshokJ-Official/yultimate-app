'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { sessionAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ArrowLeft, Download, Users, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function SessionReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSessionData();
    }
  }, [id]);

  const fetchSessionData = async () => {
    try {
      const response = await sessionAPI.getById(id);
      const sessionData = response.data?.data || response.data;
      setSession(sessionData);
      setAttendance(sessionData.attendance || []);
    } catch (error) {
      console.error('Error fetching session data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const reportData = {
      session: session.title,
      date: new Date(session.date).toLocaleDateString(),
      time: `${session.startTime} - ${session.endTime}`,
      location: typeof session.location === 'string' ? session.location : session.location?.name || 'Location TBD',
      totalParticipants: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      attendanceRate: attendance.length > 0 ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) : 0
    };

    const csvContent = [
      ['Session Report'],
      ['Session', reportData.session],
      ['Date', reportData.date],
      ['Time', reportData.time],
      ['Location', reportData.location],
      ['Total Participants', reportData.totalParticipants],
      ['Present', reportData.present],
      ['Absent', reportData.absent],
      ['Attendance Rate', `${reportData.attendanceRate}%`],
      [''],
      ['Attendance Details'],
      ['Name', 'Status'],
      ...attendance.map(item => [
        `${item.child?.firstName || 'Unknown'} ${item.child?.lastName || 'Child'}`,
        item.status || 'Not marked'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-report-${session.title.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push(`/sessions/${id}`)} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Session Report</h1>
            <p className="text-gray-600">{session.title}</p>
          </div>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Stats */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Participants</p>
                  <p className="text-2xl font-bold text-gray-900">{attendance.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{attendanceRate}%</p>
                </div>
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  %
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Session Details */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Session Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{new Date(session.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium">{session.startTime} - {session.endTime}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-medium">{typeof session.location === 'string' ? session.location : session.location?.name || 'Location TBD'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Description</p>
              <p className="text-gray-900">{session.description}</p>
            </div>
            {session.activities && (
              <div>
                <p className="text-sm text-gray-600">Activities</p>
                <p className="text-gray-900">{session.activities}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Attendance Breakdown */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Attendance Breakdown</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Present</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{presentCount}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Absent</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${attendance.length > 0 ? (absentCount / attendance.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{absentCount}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Detailed Attendance */}
        <Card className="p-6 lg:col-span-3">
          <h2 className="text-xl font-bold mb-4">Detailed Attendance</h2>
          {attendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Age</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">
                        {item.child?.firstName || 'Unknown'} {item.child?.lastName || 'Child'}
                      </td>
                      <td className="py-2">{item.child?.age || 'N/A'}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'present' ? 'bg-green-100 text-green-800' :
                          item.status === 'absent' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status || 'Not marked'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No attendance data available</p>
          )}
        </Card>
      </div>
    </div>
  );
}