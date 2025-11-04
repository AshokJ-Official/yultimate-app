'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { coachAPI } from '@/lib/api';
import { ArrowLeft, Clock, Play, Pause, Car, Home } from 'lucide-react';

export default function CoachTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const [currentActivity, setCurrentActivity] = useState(null);
  const [trackingData, setTrackingData] = useState({
    sessionTime: 0,
    travelTime: 0,
    totalTime: 0,
    status: 'idle'
  });
  const [timer, setTimer] = useState(0);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    let interval;
    if (isTracking) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const startTracking = (type) => {
    setCurrentActivity({ type, startTime: new Date() });
    setIsTracking(true);
    setTimer(0);
    setTrackingData(prev => ({ ...prev, status: type }));
  };

  const stopTracking = async () => {
    if (!currentActivity) return;

    const duration = Math.floor(timer / 60); // minutes
    const timeType = currentActivity.type === 'session' ? 'sessionTime' : 'travelTime';
    
    setTrackingData(prev => ({
      ...prev,
      [timeType]: prev[timeType] + duration,
      totalTime: prev.totalTime + duration,
      status: 'idle'
    }));

    setIsTracking(false);
    setCurrentActivity(null);
    setTimer(0);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              trackingData.status === 'session' ? 'bg-green-100 text-green-800' :
              trackingData.status === 'travel' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {trackingData.status === 'session' ? '🟢 In Session' :
               trackingData.status === 'travel' ? '🚗 Traveling' :
               '⏸️ Idle'}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">⏱️ Real-Time Tracking</h1>
          <p className="text-gray-600">Track coaching time, travel time, and activities</p>
        </div>

        {/* Current Activity Timer */}
        {isTracking && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentActivity?.type === 'session' ? '📚 Session in Progress' : '🚗 Travel in Progress'}
                </h2>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">{formatTime(timer)}</div>
                <button
                  onClick={stopTracking}
                  className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <Pause className="h-4 w-4" />
                  <span>Stop</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Time Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Session Time</p>
                <p className="text-2xl font-bold text-green-600">{Math.floor(trackingData.sessionTime / 60)}h {trackingData.sessionTime % 60}m</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Travel Time</p>
                <p className="text-2xl font-bold text-blue-600">{Math.floor(trackingData.travelTime / 60)}h {trackingData.travelTime % 60}m</p>
              </div>
              <Car className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Time</p>
                <p className="text-2xl font-bold text-purple-600">{Math.floor(trackingData.totalTime / 60)}h {trackingData.totalTime % 60}m</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => startTracking('session')}
              disabled={isTracking}
              className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <Play className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-green-800">Start Session</p>
                  <p className="text-sm text-green-600">Begin coaching time</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => startTracking('travel')}
              disabled={isTracking}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-blue-800">Start Travel</p>
                  <p className="text-sm text-blue-600">Track travel time</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => startTracking('visit')}
              disabled={isTracking}
              className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-purple-800">Community Visit</p>
                  <p className="text-sm text-purple-600">Track visit time</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}