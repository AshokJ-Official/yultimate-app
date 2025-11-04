'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { tournamentAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { Plus, Calendar, MapPin, Users, Trophy, Settings, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function TournamentsPage() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: '',
    startDate: '',
    endDate: '',
    location: '',
    maxTeams: '',
    registrationDeadline: '',
    entryFee: '',
    sponsors: '',
    banner: null,
    fields: [{ name: 'Field 1', capacity: 100 }]
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await tournamentAPI.getAll();
      const tournamentsData = response.data.data || response.data || [];
      setTournaments(tournamentsData);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      // Fallback to empty array if API fails
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const tournamentData = {
        title: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        location: formData.location,
        fields: [{ name: 'Field 1' }]
      };
      
      if (formData.maxTeams && formData.maxTeams !== '') {
        tournamentData.maxTeams = parseInt(formData.maxTeams);
      }
      if (formData.registrationDeadline && formData.registrationDeadline !== '') {
        tournamentData.registrationDeadline = formData.registrationDeadline;
      }
      if (formData.rules && formData.rules !== '') {
        tournamentData.rules = formData.rules;
      }
      if (formData.entryFee && formData.entryFee !== '') {
        tournamentData.entryFee = parseFloat(formData.entryFee);
      }
      
      const response = await tournamentAPI.create(tournamentData);
      const tournamentId = response.data.data._id;
      
      // Upload banner if provided
      if (formData.banner) {
        const bannerFormData = new FormData();
        bannerFormData.append('banner', formData.banner);
        await tournamentAPI.uploadBanner(tournamentId, bannerFormData);
      }
      
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        rules: '',
        startDate: '',
        endDate: '',
        location: '',
        maxTeams: '',
        registrationDeadline: '',
        entryFee: '',
        sponsors: '',
        banner: null,
        fields: [{ name: 'Field 1', capacity: 100 }]
      });
      fetchTournaments();
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('Error creating tournament: ' + (error.response?.data?.message || error.message));
    }
  };

  const canCreateTournament = user?.role === 'tournament_director';
  const canManageStatus = user?.role === 'tournament_director';

  const handleStatusUpdate = async (tournamentId, newStatus) => {
    try {
      await tournamentAPI.updateStatus(tournamentId, newStatus);
      setShowStatusModal(false);
      fetchTournaments();
    } catch (error) {
      console.error('Error updating tournament status:', error);
      alert('Error updating tournament status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-500 text-white';
      case 'open': return 'bg-blue-500 text-white';
      case 'ongoing': return 'bg-green-500 text-white';
      case 'completed': return 'bg-purple-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const fetchSummaryData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [teamsRes, matchesRes, spiritRes] = await Promise.all([
        fetch('http://localhost:5000/api/teams', { headers }),
        fetch('http://localhost:5000/api/matches', { headers }),
        fetch('http://localhost:5000/api/spirit-scores', { headers })
      ]);
      
      const teams = await teamsRes.json();
      const matches = await matchesRes.json();
      const spirit = await spiritRes.json();
      
      // Calculate player statistics
      const playerStats = calculatePlayerStats(teams.success ? teams.data : []);
      
      setSummaryData({
        totalTeams: teams.success ? teams.data.length : 0,
        totalMatches: matches.success ? matches.data.length : 0,
        liveMatches: matches.success ? matches.data.filter(m => m.status === 'in_progress').length : 0,
        completedMatches: matches.success ? matches.data.filter(m => m.status === 'completed').length : 0,
        teams: teams.success ? teams.data : [],
        matches: matches.success ? matches.data : [],
        spiritScores: spirit.success ? spirit.data : [],
        playerStats
      });
    } catch (error) {
      console.error('Error fetching summary data:', error);
    }
  };

  const handleShowSummary = () => {
    setShowSummary(true);
    fetchSummaryData();
  };

  const calculatePlayerStats = (teams) => {
    let totalPlayers = 0;
    let maleCount = 0;
    let femaleCount = 0;
    let ages = [];
    let youngest = null;
    let oldest = null;

    teams.forEach(team => {
      if (team.players) {
        team.players.forEach(playerRef => {
          if (playerRef.player) {
            totalPlayers++;
            const player = playerRef.player;
            
            if (player.gender === 'male') maleCount++;
            else if (player.gender === 'female') femaleCount++;
            
            if (player.age) {
              ages.push(player.age);
              
              if (!youngest || player.age < youngest.age) {
                youngest = { name: player.name || 'Unknown', age: player.age };
              }
              if (!oldest || player.age > oldest.age) {
                oldest = { name: player.name || 'Unknown', age: player.age };
              }
            }
          }
        });
      }
    });

    const avgAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;

    return {
      total: totalPlayers,
      male: maleCount,
      female: femaleCount,
      avgAge,
      youngest,
      oldest
    };
  };

  const downloadReport = async (format, type) => {
    try {
      const token = localStorage.getItem('token');
      const tournamentId = tournaments[0]?._id; // Use first tournament for demo
      
      let url = '';
      if (type === 'tournament') {
        url = `http://localhost:5000/api/reports/tournament/${tournamentId}/export?format=${format}`;
      } else if (type === 'matches') {
        url = `http://localhost:5000/api/matches/export?format=${format}`;
      } else if (type === 'attendance') {
        url = `http://localhost:5000/api/reports/attendance/export?format=${format}`;
      }
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${type}-report-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report');
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
          <p className="text-gray-600 mt-2">Manage and participate in Ultimate Frisbee tournaments</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleShowSummary} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Tournament Summary
          </Button>
          {canCreateTournament && (
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Tournament
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.length > 0 ? tournaments.map((tournament, index) => (
          <motion.div
            key={tournament._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-white border border-gray-200">
              <div className="h-48 relative overflow-hidden">
                {tournament.bannerImage ? (
                  <img 
                    src={tournament.bannerImage} 
                    alt={tournament.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-20" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${getStatusColor(tournament.status)}`}>
                    {tournament.status?.toUpperCase() || 'DRAFT'}
                  </span>
                  {canManageStatus && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedTournament(tournament);
                        setShowStatusModal(true);
                      }}
                      className="w-6 h-6 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
                    >
                      <Settings className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">{tournament.title || tournament.name || 'Untitled Tournament'}</h3>
                  <p className="text-blue-100 text-sm">{tournament.location || 'Location TBD'}</p>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {tournament.description || 'No description available'}
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>
                      {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'TBD'} - {tournament.endDate ? new Date(tournament.endDate).toLocaleDateString() : 'TBD'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <span>{tournament.registeredTeams || 0}/{tournament.maxTeams || 100} teams registered</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                    </div>
                    <span>${tournament.entryFee || 0} entry fee</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/tournaments/${tournament._id}`}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      View Details
                    </Button>
                  </Link>
                  {user?.role === 'tournament_director' ? (
                    <Link href={`/tournaments/${tournament._id}/manage`}>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4"
                      >
                        Manage
                      </Button>
                    </Link>
                  ) : (
                    <div className="flex gap-1">
                      {user?.role === 'team_manager' && (
                        <Link href={`/tournaments/${tournament._id}/register`}>
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 text-xs"
                          >
                            Join
                          </Button>
                        </Link>
                      )}
                      {(user?.role === 'spectator' || user?.role === 'sponsor' || !user?.role) && (
                        <Link href={`/tournaments/${tournament._id}/register-visitor`}>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="px-3 text-xs"
                          >
                            Visitor
                          </Button>
                        </Link>
                      )}
                      {user?.role === 'volunteer' && (
                        <div className="text-xs text-gray-500 px-2 py-1">
                          Field Access Only
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tournaments yet</h3>
            <p className="text-gray-500 text-center mb-6">Get started by creating your first tournament</p>
            {canCreateTournament && (
              <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Tournament
              </Button>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Tournament">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Tournament Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Enter tournament name (min 3 characters)"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter tournament description (min 10 characters)"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              required
            />
          </div>
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Teams"
              type="number"
              value={formData.maxTeams}
              onChange={(e) => setFormData({...formData, maxTeams: e.target.value})}
              required
            />
            <Input
              label="Entry Fee ($)"
              type="number"
              value={formData.entryFee}
              onChange={(e) => setFormData({...formData, entryFee: e.target.value})}
              required
            />
          </div>
          <Input
            label="Registration Deadline"
            type="date"
            value={formData.registrationDeadline}
            onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tournament Rules</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              value={formData.rules}
              onChange={(e) => setFormData({...formData, rules: e.target.value})}
              placeholder="Tournament rules and regulations..."
            />
          </div>
          
          <Input
            label="Sponsors (comma separated)"
            value={formData.sponsors}
            onChange={(e) => setFormData({...formData, sponsors: e.target.value})}
            placeholder="Sponsor 1, Sponsor 2, Sponsor 3"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tournament Banner</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFormData({...formData, banner: e.target.files[0]})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Upload image (JPG, PNG) or PDF file. Max size: 10MB</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Playing Fields</label>
            <div className="space-y-2">
              {formData.fields.map((field, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Field name"
                    value={field.name}
                    onChange={(e) => {
                      const newFields = [...formData.fields];
                      newFields[index].name = e.target.value;
                      setFormData({...formData, fields: newFields});
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Capacity"
                    value={field.capacity}
                    onChange={(e) => {
                      const newFields = [...formData.fields];
                      newFields[index].capacity = parseInt(e.target.value);
                      setFormData({...formData, fields: newFields});
                    }}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({
                  ...formData,
                  fields: [...formData.fields, { name: `Field ${formData.fields.length + 1}`, capacity: 100 }]
                })}
              >
                Add Field
              </Button>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Tournament</Button>
          </div>
        </form>
      </Modal>

      {/* Status Update Modal */}
      <Modal 
        isOpen={showStatusModal} 
        onClose={() => setShowStatusModal(false)} 
        title="Update Tournament Status"
      >
        {selectedTournament && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">{selectedTournament.title}</h3>
              <p className="text-sm text-gray-600 mb-4">
                Current status: <span className="font-medium capitalize">{selectedTournament.status || 'draft'}</span>
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Select New Status:</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 'draft', label: 'Draft', desc: 'Tournament is being planned' },
                  { value: 'open', label: 'Open', desc: 'Registration is open' },
                  { value: 'ongoing', label: 'Ongoing', desc: 'Tournament is in progress' },
                  { value: 'completed', label: 'Completed', desc: 'Tournament has finished' },
                  { value: 'cancelled', label: 'Cancelled', desc: 'Tournament was cancelled' }
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusUpdate(selectedTournament._id, status.value)}
                    className={`p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors ${
                      selectedTournament.status === status.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{status.label}</p>
                        <p className="text-sm text-gray-500">{status.desc}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status.value)}`}>
                        {status.label.toUpperCase()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowStatusModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Tournament Summary Modal */}
      <Modal 
        isOpen={showSummary} 
        onClose={() => setShowSummary(false)} 
        title="Tournament Summary Dashboard"
        size="large"
      >
        {summaryData ? (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Total Teams</p>
                    <p className="text-2xl font-bold text-blue-800">{summaryData.totalTeams}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Live Matches</p>
                    <p className="text-2xl font-bold text-green-800">{summaryData.liveMatches}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600">Completed</p>
                    <p className="text-2xl font-bold text-purple-800">{summaryData.completedMatches}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600">Total Matches</p>
                    <p className="text-2xl font-bold text-orange-800">{summaryData.totalMatches}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Teams Leaderboard */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Team Rankings
              </h3>
              <div className="space-y-2">
                {summaryData.teams.slice(0, 5).map((team, index) => (
                  <div key={team._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-medium">{team.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {team.stats?.wins || 0}W - {team.stats?.losses || 0}L - {team.stats?.draws || 0}D
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Matches */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Recent Matches
              </h3>
              <div className="space-y-2">
                {summaryData.matches.slice(0, 5).map((match) => (
                  <div key={match._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        match.status === 'completed' ? 'bg-green-100 text-green-700' :
                        match.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {match.status?.toUpperCase()}
                      </span>
                      <span className="font-medium">
                        {match.teamA?.name || 'Team A'} vs {match.teamB?.name || 'Team B'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {match.score ? `${match.score.teamA}-${match.score.teamB}` : 'TBD'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spirit Scores */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-500" />
                Spirit Rankings
              </h3>
              <div className="space-y-2">
                {summaryData.spiritScores.slice(0, 5).map((score, index) => (
                  <div key={score._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-purple-500 text-white' :
                        index === 1 ? 'bg-purple-400 text-white' :
                        index === 2 ? 'bg-purple-300 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-medium">{score.scoredTeam?.name || 'Team'}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {score.totalScore || 0}/20 points
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Player Participation Stats */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Player Participation
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <p className="text-2xl font-bold text-blue-600">{summaryData.playerStats?.total || 0}</p>
                  <p className="text-sm text-blue-700">Total Players</p>
                </div>
                <div className="text-center p-3 bg-pink-50 rounded">
                  <p className="text-2xl font-bold text-pink-600">{summaryData.playerStats?.female || 0}</p>
                  <p className="text-sm text-pink-700">Female</p>
                </div>
                <div className="text-center p-3 bg-cyan-50 rounded">
                  <p className="text-2xl font-bold text-cyan-600">{summaryData.playerStats?.male || 0}</p>
                  <p className="text-sm text-cyan-700">Male</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <p className="text-2xl font-bold text-green-600">{summaryData.playerStats?.avgAge || 0}</p>
                  <p className="text-sm text-green-700">Avg Age</p>
                </div>
              </div>
              {summaryData.playerStats?.youngest && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-yellow-50 rounded">
                    <p className="text-sm text-yellow-700">Youngest Player</p>
                    <p className="font-medium">{summaryData.playerStats.youngest.name} ({summaryData.playerStats.youngest.age})</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded">
                    <p className="text-sm text-orange-700">Oldest Player</p>
                    <p className="font-medium">{summaryData.playerStats.oldest.name} ({summaryData.playerStats.oldest.age})</p>
                  </div>
                </div>
              )}
            </div>

            {/* Export Options */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Download Reports</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button 
                  onClick={() => downloadReport('csv', 'tournament')}
                  className="p-3 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors"
                >
                  <div className="text-green-600 font-medium">CSV Export</div>
                  <div className="text-xs text-green-500">Tournament Data</div>
                </button>
                <button 
                  onClick={() => downloadReport('json', 'tournament')}
                  className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors"
                >
                  <div className="text-blue-600 font-medium">JSON Export</div>
                  <div className="text-xs text-blue-500">Full Data</div>
                </button>
                <button 
                  onClick={() => downloadReport('csv', 'matches')}
                  className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors"
                >
                  <div className="text-purple-600 font-medium">Matches CSV</div>
                  <div className="text-xs text-purple-500">Match Results</div>
                </button>
                <button 
                  onClick={() => downloadReport('csv', 'attendance')}
                  className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors"
                >
                  <div className="text-orange-600 font-medium">Attendance</div>
                  <div className="text-xs text-orange-500">Player Stats</div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
      </Modal>
    </div>
  );
}