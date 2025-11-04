'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, HeartOff, Bell, BellOff, Trophy, Users, Calendar, Search, Filter, Star, Zap, TrendingUp, Award, Target, Clock, Flame } from 'lucide-react';

export default function FanFollowing() {
  const [followedTeams, setFollowedTeams] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('following');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [recentActivity, setRecentActivity] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchFollowedTeams();
    fetchAvailableTeams();
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/matches/live', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        const formattedActivity = data.data.map(match => ({
          id: match._id,
          type: 'live_match',
          teamA: match.teamA.name,
          teamB: match.teamB.name,
          scoreA: match.score?.teamA || 0,
          scoreB: match.score?.teamB || 0,
          field: match.field,
          time: new Date(match.actualStartTime || match.scheduledTime).toLocaleTimeString(),
          icon: Zap
        }));
        setRecentActivity(formattedActivity);
      }
    } catch (error) {
      console.error('Error fetching live matches:', error);
    }
  };

  const fetchFollowedTeams = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/follow/my-teams', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setFollowedTeams(data.data);
    } catch (error) {
      console.error('Error fetching followed teams:', error);
    }
  };

  const fetchAvailableTeams = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/teams');
      const data = await response.json();
      if (data.success) setAvailableTeams(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setLoading(false);
    }
  };

  const followTeam = async (teamId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/follow/teams/${teamId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchFollowedTeams();
        fetchAvailableTeams();
      }
    } catch (error) {
      console.error('Error following team:', error);
    }
  };

  const unfollowTeam = async (teamId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/follow/teams/${teamId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchFollowedTeams();
        fetchAvailableTeams();
      }
    } catch (error) {
      console.error('Error unfollowing team:', error);
    }
  };

  const updateNotifications = async (teamId, notifications) => {
    try {
      const response = await fetch(`http://localhost:5000/api/follow/teams/${teamId}/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notifications })
      });
      const data = await response.json();
      if (data.success) fetchFollowedTeams();
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };

  const filteredTeams = availableTeams
    .filter(team => !followedTeams.some(follow => follow.team._id === team._id))
    .filter(team => team.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(team => {
      if (filterBy === 'all') return true;
      if (filterBy === 'active') return team.tournament?.status === 'active';
      if (filterBy === 'top') return (team.stats?.wins || 0) > 5;
      return true;
    });

  const filteredFollowed = followedTeams
    .filter(follow => follow.team.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-blue-200 to-orange-300 p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-orange-300 to-blue-300 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-300 to-orange-300 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-orange-400 to-blue-400 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>
      <div className="max-w-7xl mx-auto">
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 to-blue-400/30 rounded-3xl blur-3xl" />
          <div className="relative z-10 p-8">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="inline-block mb-4"
            >
              <Heart className="text-6xl text-pink-400" />
            </motion.div>
            <h1 className="text-5xl font-bold mb-4 text-gray-800">
              Fan Following Hub
            </h1>
            <p className="text-xl text-gray-800 mb-6">Connect with your favorite teams and never miss a moment</p>
            <div className="flex justify-center items-center space-x-6 text-sm text-gray-800">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{followedTeams.length} Teams Following</span>
              </div>
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Live Updates Active</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-3 bg-white/50 rounded-xl text-gray-700 hover:bg-white/70 transition-all"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>
            
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-300"
                >
                  <div className="flex flex-wrap gap-2">
                    {['all', 'active', 'top'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setFilterBy(filter)}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${
                          filterBy === filter
                            ? 'bg-orange-500 text-white'
                            : 'bg-white/50 text-gray-700 hover:bg-white/70'
                        }`}
                      >
                        {filter === 'all' ? 'All Teams' : filter === 'active' ? 'Active Tournaments' : 'Top Performers'}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-1 border border-white/40 shadow-lg">
            <button
              onClick={() => setActiveTab('following')}
              className={`px-8 py-3 rounded-xl transition-all font-medium ${
                activeTab === 'following'
                  ? 'bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-white/50'
              }`}
            >
              Following ({followedTeams.length})
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-8 py-3 rounded-xl transition-all font-medium ${
                activeTab === 'discover'
                  ? 'bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-lg'
                  : 'text-black hover:bg-white/50'
              }`}
            >
              Discover Teams
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-8 py-3 rounded-xl transition-all font-medium ${
                activeTab === 'activity'
                  ? 'bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-lg'
                  : 'text-black hover:bg-white/50'
              }`}
            >
              Live Matches
            </button>
          </div>
        </div>

        {/* Following Tab */}
        {activeTab === 'following' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredFollowed.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Heart className="text-6xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-800 text-lg">You're not following any teams yet</p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Discover Teams
                </button>
              </div>
            ) : (
              filteredFollowed.map((follow) => (
                <motion.div
                  key={follow._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-300 hover:border-orange-400 transition-all duration-300 relative overflow-hidden shadow-lg"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-300/30 to-blue-300/30 rounded-full blur-xl" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {follow.team.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-gray-800 font-semibold">{follow.team.name}</h3>
                        <p className="text-gray-600 text-sm">
                          Following since {new Date(follow.followedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => unfollowTeam(follow.team._id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <HeartOff className="text-xl" />
                    </button>
                  </div>

                  {/* Team Stats */}
                  {follow.team.stats && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center">
                        <div className="text-gray-800 font-bold">{follow.team.stats.wins || 0}</div>
                        <div className="text-gray-600 text-xs">Wins</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-800 font-bold">{follow.team.stats.losses || 0}</div>
                        <div className="text-gray-600 text-xs">Losses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-800 font-bold">{follow.team.stats.draws || 0}</div>
                        <div className="text-gray-600 text-xs">Draws</div>
                      </div>
                    </div>
                  )}

                  {/* Notification Settings */}
                  <div className="space-y-2">
                    <h4 className="text-gray-800 text-sm font-medium">Notifications</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(follow.notifications).map(([key, value]) => (
                        <label key={key} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => {
                              const newNotifications = { ...follow.notifications, [key]: e.target.checked };
                              updateNotifications(follow.team._id, newNotifications);
                            }}
                            className="rounded"
                          />
                          <span className="text-gray-600 text-xs capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTeams.map((team) => (
                <motion.div
                  key={team._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-300 hover:border-blue-400 transition-all duration-300 relative overflow-hidden group shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-300/20 to-orange-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {team.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-gray-800 font-semibold">{team.name}</h3>
                        <p className="text-gray-600 text-sm">
                          {team.players?.length || 0} players
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => followTeam(team._id)}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-2 rounded-lg hover:shadow-lg transition-all"
                    >
                      <Heart />
                    </button>
                  </div>

                  {/* Team Info */}
                  <div className="space-y-2">
                    {team.tournament && (
                      <div className="flex items-center space-x-2 text-gray-600 text-sm">
                        <Trophy className="text-yellow-500" />
                        <span>{team.tournament.name}</span>
                      </div>
                    )}
                    {team.stats && (
                      <div className="flex items-center space-x-4 text-gray-600 text-sm">
                        <span>W: {team.stats.wins || 0}</span>
                        <span>L: {team.stats.losses || 0}</span>
                        <span>D: {team.stats.draws || 0}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
          </motion.div>
        )}

        {/* Live Activity Tab */}
        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-300 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <Zap className="text-yellow-400" />
                <span>Live Matches</span>
              </h3>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500/20 text-green-400">
                      <activity.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-800">{activity.teamA} vs {activity.teamB}</span>
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-700 rounded-full">
                          LIVE
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">Score: {activity.scoreA} - {activity.scoreB} | Field: {activity.field}</p>
                    </div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </motion.div>
                ))}
              </div>
            </div>


          </motion.div>
        )}
      </div>
    </div>
  );
}