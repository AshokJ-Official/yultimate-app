'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tournamentAPI, teamAPI, matchAPI, spiritAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useSocket } from '@/lib/socket-context';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { 
  Settings, Users, Calendar, Trophy, BarChart3, Download, Plus, Edit, Eye, CheckCircle, XCircle, Clock, FileText, Send, UserCheck, Award, ArrowLeft, Zap, Activity, Radio, Cloud, Sun, CloudRain, Wind, Thermometer, MapPin, Globe, Database, TrendingUp, UserPlus, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function TournamentManagePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState({});
  const [weather, setWeather] = useState({ temp: 22, condition: 'sunny', humidity: 65, wind: 12 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [updateForm, setUpdateForm] = useState({ title: '', message: '', priority: 'medium', type: 'announcement', targetAudience: 'all' });


  const [leaderboardData, setLeaderboardData] = useState({ teams: [], spirit: [] });
  const [historicalData, setHistoricalData] = useState({ tournaments: [], analytics: {} });
  const [repositoryData, setRepositoryData] = useState({ documents: [], exports: [] });

  // Role-based permissions
  const permissions = {
    canManageSettings: ['tournament_director'].includes(user?.role),
    canApproveTeams: ['tournament_director', 'volunteer'].includes(user?.role),
    canManageMatches: ['tournament_director', 'scoring_team', 'volunteer'].includes(user?.role),
    canViewReports: ['tournament_director', 'reporting_team', 'volunteer'].includes(user?.role),
    canSendUpdates: ['tournament_director', 'volunteer'].includes(user?.role),
    canManageSpirit: ['tournament_director', 'scoring_team', 'volunteer'].includes(user?.role),
    canExportData: ['tournament_director', 'reporting_team'].includes(user?.role)
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Check if user has tournament access
    const tournamentRoles = ['tournament_director', 'team_manager', 'volunteer', 'scoring_team', 'reporting_team'];
    if (!tournamentRoles.includes(user.role)) {
      router.push('/dashboard');
      return;
    }

    fetchTournamentData();
    fetchLiveUpdates();
  }, [id, user]);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      const [tournamentRes, teamsRes, matchesRes] = await Promise.all([
        tournamentAPI.getById(id),
        teamAPI.getByTournament(id),
        matchAPI.getByTournament(id)
      ]);

      const tournamentData = tournamentRes.data.data || tournamentRes.data;
      const teamsData = teamsRes.data.data || teamsRes.data || [];
      const matchesData = matchesRes.data.data || matchesRes.data || [];
      
      setTournament(tournamentData);
      setTeams(teamsData);
      setMatches(matchesData);

      // Calculate stats using the fetched data
      const pendingTeams = teamsData.filter(t => t.status === 'pending').length;
      const approvedTeams = teamsData.filter(t => t.status === 'approved').length;
      const completedMatches = matchesData.filter(m => m.status === 'completed').length;
      const upcomingMatches = matchesData.filter(m => m.status === 'scheduled' || m.status === 'upcoming').length;

      setStats({
        totalTeams: teamsData.length,
        pendingTeams,
        approvedTeams,
        totalMatches: matchesData.length,
        completedMatches,
        upcomingMatches
      });
    } catch (error) {
      console.error('Error fetching tournament data:', error);
      // Set empty stats on error
      setStats({
        totalTeams: 0,
        pendingTeams: 0,
        approvedTeams: 0,
        totalMatches: 0,
        completedMatches: 0,
        upcomingMatches: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTeamAction = async (teamId, action) => {
    try {
      if (action === 'approve' || action === 'reject') {
        await teamAPI.updateStatus(teamId, action === 'approve' ? 'approved' : 'rejected');
      }
      fetchTournamentData();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating team:', error);
    }
  };

  const handleMatchAction = async (matchId, action) => {
    try {
      if (action === 'complete') {
        await matchAPI.complete(matchId);
      }
      fetchTournamentData();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating match:', error);
    }
  };

  const handleExportData = async (type) => {
    try {
      let response;
      switch (type) {
        case 'teams':
          response = await tournamentAPI.exportTeams(id);
          break;
        case 'matches':
          response = await tournamentAPI.exportMatches(id);
          break;
        case 'players':
          response = await tournamentAPI.exportPlayers(id);
          break;
        default:
          response = await tournamentAPI.exportData(id);
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tournament?.title}-${type}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleSendUpdate = async (updateData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/updates/tournament/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...updateData,
          author: user._id
        })
      });
      
      if (response.ok) {
        if (socket) {
          socket.emit('new-announcement', { ...updateData, tournamentId: id });
        }
        alert('Update sent successfully!');
        // Refresh live updates count
        setLiveUpdates(prev => [...prev, updateData]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send update');
      }
    } catch (error) {
      console.error('Error sending update:', error);
      alert('Error sending update: ' + error.message);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'approveTeams':
        setActiveTab('teams');
        break;
      case 'editTournament':
        setModalType('editTournament');
        setShowModal(true);
        break;
      case 'multiField':
        setModalType('multiField');
        setShowModal(true);
        break;
      case 'visitorRegistration':
        setModalType('visitorRegistration');
        setShowModal(true);
        break;
      case 'scheduleBuilder':
        window.open(`/tournaments/${id}/schedule-builder`, '_blank');
        break;
      default:
        console.log('Action not implemented:', action);
    }
  };

  const fetchLeaderboardData = async () => {
    try {
      const [teamsRes, spiritRes] = await Promise.all([
        fetch(`http://localhost:5000/api/tournaments/${id}/leaderboard`),
        spiritAPI.getLeaderboard(id)
      ]);
      
      const teamsData = teamsRes.ok ? await teamsRes.json() : { data: [] };
      setLeaderboardData({
        teams: teamsData.data || [],
        spirit: spiritRes.data?.data || []
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reports/historical/${id}`);
      if (response.ok) {
        const data = await response.json();
        setHistoricalData(data.data || { tournaments: [], analytics: {} });
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  const fetchRepositoryData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tournaments/${id}/repository`);
      if (response.ok) {
        const data = await response.json();
        setRepositoryData(data.data || { documents: [], exports: [] });
      }
    } catch (error) {
      console.error('Error fetching repository data:', error);
    }
  };

  const fetchLiveUpdates = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/updates/tournament/${id}`);
      if (response.ok) {
        const data = await response.json();
        setLiveUpdates(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching live updates:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'matches', label: 'Matches', icon: Calendar },
    { id: 'spirit', label: 'Spirit Scores', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings, permission: 'canManageSettings' }
  ].filter(tab => !tab.permission || permissions[tab.permission]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/tournaments">
                <Button variant="ghost" className="text-white hover:bg-white/20 p-2">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{tournament?.title}</h1>
                <div className="flex items-center gap-6 text-white/90">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{tournament?.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(tournament?.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm">Live Management</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Weather Widget */}
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {weather.condition === 'sunny' ? '☀️' : weather.condition === 'cloudy' ? '☁️' : '🌧️'}
                  </div>
                  <div>
                    <div className="text-lg font-bold">{weather.temp}°C</div>
                    <div className="text-xs opacity-80">Perfect for Ultimate!</div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => { setModalType('leaderboard'); setShowModal(true); }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboards
                </Button>
                <Button 
                  onClick={() => { setModalType('historical'); setShowModal(true); }}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Historical Data
                </Button>
                <Button 
                  onClick={() => { setModalType('repository'); setShowModal(true); }}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Repository
                </Button>
                <Button 
                  onClick={() => { setModalType('realtime'); setShowModal(true); }}
                  className="bg-red-500 hover:bg-red-600 text-white animate-pulse"
                >
                  <Radio className="w-4 h-4 mr-2" />
                  Real-Time Updates
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-6">

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Teams</p>
                <p className="text-3xl font-bold">{stats.totalTeams}</p>
              </div>
              <Users className="w-10 h-10 text-blue-200" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Pending</p>
                <p className="text-3xl font-bold">{stats.pendingTeams}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Completed</p>
                <p className="text-3xl font-bold">{stats.completedMatches}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Upcoming</p>
                <p className="text-3xl font-bold">{stats.upcomingMatches}</p>
              </div>
              <Calendar className="w-10 h-10 text-purple-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">Visitors</p>
                <p className="text-3xl font-bold">{tournament?.visitors?.length || 0}</p>
              </div>
              <UserPlus className="w-10 h-10 text-pink-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Live Updates</p>
                <p className="text-3xl font-bold">{liveUpdates.length}</p>
              </div>
              <Activity className="w-10 h-10 text-indigo-200" />
            </div>
          </motion.div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl mb-8 overflow-hidden border border-white/20">
          <nav className="flex space-x-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Enhanced Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {activeTab === 'overview' && (
              <OverviewTab 
                tournament={tournament} 
                stats={stats} 
                permissions={permissions}
                weather={weather}
                onAction={handleQuickAction}
              />
            )}

            {activeTab === 'teams' && (
              <TeamsTab 
                teams={teams} 
                permissions={permissions}
                onAction={handleTeamAction}
                onViewDetails={(team) => {
                  setSelectedItem(team);
                  setModalType('teamDetails');
                  setShowModal(true);
                }}
              />
            )}

            {activeTab === 'matches' && (
              <MatchesTab 
                matches={matches} 
                permissions={permissions}
                onAction={handleMatchAction}
                onViewDetails={(match) => {
                  setSelectedItem(match);
                  setModalType('matchDetails');
                  setShowModal(true);
                }}
              />
            )}

            {activeTab === 'spirit' && (
              <SpiritTab 
                tournamentId={id}
                permissions={permissions}
              />
            )}

            {activeTab === 'settings' && permissions.canManageSettings && (
              <SettingsTab 
                tournament={tournament}
                onUpdate={fetchTournamentData}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Enhanced Modals */}
        <AnimatePresence>
          {showModal && (
            <Modal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              title={getModalTitle(modalType)}
            >
              <ModalContent 
                type={modalType}
                item={selectedItem}
                tournament={tournament}
                updateForm={updateForm}
                setUpdateForm={setUpdateForm}
                onAction={async (action, data) => {
                  try {
                    if (modalType === 'leaderboard') {
                      if (action === 'viewLeaderboard') {
                        window.open('/leaderboard', '_blank');
                      } else if (action === 'viewSpiritLeaderboard') {
                        window.open('/spirit-leaderboard', '_blank');
                      }
                    } else if (modalType === 'historical') {
                      if (action === 'viewReports') {
                        window.open('/reports', '_blank');
                      } else if (action === 'viewAnalytics') {
                        window.open('/reports', '_blank');
                      }
                    } else if (modalType === 'repository') {
                      if (action === 'viewExports') {
                        window.open('/export', '_blank');
                      } else if (action === 'viewDocuments') {
                        alert('Document repository feature coming soon!');
                      }
                    } else if (modalType === 'teamDetails') {
                      if (action === 'approve') {
                        await handleTeamAction(data._id, 'approve');
                      } else if (action === 'reject') {
                        await handleTeamAction(data._id, 'reject');
                      }
                    } else if (modalType === 'matchDetails') {
                      if (action === 'complete') {
                        await handleMatchAction(data._id, 'complete');
                      } else if (action === 'viewLive') {
                        window.open(`/matches/${data._id}`, '_blank');
                      }
                    } else if (modalType === 'realtime') {
                      await handleSendUpdate(data);
                      // Reset form after successful send
                      setUpdateForm({ title: '', message: '', priority: 'medium', type: 'announcement', targetAudience: 'all' });
                    } else if (modalType === 'editTournament' && action === 'updateTournament') {
                      await tournamentAPI.update(id, data);
                      await fetchTournamentData();
                      alert('Tournament updated successfully!');
                    } else if (modalType === 'multiField' && action === 'updateFields') {
                      await tournamentAPI.update(id, { fields: data.fields });
                      await fetchTournamentData();
                      alert('Fields updated successfully!');
                    } else if (modalType === 'visitorRegistration' && action === 'updateVisitorSettings') {
                      await tournamentAPI.update(id, { settings: { ...tournament.settings, ...data } });
                      await fetchTournamentData();
                      alert('Visitor settings updated successfully!');
                    }
                    
                    setShowModal(false);
                  } catch (error) {
                    console.error('Error:', error);
                    alert('Error: ' + (error.response?.data?.message || error.message));
                  }
                }}
              />
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Enhanced Overview Tab Component
function OverviewTab({ tournament, stats, permissions, weather, onAction }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tournament Status Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20"
      >
        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Tournament Status</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              tournament?.status === 'ongoing' ? 'bg-green-100 text-green-800' :
              tournament?.status === 'open' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {tournament?.status?.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Start Date:</span>
            <span className="font-medium">{new Date(tournament?.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">End Date:</span>
            <span className="font-medium">{new Date(tournament?.endDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Location:</span>
            <span className="font-medium">{tournament?.location}</span>
          </div>
        </div>
      </motion.div>

      {/* Weather & Conditions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-6 text-white shadow-xl"
      >
        <h3 className="text-xl font-bold mb-6">🌤️ Field Conditions</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              <span>Temperature</span>
            </div>
            <span className="text-2xl font-bold">{weather.temp}°C</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5" />
              <span>Wind Speed</span>
            </div>
            <span className="font-semibold">{weather.wind} km/h</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              <span>Humidity</span>
            </div>
            <span className="font-semibold">{weather.humidity}%</span>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <span className="text-sm">Perfect conditions for Ultimate! 🥏</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20"
      >
        <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Quick Actions</h3>
        <div className="space-y-3">
          {permissions.canApproveTeams && (
            <Button 
              className="w-full justify-start bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              onClick={() => onAction('approveTeams')}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Review Applications ({stats.pendingTeams})
            </Button>
          )}
          <Button 
            className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            onClick={() => onAction('editTournament')}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Tournament Details
          </Button>
          <Button 
            className="w-full justify-start bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
            onClick={() => onAction('multiField')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Multi-Field Support
          </Button>
          <Button 
            className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            onClick={() => onAction('visitorRegistration')}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Visitor Registration
          </Button>
          <Button 
            className="w-full justify-start bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
            onClick={() => onAction('scheduleBuilder')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Builder
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// Teams Tab Component
function TeamsTab({ teams, permissions, onAction, onViewDetails }) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Team Management</h3>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500">
            {teams.filter(t => t.status === 'pending').length} pending approval
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Players</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teams.map((team) => (
              <tr key={team._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{team.name}</div>
                  <div className="text-sm text-gray-500">{team.homeCity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{team.manager?.name}</div>
                  <div className="text-sm text-gray-500">{team.contactEmail}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {team.players?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs ${
                    team.status === 'approved' ? 'bg-green-100 text-green-800' :
                    team.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {team.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onViewDetails(team)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {permissions.canApproveTeams && team.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onAction(team._id, 'approve')}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onAction(team._id, 'reject')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// Matches Tab Component
function MatchesTab({ matches, permissions, onAction, onViewDetails }) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Match Management</h3>
      </div>
      
      <div className="space-y-4">
        {matches.map((match) => (
          <div key={match._id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">
                  {match.teamA?.name} vs {match.teamB?.name}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(match.scheduledTime).toLocaleString()} • Field {match.field}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded text-xs ${
                  match.status === 'completed' ? 'bg-green-100 text-green-800' :
                  match.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {match.status}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewDetails(match)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {permissions.canManageMatches && match.status !== 'completed' && (
                    <button
                      onClick={() => onAction(match._id, 'complete')}
                      className="text-green-600 hover:text-green-900"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Spirit Tab Component
function SpiritTab({ tournamentId, permissions }) {
  const [spiritData, setSpiritData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpiritData();
  }, [tournamentId]);

  const fetchSpiritData = async () => {
    try {
      const response = await spiritAPI.getLeaderboard(tournamentId);
      setSpiritData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching spirit data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading spirit scores...</div>;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Spirit Score Management</h3>
      
      <div className="space-y-4">
        {spiritData.map((team, index) => (
          <div key={team.team.id} className="flex justify-between items-center p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">{index + 1}</span>
              </div>
              <div>
                <div className="font-medium">{team.team.name}</div>
                <div className="text-sm text-gray-500">{team.gamesPlayed} games played</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">{team.averageSpiritScore}</div>
              <div className="text-sm text-gray-500">Average Spirit</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Settings Tab Component
function SettingsTab({ tournament, onUpdate }) {
  const [settings, setSettings] = useState({
    status: tournament?.status || 'draft',
    allowSpectatorRegistration: tournament?.settings?.allowSpectatorRegistration || false,
    maxTeams: tournament?.maxTeams || 16,
    registrationDeadline: tournament?.registrationDeadline || ''
  });

  const handleSave = async () => {
    try {
      await tournamentAPI.update(tournament._id, settings);
      onUpdate();
    } catch (error) {
      console.error('Error updating tournament:', error);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Tournament Settings</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tournament Status
          </label>
          <select
            value={settings.status}
            onChange={(e) => setSettings({...settings, status: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="draft">Draft</option>
            <option value="open">Open for Registration</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.allowSpectatorRegistration}
              onChange={(e) => setSettings({...settings, allowSpectatorRegistration: e.target.checked})}
              className="mr-2"
            />
            Allow Spectator Registration
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Teams
          </label>
          <input
            type="number"
            value={settings.maxTeams}
            onChange={(e) => setSettings({...settings, maxTeams: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Settings
        </Button>
      </div>
    </Card>
  );
}

// Enhanced Modal Content Component
function ModalContent({ type, item, tournament, updateForm, setUpdateForm, onAction }) {
  // Ensure updateForm has default values
  const safeUpdateForm = updateForm || { title: '', message: '', priority: 'medium', type: 'announcement', targetAudience: 'all' };
  const [editForm, setEditForm] = useState({
    title: tournament?.title || '',
    description: tournament?.description || '',
    location: tournament?.location || '',
    startDate: tournament?.startDate?.split('T')[0] || '',
    endDate: tournament?.endDate?.split('T')[0] || '',
    maxTeams: tournament?.maxTeams || 16
  });
  
  const [fieldForm, setFieldForm] = useState({
    fields: tournament?.fields || [{ name: 'Field 1', capacity: 100 }]
  });
  
  const [visitorForm, setVisitorForm] = useState({
    allowVisitors: tournament?.settings?.allowVisitors || true,
    visitorFee: tournament?.settings?.visitorFee || 0,
    maxVisitors: tournament?.settings?.maxVisitors || 200
  });
  if (type === 'leaderboard') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900">Tournament Leaderboards</h3>
          <p className="text-gray-600">View comprehensive rankings and standings</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={() => onAction('viewLeaderboard')} 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 h-auto"
          >
            <div className="text-center">
              <Trophy className="w-12 h-12 mx-auto mb-3" />
              <div className="text-lg font-bold">Team Rankings</div>
              <div className="text-sm opacity-90">Current tournament standings</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => onAction('viewSpiritLeaderboard')} 
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 h-auto"
          >
            <div className="text-center">
              <Award className="w-12 h-12 mx-auto mb-3" />
              <div className="text-lg font-bold">Spirit Scores</div>
              <div className="text-sm opacity-90">Fair play rankings</div>
            </div>
          </Button>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-blue-800 text-sm">
            💡 <strong>Tip:</strong> Leaderboards are automatically updated after each match completion
          </p>
        </div>
      </div>
    );
  }

  if (type === 'historical') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Database className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900">Historical Data & Reports</h3>
          <p className="text-gray-600">Access comprehensive analytics and historical data</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <Button 
            onClick={() => onAction('viewReports')} 
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-6 h-auto justify-start"
          >
            <div className="flex items-center gap-4">
              <FileText className="w-12 h-12" />
              <div className="text-left">
                <div className="text-lg font-bold">Tournament Reports</div>
                <div className="text-sm opacity-90">Comprehensive tournament analytics and insights</div>
              </div>
            </div>
          </Button>
          
          <Button 
            onClick={() => onAction('viewAnalytics')} 
            variant="outline" 
            className="p-6 h-auto justify-start"
          >
            <div className="flex items-center gap-4">
              <BarChart3 className="w-12 h-12 text-purple-600" />
              <div className="text-left">
                <div className="text-lg font-bold text-gray-900">Performance Analytics</div>
                <div className="text-sm text-gray-600">Detailed performance metrics and trends</div>
              </div>
            </div>
          </Button>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <p className="text-purple-800 text-sm">
            📊 <strong>Note:</strong> Reports include team performance, match statistics, and spirit score analytics
          </p>
        </div>
      </div>
    );
  }

  if (type === 'repository') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Globe className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900">Data Export & Repository</h3>
          <p className="text-gray-600">Export tournament data and access documents</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <Button 
            onClick={() => onAction('viewExports')} 
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6 h-auto justify-start"
          >
            <div className="flex items-center gap-4">
              <Download className="w-12 h-12" />
              <div className="text-left">
                <div className="text-lg font-bold">Data Export Center</div>
                <div className="text-sm opacity-90">Export matches, teams, and player data</div>
              </div>
            </div>
          </Button>
          
          <Button 
            onClick={() => onAction('viewDocuments')} 
            variant="outline" 
            className="p-6 h-auto justify-start"
          >
            <div className="flex items-center gap-4">
              <FileText className="w-12 h-12 text-green-600" />
              <div className="text-left">
                <div className="text-lg font-bold text-gray-900">Tournament Documents</div>
                <div className="text-sm text-gray-600">Rules, forms, and official documents</div>
              </div>
            </div>
          </Button>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-green-800 text-sm">
            💾 <strong>Export Formats:</strong> CSV for data analysis, PDF for official documents
          </p>
        </div>
      </div>
    );
  }

  if (type === 'editTournament') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Edit className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900">Edit Tournament Details</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tournament Title</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({...editForm, title: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              rows={3}
              value={editForm.description}
              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={editForm.startDate}
                onChange={(e) => setEditForm({...editForm, startDate: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={editForm.endDate}
                onChange={(e) => setEditForm({...editForm, endDate: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Teams</label>
              <input
                type="number"
                value={editForm.maxTeams}
                onChange={(e) => setEditForm({...editForm, maxTeams: parseInt(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <Button 
            onClick={() => onAction('updateTournament', editForm)} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3"
          >
            <Edit className="w-5 h-5 mr-2" />
            Update Tournament
          </Button>
        </div>
      </div>
    );
  }
  
  if (type === 'multiField') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Settings className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900">Multi-Field Support</h3>
          <p className="text-gray-600">Configure playing fields for the tournament</p>
        </div>
        
        <div className="space-y-4">
          {fieldForm.fields.map((field, index) => (
            <div key={index} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Field Name</label>
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => {
                    const newFields = [...fieldForm.fields];
                    newFields[index].name = e.target.value;
                    setFieldForm({...fieldForm, fields: newFields});
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                <input
                  type="number"
                  value={field.capacity}
                  onChange={(e) => {
                    const newFields = [...fieldForm.fields];
                    newFields[index].capacity = parseInt(e.target.value);
                    setFieldForm({...fieldForm, fields: newFields});
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  const newFields = fieldForm.fields.filter((_, i) => i !== index);
                  setFieldForm({...fieldForm, fields: newFields});
                }}
                className="px-3 py-3 text-red-600 hover:bg-red-50"
              >
                ✕
              </Button>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={() => {
              setFieldForm({
                ...fieldForm,
                fields: [...fieldForm.fields, { name: `Field ${fieldForm.fields.length + 1}`, capacity: 100 }]
              });
            }}
            className="w-full border-dashed border-2 border-green-300 text-green-600 hover:bg-green-50"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Field
          </Button>
          
          <Button 
            onClick={() => onAction('updateFields', fieldForm)} 
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white py-3"
          >
            <Settings className="w-5 h-5 mr-2" />
            Update Fields
          </Button>
        </div>
      </div>
    );
  }
  
  if (type === 'visitorRegistration') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <UserPlus className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900">Visitor Registration</h3>
          <p className="text-gray-600">Configure visitor access and registration</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900">Allow Visitor Registration</h4>
              <p className="text-sm text-gray-600">Enable spectators to register for the tournament</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={visitorForm.allowVisitors}
                onChange={(e) => setVisitorForm({...visitorForm, allowVisitors: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Fee ($)</label>
              <input
                type="number"
                value={visitorForm.visitorFee}
                onChange={(e) => setVisitorForm({...visitorForm, visitorFee: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Visitors</label>
              <input
                type="number"
                value={visitorForm.maxVisitors}
                onChange={(e) => setVisitorForm({...visitorForm, maxVisitors: parseInt(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-xl">
            <h4 className="font-medium text-purple-900 mb-2">Current Visitor Stats</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-purple-600">Registered:</span>
                <span className="font-bold ml-2">{tournament?.visitors?.length || 0}</span>
              </div>
              <div>
                <span className="text-purple-600">Remaining:</span>
                <span className="font-bold ml-2">{visitorForm.maxVisitors - (tournament?.visitors?.length || 0)}</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => onAction('updateVisitorSettings', visitorForm)} 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Update Visitor Settings
          </Button>
        </div>
      </div>
    );
  }

  if (type === 'teamDetails') {
    const team = item;
    return (
      <div className="space-y-6 max-h-96 overflow-y-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{team?.name}</h3>
          <p className="text-gray-600">{team?.homeCity}</p>
        </div>
        
        {/* Team Information */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Team Information
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-500">Team Name</div>
              <div className="font-medium">{team?.name || 'N/A'}</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-500">Home City</div>
              <div className="font-medium">{team?.homeCity || 'N/A'}</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-500">Status</div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                team?.status === 'approved' ? 'bg-green-100 text-green-800' :
                team?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {team?.status || 'Unknown'}
              </span>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-500">Players</div>
              <div className="font-medium">{team?.players?.length || 0}</div>
            </div>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4">
          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-green-600" />
            Contact Information
          </h4>
          <div className="space-y-2">
            <div className="bg-white rounded-lg p-3 flex justify-between">
              <span className="text-gray-600">Manager:</span>
              <span className="font-medium">{team?.manager?.name || 'N/A'}</span>
            </div>
            <div className="bg-white rounded-lg p-3 flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{team?.contactEmail || 'N/A'}</span>
            </div>
            <div className="bg-white rounded-lg p-3 flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{team?.contactPhone || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        {/* Players List */}
        {team?.players && team.players.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
            <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-purple-600" />
              Team Roster ({team.players.length} players)
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {team.players.map((player, index) => (
                <div key={index} className="bg-white rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium">{player.name || `Player ${index + 1}`}</div>
                      <div className="text-sm text-gray-500">{player.position || 'Position not specified'}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    #{player.number || index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Registration Details */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-orange-600" />
            Registration Details
          </h4>
          <div className="space-y-2">
            <div className="bg-white rounded-lg p-3 flex justify-between">
              <span className="text-gray-600">Registered:</span>
              <span className="font-medium">{team?.createdAt ? new Date(team.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="bg-white rounded-lg p-3 flex justify-between">
              <span className="text-gray-600">Tournament:</span>
              <span className="font-medium">{team?.tournament?.title || team?.tournament?.name || 'N/A'}</span>
            </div>
            {team?.notes && (
              <div className="bg-white rounded-lg p-3">
                <div className="text-sm text-gray-500 mb-1">Notes:</div>
                <div className="font-medium">{team.notes}</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        {team?.status === 'pending' && (
          <div className="flex gap-2">
            <Button 
              onClick={() => onAction('approve', team)} 
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Team
            </Button>
            <Button 
              onClick={() => onAction('reject', team)} 
              variant="outline"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Team
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (type === 'matchDetails') {
    const match = item;
    return (
      <div className="space-y-6 max-h-96 overflow-y-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {match?.teamA?.name || 'Team A'} vs {match?.teamB?.name || 'Team B'}
          </h3>
          <p className="text-gray-600">Field {match?.field || 'TBD'}</p>
        </div>
        
        {/* Match Score */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center justify-center">
            <Trophy className="w-5 h-5 mr-2 text-green-600" />
            Match Score
          </h4>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{match?.scoreA || 0}</div>
              <div className="text-sm text-gray-600">{match?.teamA?.name || 'Team A'}</div>
            </div>
            <div className="text-2xl font-bold text-gray-400">-</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{match?.scoreB || 0}</div>
              <div className="text-sm text-gray-600">{match?.teamB?.name || 'Team B'}</div>
            </div>
          </div>
        </div>
        
        {/* Match Information */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Match Information
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-500">Status</div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                match?.status === 'completed' ? 'bg-green-100 text-green-800' :
                match?.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                match?.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {match?.status || 'Scheduled'}
              </span>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-500">Round</div>
              <div className="font-medium">{match?.round || 'N/A'}</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-500">Field</div>
              <div className="font-medium">Field {match?.field || 'TBD'}</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-500">Duration</div>
              <div className="font-medium">{match?.duration || '90'} min</div>
            </div>
          </div>
        </div>
        
        {/* Schedule Information */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-purple-600" />
            Schedule
          </h4>
          <div className="space-y-2">
            <div className="bg-white rounded-lg p-3 flex justify-between">
              <span className="text-gray-600">Scheduled Time:</span>
              <span className="font-medium">
                {match?.scheduledTime ? new Date(match.scheduledTime).toLocaleString() : 'TBD'}
              </span>
            </div>
            {match?.startTime && (
              <div className="bg-white rounded-lg p-3 flex justify-between">
                <span className="text-gray-600">Started:</span>
                <span className="font-medium">{new Date(match.startTime).toLocaleString()}</span>
              </div>
            )}
            {match?.endTime && (
              <div className="bg-white rounded-lg p-3 flex justify-between">
                <span className="text-gray-600">Ended:</span>
                <span className="font-medium">{new Date(match.endTime).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Attendance */}
        {match?.attendance && match.attendance.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
            <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-orange-600" />
              Attendance ({match.attendance.length})
            </h4>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {match.attendance.map((player, index) => (
                <div key={index} className="bg-white rounded-lg p-2 text-sm">
                  <div className="font-medium">{player.name}</div>
                  <div className="text-gray-500">{player.team}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Spirit Scores */}
        {(match?.spiritScoreA || match?.spiritScoreB) && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4">
            <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-600" />
              Spirit Scores
            </h4>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{match?.spiritScoreA || 'N/A'}</div>
                <div className="text-sm text-gray-600">{match?.teamA?.name || 'Team A'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{match?.spiritScoreB || 'N/A'}</div>
                <div className="text-sm text-gray-600">{match?.teamB?.name || 'Team B'}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {match?.status !== 'completed' && (
            <Button 
              onClick={() => onAction('complete', match)} 
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Match
            </Button>
          )}
          <Button 
            onClick={() => onAction('viewLive', match)} 
            variant="outline"
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Live
          </Button>
        </div>
      </div>
    );
  }

  if (type === 'realtime') {
    const audienceOptions = [
      { value: 'all', label: '🌍 Everyone', desc: 'All tournament participants', color: 'bg-blue-100 text-blue-800' },
      { value: 'teams', label: '👥 Teams & Managers', desc: 'Team managers and captains', color: 'bg-green-100 text-green-800' },
      { value: 'players', label: '🏃 Players', desc: 'All registered players', color: 'bg-purple-100 text-purple-800' },
      { value: 'officials', label: '👨💼 Officials & Volunteers', desc: 'Tournament staff and volunteers', color: 'bg-orange-100 text-orange-800' },
      { value: 'spectators', label: '👀 Spectators & Sponsors', desc: 'Fans and sponsors', color: 'bg-pink-100 text-pink-800' }
    ];

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <Send className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">Send Live Update</h3>
          <p className="text-gray-600">Broadcast real-time message to tournament participants</p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
            <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
              <span className="text-lg mr-2">📝</span>
              Update Title
            </label>
            <input
              type="text"
              value={safeUpdateForm.title}
              onChange={(e) => setUpdateForm({...safeUpdateForm, title: e.target.value})}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-medium"
              placeholder="Enter a compelling title..."
              maxLength={100}
            />
            <div className="text-right text-xs text-gray-500 mt-1">{safeUpdateForm.title.length}/100</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4">
            <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
              <span className="text-lg mr-2">💬</span>
              Message Content
            </label>
            <textarea
              rows={4}
              value={safeUpdateForm.message}
              onChange={(e) => setUpdateForm({...safeUpdateForm, message: e.target.value})}
              className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
              placeholder="Write your message here... Be clear and concise."
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500 mt-1">{safeUpdateForm.message.length}/500</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
              <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
                <span className="text-lg mr-2">🏷️</span>
                Update Type
              </label>
              <select
                value={safeUpdateForm.type}
                onChange={(e) => setUpdateForm({...safeUpdateForm, type: e.target.value})}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              >
                <option value="announcement">📢 Announcement</option>
                <option value="weather_alert">🌤️ Weather Alert</option>
                <option value="schedule_change">📅 Schedule Change</option>
                <option value="emergency">🚨 Emergency</option>
                <option value="general">📝 General</option>
              </select>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
              <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
                <span className="text-lg mr-2">⚡</span>
                Priority Level
              </label>
              <select
                value={safeUpdateForm.priority}
                onChange={(e) => setUpdateForm({...safeUpdateForm, priority: e.target.value})}
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
              >
                <option value="low">🔵 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4">
            <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
              <span className="text-lg mr-2">🎯</span>
              Target Audience
            </label>
            <div className="space-y-2">
              {audienceOptions.map((option) => (
                <label key={option.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="targetAudience"
                    value={option.value}
                    checked={safeUpdateForm.targetAudience === option.value}
                    onChange={(e) => setUpdateForm({...safeUpdateForm, targetAudience: e.target.value})}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    updateForm.targetAudience === option.value 
                      ? 'border-indigo-500 bg-indigo-100 shadow-md' 
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold mr-3 ${option.color}`}>
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-600">{option.desc}</div>
                      </div>
                      {safeUpdateForm.targetAudience === option.value && (
                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-dashed border-gray-300">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
              <span className="text-lg mr-2">👁️</span>
              Preview
            </h4>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  safeUpdateForm.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                  safeUpdateForm.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  safeUpdateForm.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {safeUpdateForm.priority.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  audienceOptions.find(a => a.value === safeUpdateForm.targetAudience)?.color || 'bg-blue-100 text-blue-800'
                }`}>
                  {audienceOptions.find(a => a.value === safeUpdateForm.targetAudience)?.label || 'Everyone'}
                </span>
              </div>
              <h5 className="font-bold text-gray-900 mb-1">{safeUpdateForm.title || 'Update Title'}</h5>
              <p className="text-gray-700 text-sm">{safeUpdateForm.message || 'Your message will appear here...'}</p>
            </div>
          </div>
          
          <Button 
            onClick={() => onAction('send', safeUpdateForm)} 
            disabled={!safeUpdateForm.title || !safeUpdateForm.message}
            className="w-full bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:from-red-600 hover:via-pink-600 hover:to-purple-600 text-white py-4 text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Send className="w-6 h-6 mr-3" />
            Send Live Update
          </Button>
          
          <div className="text-center bg-blue-50 rounded-lg p-3">
            <Link href="/live-updates" className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-2">
              <span>📡</span>
              View all live updates
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <div>Modal content for {type}</div>;
}

function getModalTitle(type) {
  switch (type) {
    case 'leaderboard': return '🏆 Tournament Leaderboards';
    case 'historical': return '📊 Historical Data Repository';
    case 'repository': return '🌐 Tournament Repository';
    case 'realtime': return '📡 Real-Time Updates';
    case 'editTournament': return '✏️ Edit Tournament Details';
    case 'multiField': return '⚙️ Multi-Field Support';
    case 'visitorRegistration': return '👥 Visitor Registration';
    case 'teamDetails': return '👥 Team Details';
    case 'matchDetails': return '🏆 Match Details';
    case 'export': return 'Export Data';
    default: return 'Details';
  }
}