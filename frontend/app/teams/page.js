'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { teamAPI, tournamentAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { Plus, Users, Shield, Mail, Phone } from 'lucide-react';

export default function TeamsPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tournament: '',
    contactEmail: '',
    contactPhone: '',
    homeCity: '',
    expectedPlayers: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get all tournaments first
      const tournamentsResponse = await tournamentAPI.getAll();
      const tournaments = tournamentsResponse.data?.data || tournamentsResponse.data || [];
      setTournaments(tournaments);
      
      // Get all teams from database
      const teamsResponse = await teamAPI.getAll();
      const allTeams = teamsResponse.data?.data || teamsResponse.data || [];
      setTeams(allTeams);

      console.log('Teams loaded:', allTeams);
      console.log('Tournaments loaded:', tournaments);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to empty array if API fails
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await teamAPI.create(formData);
      setShowRegisterModal(false);
      setFormData({
        name: '',
        tournament: '',
        contactEmail: '',
        contactPhone: '',
        homeCity: '',
        expectedPlayers: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error registering team:', error);
    }
  };

  const handleStatusUpdate = async (teamId, status) => {
    try {
      await teamAPI.updateStatus(teamId, status);
      fetchData();
    } catch (error) {
      console.error('Error updating team status:', error);
    }
  };

  const canRegisterTeam = user?.role === 'team_manager';
  const canManageTeams = user?.role === 'tournament_director';

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
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600 mt-2">Manage team registrations and rosters</p>
        </div>
        {canRegisterTeam && (
          <Button onClick={() => setShowRegisterModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Register Team
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.length > 0 ? teams.map((team, index) => (
          <motion.div
            key={team._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    team.status === 'approved' ? 'bg-green-100 text-green-800' :
                    team.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {team.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>{team.tournament?.title || team.tournament?.name || 'No tournament'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{team.players?.length || 0} players</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{team.manager?.email || team.contactEmail || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{team.manager?.phone || team.contactPhone || 'No phone'}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.location.href = `/teams/${team._id}`}
                  >
                    View Details
                  </Button>
                  {canManageTeams && team.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusUpdate(team._id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusUpdate(team._id, 'rejected')}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No teams registered yet</h3>
            <p className="text-gray-500 text-center mb-6">Teams will appear here once they register for tournaments</p>
            {canRegisterTeam && (
              <Button onClick={() => setShowRegisterModal(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Register Team
              </Button>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="Register Team">
        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Team Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tournament</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.tournament}
              onChange={(e) => setFormData({...formData, tournament: e.target.value})}
              required
            >
              <option value="">Select Tournament</option>
              {tournaments.map(tournament => (
                <option key={tournament._id} value={tournament._id}>
                  {tournament.title || tournament.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Contact Email"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
            required
          />
          <Input
            label="Contact Phone"
            value={formData.contactPhone}
            onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
            required
          />
          <Input
            label="Home City"
            value={formData.homeCity}
            onChange={(e) => setFormData({...formData, homeCity: e.target.value})}
            required
          />
          <Input
            label="Expected Players"
            type="number"
            value={formData.expectedPlayers}
            onChange={(e) => setFormData({...formData, expectedPlayers: e.target.value})}
            required
          />
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowRegisterModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Register Team</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}