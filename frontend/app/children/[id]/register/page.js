'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { childAPI, programAPI, sessionAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ArrowLeft, Users, Calendar, BookOpen, CheckCircle } from 'lucide-react';

export default function ChildRegisterPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [child, setChild] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [childRes, programsRes, sessionsRes] = await Promise.all([
        childAPI.getById(id),
        programAPI.getAll(),
        sessionAPI.getAll()
      ]);
      
      const childData = childRes.data?.data?.child || childRes.data?.data || childRes.data;
      setChild(childData);
      setPrograms(programsRes.data?.data || []);
      setSessions(sessionsRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProgramRegister = async (programId) => {
    setRegistering(true);
    try {
      const program = programs.find(p => p._id === programId);
      const newProgramEntry = {
        type: program.type,
        location: program.location?.name || program.name,
        startDate: new Date(),
        isActive: true
      };
      
      // Update child with new program
      await childAPI.update(id, {
        programmes: [...(child.programmes || []), newProgramEntry]
      });
      
      // Update program enrollment count
      await programAPI.update(programId, {
        'enrollment.currentCount': (program.enrollment?.currentCount || 0) + 1
      });
      
      alert('Child registered for program successfully!');
      fetchData();
    } catch (error) {
      console.error('Error registering for program:', error);
      alert('Error registering for program');
    } finally {
      setRegistering(false);
    }
  };

  const handleSessionRegister = async (sessionId) => {
    setRegistering(true);
    try {
      // Add child to session attendance
      const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}/attendance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          childId: id,
          present: false,
          notes: 'Registered for session'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to register for session');
      }
      
      alert('Child registered for session successfully!');
      fetchData();
    } catch (error) {
      console.error('Error registering for session:', error);
      alert('Error registering for session');
    } finally {
      setRegistering(false);
    }
  };

  const isRegisteredForProgram = (programId) => {
    const program = programs.find(p => p._id === programId);
    return child?.programmes?.some(p => 
      p.type === program?.type && 
      p.location === (program?.location?.name || program?.name) &&
      p.isActive
    );
  };

  const isRegisteredForSession = (sessionId) => {
    const session = sessions.find(s => s._id === sessionId);
    return session?.attendance?.some(a => a.child?._id === id || a.child === id);
  };

  const canRegister = ['programme_director', 'programme_manager', 'coach'].includes(user?.role);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Child Not Found</h2>
          <Button onClick={() => router.push('/children')}>Back to Children</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.push(`/children/${id}`)} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Register {child.firstName} {child.lastName}
          </h1>
          <p className="text-gray-600">Register for programs and sessions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Programs */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            📚 Available Programs
          </h2>
          <div className="space-y-4">
            {programs.filter(p => p.status === 'active').map((program) => (
              <div key={program._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{program.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{program.type} Program</p>
                  </div>
                  {isRegisteredForProgram(program._id) ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Registered
                    </span>
                  ) : (
                    canRegister && (
                      <Button
                        size="sm"
                        onClick={() => handleProgramRegister(program._id)}
                        disabled={registering}
                        className="bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        Register
                      </Button>
                    )
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-2">{program.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>📍 {program.location?.name}</span>
                  <span>👥 {program.enrollment?.currentCount || 0}/{program.capacity?.max}</span>
                  <span>🎯 Ages {program.ageRange?.min}-{program.ageRange?.max}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sessions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            📅 Upcoming Sessions
          </h2>
          <div className="space-y-4">
            {sessions.filter(s => s.status === 'scheduled').map((session) => (
              <div key={session._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{session.title}</h3>
                    <p className="text-sm text-gray-600">
                      {session.scheduledDate ? new Date(session.scheduledDate).toLocaleDateString() : 'Date TBD'}
                    </p>
                  </div>
                  {isRegisteredForSession(session._id) ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Registered
                    </span>
                  ) : (
                    canRegister && (
                      <Button
                        size="sm"
                        onClick={() => handleSessionRegister(session._id)}
                        disabled={registering}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500"
                      >
                        Register
                      </Button>
                    )
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-2">{session.notes}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>📍 {session.location?.name}</span>
                  <span>⏰ {session.scheduledStartTime ? new Date(session.scheduledStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time TBD'}</span>
                  <span className="capitalize">🏷️ {session.type}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Current Registrations */}
      <Card className="p-6 mt-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          📋 Current Registrations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Programs</h3>
            {child.programmes && child.programmes.filter(p => p.isActive).length > 0 ? (
              <div className="space-y-2">
                {child.programmes.filter(p => p.isActive).map((programme, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium capitalize">{programme.type} - {programme.location}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No program registrations</p>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Sessions</h3>
            {sessions.filter(s => s.attendance?.some(a => a.child?._id === id || a.child === id)).length > 0 ? (
              <div className="space-y-2">
                {sessions.filter(s => s.attendance?.some(a => a.child?._id === id || a.child === id)).map(session => (
                  <div key={session._id} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">{session.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No session registrations</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}