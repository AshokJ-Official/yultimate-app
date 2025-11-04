'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { tournamentAPI, teamAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Trophy, Calendar, MapPin } from 'lucide-react';

export default function TournamentRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: user?.name || '',
    email: user?.email || '',
    phone: '',
    players: []
  });

  useEffect(() => {
    if (params.id) {
      fetchTournament();
    }
  }, [params.id]);

  const fetchTournament = async () => {
    try {
      const response = await tournamentAPI.getById(params.id);
      setTournament(response.data?.data || response.data);
    } catch (error) {
      console.error('Error fetching tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const teamData = {
        name: formData.name,
        tournament: params.id,
        contactEmail: formData.email,
        contactPhone: formData.phone,
        players: formData.players
      };
      
      await teamAPI.create(teamData);
      alert('Team registration submitted successfully! Please wait for approval.');
      router.push(`/tournaments/${params.id}`);
    } catch (error) {
      console.error('Error registering team:', error);
      alert('Error registering team. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const addPlayer = () => {
    setFormData({
      ...formData,
      players: [...formData.players, { 
        name: '', 
        email: '', 
        age: '', 
        gender: '', 
        phone: '', 
        jerseyNumber: '', 
        position: '', 
        experience: '' 
      }]
    });
  };

  const updatePlayer = (index, field, value) => {
    const updatedPlayers = [...formData.players];
    updatedPlayers[index][field] = value;
    setFormData({ ...formData, players: updatedPlayers });
  };

  const removePlayer = (index) => {
    const updatedPlayers = formData.players.filter((_, i) => i !== index);
    setFormData({ ...formData, players: updatedPlayers });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tournament Not Found</h2>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Register Team</h1>
          <p className="text-gray-600 mt-2">Join {tournament.title || tournament.name}</p>
        </div>
      </div>

      {/* Tournament Info */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tournament Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm text-gray-600">Tournament</p>
                <p className="font-medium">{tournament.title || tournament.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-secondary-600" />
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">
                  {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-success-600" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{tournament.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-warning-600" />
              <div>
                <p className="text-sm text-gray-600">Registration Fee</p>
                <p className="font-medium">${tournament.registrationFee || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Registration Form */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Team Registration</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Team Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Contact Person"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            {/* Players Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Team Players</h3>
                  <p className="text-sm text-gray-600">Add players to your team roster</p>
                </div>
                <Button 
                  type="button" 
                  onClick={addPlayer}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Add Player
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.players.map((player, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">Add New Player</h4>
                          <p className="text-sm text-gray-600">Fill in the player details to add them to your team</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePlayer(index)}
                        className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                      >
                        Remove
                      </Button>
                    </div>
                    
                    {/* Basic Information */}
                    <div className="mb-6">
                      <h5 className="text-md font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Basic Information
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Player Name</label>
                          <input
                            type="text"
                            placeholder="Enter full name"
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            value={player.name}
                            onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                          <input
                            type="email"
                            placeholder="player@example.com"
                            className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            value={player.email}
                            onChange={(e) => updatePlayer(index, 'email', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Personal Details */}
                    <div className="mb-6">
                      <h5 className="text-md font-semibold text-purple-800 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Personal Details
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                          <input
                            type="number"
                            placeholder="25"
                            className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                            value={player.age}
                            onChange={(e) => updatePlayer(index, 'age', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                          <select
                            className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                            value={player.gender}
                            onChange={(e) => updatePlayer(index, 'gender', e.target.value)}
                            required
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                            value={player.phone}
                            onChange={(e) => updatePlayer(index, 'phone', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Jersey Number</label>
                          <input
                            type="number"
                            placeholder="#"
                            className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                            value={player.jerseyNumber}
                            onChange={(e) => updatePlayer(index, 'jerseyNumber', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Game Details */}
                    <div>
                      <h5 className="text-md font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Game Details
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                          <select
                            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                            value={player.position}
                            onChange={(e) => updatePlayer(index, 'position', e.target.value)}
                            required
                          >
                            <option value="">Select Position</option>
                            <option value="handler">Handler</option>
                            <option value="cutter">Cutter</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                          <select
                            className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                            value={player.experience}
                            onChange={(e) => updatePlayer(index, 'experience', e.target.value)}
                            required
                          >
                            <option value="">Select Experience</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {formData.players.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No players added yet. Click "Add Player" to start building your team.</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || formData.players.length === 0}
                className="flex-1"
              >
                {submitting ? 'Registering...' : 'Register Team'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}