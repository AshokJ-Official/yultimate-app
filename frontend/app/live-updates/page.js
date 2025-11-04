'use client';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Bell, Zap, ArrowLeft, Sparkles, Trophy, Users, Calendar, Target, Radio, Activity } from 'lucide-react';

export default function LiveUpdatesPage() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [currentView, setCurrentView] = useState('selection'); // 'selection' or 'updates'
  const [socket, setSocket] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTournaments();
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (selectedTournament && socket && currentView === 'updates') {
      socket.emit('join-tournament', selectedTournament);
      socket.on('new-update', (update) => {
        console.log('Received new update:', update);
        setUpdates(prev => [update, ...prev]);
      });
      fetchUpdates();
    }
  }, [selectedTournament, socket, currentView]);

  const fetchTournaments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tournaments');
      const data = await response.json();
      if (data.success) setTournaments(data.data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchUpdates = async () => {
    try {
      console.log('Fetching updates for tournament:', selectedTournament);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/updates/tournament/${selectedTournament}?type=${filter !== 'all' ? filter : ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('Updates response:', data);
      if (data.success) setUpdates(data.data);
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentSelect = (tournamentId) => {
    console.log('Selected tournament:', tournamentId);
    setSelectedTournament(tournamentId);
    setCurrentView('updates');
  };

  const getUpdateIcon = (type) => {
    const icons = {
      announcement: '📢', match_start: '🏁', match_end: '🏆',
      score_update: '⚽', spirit_score: '🤝', team_registration: '👥',
      tournament_status: '🎯'
    };
    return icons[type] || '📝';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-300',
      high: 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-orange-300',
      medium: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-300',
      low: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-300'
    };
    return colors[priority] || colors.medium;
  };

  const getRandomGradient = (index) => {
    const gradients = [
      'from-pink-400 via-purple-500 to-indigo-600',
      'from-yellow-400 via-red-500 to-pink-600',
      'from-green-400 via-blue-500 to-purple-600',
      'from-blue-400 via-purple-500 to-pink-500',
      'from-indigo-400 via-purple-500 to-pink-500',
      'from-red-400 via-pink-500 to-purple-600'
    ];
    return gradients[index % gradients.length];
  };

  if (currentView === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-gradient-to-br from-blue-200/20 to-purple-200/20"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto p-6 pt-20">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
              <Radio className="w-12 h-12 text-white animate-ping" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              📡 Live Updates
            </h1>
            <p className="text-xl text-gray-600 mb-2">Stay connected with real-time tournament action</p>
            <div className="flex items-center justify-center space-x-2 text-purple-600">
              <Activity className="w-5 h-5 animate-bounce" />
              <span className="text-sm font-medium">Real-time • Instant • Live</span>
              <Activity className="w-5 h-5 animate-bounce" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament, index) => (
              <div
                key={tournament._id}
                onClick={() => handleTournamentSelect(tournament._id)}
                className={`bg-gradient-to-br ${getRandomGradient(index)} p-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300">
                    <Bell className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-200 transition-colors">
                    {tournament.title || tournament.name}
                  </h3>
                  
                  <p className="text-white/80 text-sm mb-4 line-clamp-2">
                    {tournament.description || 'Get live updates from this tournament'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-white/90">
                      <Trophy className="w-4 h-4" />
                      <span className="text-sm">Live</span>
                      <Zap className="w-4 h-4 ml-2 animate-pulse" />
                      <span className="text-sm">Updates</span>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <span className="text-white text-sm">→</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {tournaments.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Tournaments Found</h3>
              <p className="text-gray-500">Create a tournament to start receiving live updates</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const selectedTournamentData = tournaments.find(t => t._id === selectedTournament);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-50 to-purple-100">
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full bg-gradient-to-br from-cyan-200/20 to-purple-200/20"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl mb-8 overflow-hidden border border-white/20">
          <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentView('selection')}
                  className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                  <Radio className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">📡 {selectedTournamentData?.title || 'Live Updates'}</h1>
                  <p className="text-cyan-100">Real-time tournament updates</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-lg rounded-lg px-3 py-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm">Live</span>
                </div>
                <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-lg rounded-lg px-3 py-1">
                  <Activity className="w-4 h-4 text-yellow-300 animate-bounce" />
                  <span className="text-white text-sm">{updates.length} Updates</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-b">
            <div className="flex space-x-2">
              {['all', 'announcement', 'match_start', 'match_end', 'score_update'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    filter === type 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-blue-600 font-semibold">📡 Loading live updates...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.length === 0 ? (
              <div className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Bell className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-800 mb-2">📡 Waiting for Updates</h3>
                <p className="text-blue-600 text-lg">Stay tuned for live tournament action!</p>
                <div className="flex items-center justify-center space-x-2 mt-4 text-purple-600">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Connected and ready</span>
                  <Sparkles className="w-5 h-5 animate-spin" />
                </div>
              </div>
            ) : (
              updates.map((update, index) => (
                <div
                  key={update._id}
                  className={`bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border-l-4 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-102 ${getPriorityColor(update.priority)}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl animate-bounce">{getUpdateIcon(update.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{update.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${getPriorityColor(update.priority)}`}>
                          {update.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3 text-base">{update.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>By {update.author?.name}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(update.createdAt).toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Target className="w-4 h-4" />
                          <span className="capitalize">{update.targetAudience}</span>
                        </span>
                      </div>
                      
                      {update.metadata?.score && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2">
                            <Trophy className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-green-800">
                              Score: {update.metadata.score.team1} - {update.metadata.score.team2}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}