'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { coachAPI, sessionAPI, homeVisitAPI } from '@/lib/api';
import { ArrowLeft, Calendar, Home, Clock, MapPin, Save } from 'lucide-react';

export default function AssignWorkPage() {
  const params = useParams();
  const router = useRouter();
  const [coach, setCoach] = useState(null);
  const [availableSessions, setAvailableSessions] = useState([]);
  const [availableVisits, setAvailableVisits] = useState([]);
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [selectedVisits, setSelectedVisits] = useState([]);
  const [travelTime, setTravelTime] = useState(30);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      const [coachRes, sessionsRes, visitsRes] = await Promise.all([
        coachAPI.getWorkload(params.id),
        sessionAPI.getAll({ status: 'scheduled' }),
        homeVisitAPI.getAll({ status: 'scheduled' })
      ]);

      setCoach(coachRes.data?.coach || { name: 'Coach' });
      setAvailableSessions(sessionsRes.data?.data || []);
      setAvailableVisits(visitsRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignWork = async () => {
    setSaving(true);
    try {
      await coachAPI.assignWork(params.id, {
        sessionIds: selectedSessions,
        homeVisitIds: selectedVisits,
        travelTime,
        notes
      });
      
      alert('Work assigned successfully!');
      // Force refresh the coach workload page
      window.location.href = `/coaches/${params.id}`;
    } catch (error) {
      console.error('Error assigning work:', error);
      alert('Error assigning work');
    } finally {
      setSaving(false);
    }
  };

  const toggleSession = (sessionId) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const toggleVisit = (visitId) => {
    setSelectedVisits(prev => 
      prev.includes(visitId) 
        ? prev.filter(id => id !== visitId)
        : [...prev, visitId]
    );
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
            <button
              onClick={handleAssignWork}
              disabled={saving || (selectedSessions.length === 0 && selectedVisits.length === 0)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Assigning...' : 'Assign Work'}</span>
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">👨🏫 Assign Work</h1>
          <p className="text-gray-600">Assign sessions and home visits to {coach?.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Sessions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Available Sessions ({selectedSessions.length} selected)
            </h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableSessions.map((session) => (
                <div
                  key={session._id}
                  onClick={() => toggleSession(session._id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedSessions.includes(session._id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{session.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(session.scheduledDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {session.location?.name}
                        </span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      selectedSessions.includes(session._id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedSessions.includes(session._id) && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Home Visits */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Home className="h-5 w-5 mr-2 text-green-600" />
              Available Home Visits ({selectedVisits.length} selected)
            </h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableVisits.map((visit) => (
                <div
                  key={visit._id}
                  onClick={() => toggleVisit(visit._id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedVisits.includes(visit._id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">Home Visit</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(visit.scheduledDate).toLocaleDateString()}
                        </span>
                        <span>Child: {visit.child?.name}</span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      selectedVisits.includes(visit._id)
                        ? 'bg-green-600 border-green-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedVisits.includes(visit._id) && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assignment Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Assignment Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Travel Time (minutes)
              </label>
              <input
                type="number"
                value={travelTime}
                onChange={(e) => setTravelTime(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="180"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Additional notes for the coach..."
              />
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Assignment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Sessions:</span>
                <span className="ml-2 font-medium text-blue-600">{selectedSessions.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Home Visits:</span>
                <span className="ml-2 font-medium text-green-600">{selectedVisits.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Est. Travel Time:</span>
                <span className="ml-2 font-medium text-purple-600">
                  {(selectedSessions.length + selectedVisits.length) * travelTime} min
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}