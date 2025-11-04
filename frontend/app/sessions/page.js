'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
// import { useSocket } from '@/lib/socket-context';
import { sessionAPI, childAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { Plus, Clock, Users, MapPin, Play, Pause, CheckCircle } from 'lucide-react';

export default function SessionsPage() {
  const { user } = useAuth();
  // const { socket } = useSocket();
  const [sessions, setSessions] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    type: 'school',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    maxParticipants: '',
    activities: ''
  });

  useEffect(() => {
    fetchData();
    
    // Socket integration disabled for now
    // if (socket) {
    //   socket.on('attendance-updated', handleAttendanceUpdate);
    //   return () => socket.off('attendance-updated', handleAttendanceUpdate);
    // }
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsResponse, childrenResponse] = await Promise.all([
        sessionAPI.getAll(),
        childAPI.getAll()
      ]);
      setSessions(sessionsResponse.data?.data || sessionsResponse.data || []);
      setChildren(childrenResponse.data?.data || childrenResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceUpdate = (data) => {
    setSessions(prev => prev.map(session => 
      session._id === data.sessionId ? { ...session, attendance: data.attendance } : session
    ));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const sessionData = {
        title: formData.title,
        type: formData.type,
        location: {
          name: formData.location
        },
        scheduledDate: formData.date,
        scheduledStartTime: new Date(`${formData.date}T${formData.startTime}`),
        scheduledEndTime: new Date(`${formData.date}T${formData.endTime}`),
        notes: formData.description,
        activities: formData.activities ? [{
          name: 'Session Activities',
          description: formData.activities
        }] : []
      };
      
      await sessionAPI.create(sessionData);
      setShowCreateModal(false);
      setFormData({
        title: '',
        type: 'school',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        maxParticipants: '',
        activities: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleStatusUpdate = async (sessionId, status) => {
    try {
      if (status === 'ongoing') {
        await sessionAPI.start(sessionId);
      } else if (status === 'completed') {
        await sessionAPI.complete(sessionId);
      }
      fetchData();
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  const openAttendanceModal = async (session) => {
    setSelectedSession(session);
    try {
      const response = await sessionAPI.getById(session._id);
      const attendance = response.data?.attendance || [];
      setAttendanceData(attendance);
      setShowAttendanceModal(true);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleAttendanceChange = (childId, status) => {
    setAttendanceData(prev => prev.map(item => 
      item.child._id === childId ? { ...item, status } : item
    ));
  };

  const handleAttendanceSubmit = async () => {
    try {
      await sessionAPI.markAttendance(selectedSession._id, { attendance: attendanceData });
      setShowAttendanceModal(false);
      setSelectedSession(null);
      setAttendanceData([]);
      fetchData();
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const canCreateSession = ['programme_director', 'programme_manager', 'coach'].includes(user?.role);
  const canManageSession = ['programme_director', 'programme_manager', 'coach'].includes(user?.role);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📅 Sessions
          </h1>
          <p className="text-gray-600 mt-2">Manage coaching sessions and attendance</p>
        </div>
        {canCreateSession && (
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg">
            <Plus className="w-4 h-4" />
            ✨ Create Session
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session, index) => (
          <motion.div
            key={session._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{session.title}</h3>
                  <div className="flex items-center gap-2">
                    {session.status === 'ongoing' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      session.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{session.description}</p>
                
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {session.scheduledDate ? new Date(session.scheduledDate).toLocaleDateString() : 'Date TBD'}
                      {session.scheduledStartTime && session.scheduledEndTime ? 
                        ` ${new Date(session.scheduledStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(session.scheduledEndTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 
                        ''
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{typeof session.location === 'string' ? session.location : session.location?.name || 'Location TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{session.attendance?.length || 0}/{session.maxParticipants || 'No limit'} participants</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {canManageSession && (
                    <>
                      {session.status === 'scheduled' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusUpdate(session._id, 'ongoing')}
                          className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          <Play className="w-3 h-3" />
                          Start
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.location.href = `/sessions/${session._id}/attendance`}
                        className="flex items-center gap-1 border-green-300 text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Attendance
                      </Button>
                      {session.status === 'ongoing' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusUpdate(session._id, 'completed')}
                          className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        >
                          <Pause className="w-3 h-3" />
                          Complete
                        </Button>
                      )}
                    </>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100"
                    onClick={() => window.location.href = `/sessions/${session._id}/children`}
                  >
                    <Users className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100"
                    onClick={() => window.location.href = `/sessions/${session._id}`}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Session">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Session Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              required
            >
              <option value="school">🏫 School Session</option>
              <option value="community">🏠 Community Session</option>
              <option value="workshop">🔧 Workshop Session</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
            <Input
              label="Start Time"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({...formData, endTime: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
            />
            <Input
              label="Max Participants"
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activities</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              value={formData.activities}
              onChange={(e) => setFormData({...formData, activities: e.target.value})}
              placeholder="List of planned activities..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Session</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAttendanceModal} onClose={() => setShowAttendanceModal(false)} title="Mark Attendance">
        {selectedSession && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">{selectedSession.title}</h3>
              <p className="text-sm text-gray-500">{new Date(selectedSession.date).toLocaleDateString()}</p>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {attendanceData.map((item) => (
                <div key={item.child._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {item.child?.firstName?.[0] || 'C'}{item.child?.lastName?.[0] || 'H'}
                    </div>
                    <span className="font-medium">{item.child?.firstName || 'Child'} {item.child?.lastName || 'Name'}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={item.status === 'present' ? 'default' : 'outline'}
                      onClick={() => handleAttendanceChange(item.child._id, 'present')}
                    >
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant={item.status === 'absent' ? 'default' : 'outline'}
                      onClick={() => handleAttendanceChange(item.child._id, 'absent')}
                    >
                      Absent
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAttendanceModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAttendanceSubmit}>Save Attendance</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}