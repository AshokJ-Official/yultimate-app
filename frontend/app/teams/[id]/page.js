'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { teamAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Mail, Phone, MapPin, Calendar, Plus, Trash2, Trophy } from 'lucide-react';

export default function TeamDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [error, setError] = useState('');
  const [playerForm, setPlayerForm] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    phone: '',
    position: '',
    experience: '',
    jerseyNumber: ''
  });

  useEffect(() => {
    if (id) {
      fetchTeamDetails();
    }
  }, [id]);

  const fetchTeamDetails = async () => {
    try {
      const response = await teamAPI.getById(id);
      setTeam(response.data?.data || response.data);
    } catch (error) {
      console.error('Error fetching team details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await teamAPI.addPlayer(id, playerForm);
      setShowAddPlayerModal(false);
      setPlayerForm({ name: '', email: '', age: '', gender: '', phone: '', position: '', experience: '', jerseyNumber: '' });
      fetchTeamDetails();
    } catch (error) {
      console.error('Error adding player:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add player';
      setError(errorMessage);
    }
  };

  const handleRemovePlayer = async (playerId) => {
    if (!confirm('Are you sure you want to remove this player from the team?')) {
      return;
    }
    try {
      await teamAPI.removePlayer(id, playerId);
      fetchTeamDetails();
    } catch (error) {
      console.error('Error removing player:', error);
      alert('Failed to remove player. Please try again.');
    }
  };

  const canManageTeam = user?.role === 'team_manager' || user?.role === 'tournament_director';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Not Found</h2>
          <p className="text-gray-600 mb-4">The team you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/teams')}>Back to Teams</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.push('/teams')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Teams
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
          <p className="text-gray-600">Team Details & Roster Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Information */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tournament</p>
                  <p className="font-medium">{team.tournament?.title || team.tournament?.name || 'No tournament'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <Mail className="w-5 h-5 text-secondary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Manager Email</p>
                  <p className="font-medium">{team.manager?.email || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-100 rounded-lg">
                  <Phone className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Manager Phone</p>
                  <p className="font-medium">{team.manager?.phone || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Players</p>
                  <p className="font-medium">{team.players?.length || 0} players</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registration Date</p>
                  <p className="font-medium">{new Date(team.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    team.status === 'approved' ? 'bg-green-100 text-green-800' :
                    team.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {team.status}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Players Roster */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Team Roster</h2>
              {canManageTeam && (
                <Button onClick={() => setShowAddPlayerModal(true)} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Player
                </Button>
              )}
            </div>

            {team.players && team.players.length > 0 ? (
              <div className="space-y-4">
                {team.players.map((playerEntry, index) => {
                  const player = playerEntry.player || playerEntry;
                  return (
                    <motion.div
                      key={playerEntry._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {player.name?.charAt(0) || 'P'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{player.name || 'Player'}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {player.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {player.email}
                              </span>
                            )}
                            {player.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {player.phone}
                              </span>
                            )}
                            {player.position && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {player.position}
                              </span>
                            )}
                            {player.experience && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                {player.experience}
                              </span>
                            )}
                            {playerEntry.jerseyNumber && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
                                #{playerEntry.jerseyNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {canManageTeam && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemovePlayer(player._id)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No players yet</h3>
                <p className="text-gray-500 mb-4">Add players to build your team roster</p>
                {canManageTeam && (
                  <Button onClick={() => setShowAddPlayerModal(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add First Player
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add Player Modal */}
      <Modal isOpen={showAddPlayerModal} onClose={() => { setShowAddPlayerModal(false); setError(''); }} title="">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Player</h2>
          <p className="text-gray-600">Fill in the player details to add them to your team</p>
        </div>
        
        <form onSubmit={handleAddPlayer} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}
          {/* Basic Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Basic Information
            </h3>
            <div className="space-y-4">
              <Input
                label="Player Name"
                value={playerForm.name}
                onChange={(e) => setPlayerForm({...playerForm, name: e.target.value})}
                placeholder="Enter full name"
                className="bg-white"
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={playerForm.email}
                onChange={(e) => setPlayerForm({...playerForm, email: e.target.value})}
                placeholder="player@example.com"
                className="bg-white"
                required
              />
            </div>
          </div>

          {/* Personal Details */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Personal Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Age"
                type="number"
                value={playerForm.age}
                onChange={(e) => setPlayerForm({...playerForm, age: e.target.value})}
                placeholder="25"
                min="16"
                max="60"
                className="bg-white"
              />
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-2">Gender</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  value={playerForm.gender}
                  onChange={(e) => setPlayerForm({...playerForm, gender: e.target.value})}
                >
                  <option value="">Select Gender</option>
                  <option value="male">👨 Male</option>
                  <option value="female">👩 Female</option>
                  <option value="other">🏳️‍⚧️ Other</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  value={playerForm.phone}
                  onChange={(e) => setPlayerForm({...playerForm, phone: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                  className="bg-white"
                />
                <Input
                  label="Jersey Number"
                  type="number"
                  value={playerForm.jerseyNumber || ''}
                  onChange={(e) => setPlayerForm({...playerForm, jerseyNumber: e.target.value})}
                  placeholder="#"
                  min="1"
                  max="99"
                  className="bg-white"
                />
              </div>
            </div>
          </div>

          {/* Game Details */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Game Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-purple-900 mb-2">Position</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  value={playerForm.position}
                  onChange={(e) => setPlayerForm({...playerForm, position: e.target.value})}
                >
                  <option value="">Select Position</option>
                  <option value="handler">🎯 Handler</option>
                  <option value="cutter">⚡ Cutter</option>
                  <option value="hybrid">🔄 Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-purple-900 mb-2">Experience Level</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  value={playerForm.experience}
                  onChange={(e) => setPlayerForm({...playerForm, experience: e.target.value})}
                >
                  <option value="">Select Experience</option>
                  <option value="beginner">🌱 Beginner</option>
                  <option value="intermediate">🚀 Intermediate</option>
                  <option value="advanced">⭐ Advanced</option>
                  <option value="professional">🏆 Professional</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowAddPlayerModal(false)}
              className="flex-1 py-3 border-2 border-gray-300 hover:border-gray-400 transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Add Player
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}