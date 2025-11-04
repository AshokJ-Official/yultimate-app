'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { coachAPI } from '@/lib/api';
import { Clock, Users, Home, Calendar, TrendingUp, Eye } from 'lucide-react';

export default function CoachesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const isCoach = user?.role === 'coach';
  const canAssignWork = ['programme_manager', 'programme_director'].includes(user?.role);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const refreshData = () => {
    setLoading(true);
    fetchCoaches();
  };

  const fetchCoaches = async () => {
    try {
      const response = await coachAPI.getAll();
      console.log('Coaches response:', response.data);
      setCoaches(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">👨‍🏫 Coach Management</h1>
          <p className="text-gray-600">Monitor coach workloads and activities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((coach) => (
            <div key={coach._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {coach.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{coach.name}</h3>
                    <p className="text-sm text-gray-600">{coach.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/coaches/${coach._id}`)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <Calendar className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-blue-600">{coach.weeklyStats?.sessions || 0}</div>
                  <div className="text-xs text-blue-700">Sessions</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <Home className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-green-600">{coach.weeklyStats?.homeVisits || 0}</div>
                  <div className="text-xs text-green-700">Visits</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium text-green-600">{coach.weeklyStats?.completedSessions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Upcoming:</span>
                  <span className="font-medium text-blue-600">{coach.weeklyStats?.upcomingSessions || 0}</span>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => router.push(`/coaches/${coach._id}`)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
                >
                  {isCoach ? 'My Workload' : 'View Workload'}
                </button>
                {canAssignWork && (
                  <button
                    onClick={() => router.push(`/coaches/${coach._id}/assign`)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors"
                  >
                    Assign Work
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}