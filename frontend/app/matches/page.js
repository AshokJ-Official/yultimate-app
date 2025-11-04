'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
// import { useSocket } from '@/lib/socket-context';
import { matchAPI, tournamentAPI, teamAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { Plus, Clock, Users, Trophy, Play, Pause } from 'lucide-react';

export default function MatchesPage() {
  const { user } = useAuth();
  // const { socket } = useSocket();
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [formData, setFormData] = useState({
    tournament: '',
    teamA: '',
    teamB: '',
    scheduledTime: '',
    field: '',
    round: 'Round 1'
  });
  const [scoreData, setScoreData] = useState({
    teamAScore: 0,
    teamBScore: 0
  });

  useEffect(() => {
    fetchData();
    
    // Socket integration disabled for now
    // if (socket) {
    //   socket.on('match-score-updated', handleScoreUpdate);
    //   return () => socket.off('match-score-updated', handleScoreUpdate);
    // }
  }, []);

  const fetchData = async () => {
    try {
      // Fetch real data from API
      // Fetch tournaments
      const tournamentsRes = await tournamentAPI.getAll();
      const tournaments = tournamentsRes.data?.data || tournamentsRes.data || [];
      console.log('Tournaments loaded:', tournaments);
      
      // Fetch teams
      const teamsRes = await teamAPI.getAll();
      const teams = teamsRes.data?.data || teamsRes.data || [];
      console.log('Teams loaded:', teams);
      
      // Fetch matches
      const matchesRes = await matchAPI.getAll();
      const matches = matchesRes.data?.data || matchesRes.data || [];
      console.log('Matches loaded:', matches);
      
      setTournaments(tournaments);
      setTeams(teams);
      setMatches(matches);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to empty arrays if API fails
      setTournaments([]);
      setTeams([]);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreUpdate = (data) => {
    setMatches(prev => prev.map(match => 
      match._id === data.matchId ? { ...match, ...data } : match
    ));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await matchAPI.create(formData);
      setShowCreateModal(false);
      setFormData({
        tournament: '',
        teamA: '',
        teamB: '',
        scheduledTime: '',
        field: '',
        round: 'Round 1'
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Error creating match');
    }
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    try {
      await matchAPI.updateScore(selectedMatch._id, scoreData);
      setShowScoreModal(false);
      setSelectedMatch(null);
      setScoreData({ teamAScore: 0, teamBScore: 0 });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating score:', error);
      alert('Error updating score');
    }
  };

  const openScoreModal = (match) => {
    setSelectedMatch(match);
    setScoreData({
      teamAScore: match.score?.teamA || 0,
      teamBScore: match.score?.teamB || 0
    });
    setShowScoreModal(true);
  };

  const canCreateMatch = user?.role === 'tournament_director';
  const canUpdateScore = ['tournament_director', 'scoring_team', 'volunteer'].includes(user?.role);

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
          <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
          <p className="text-gray-600 mt-2">Schedule and track tournament matches</p>
        </div>
        {canCreateMatch && (
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Match
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match, index) => (
          <motion.div
            key={match._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {match.status === 'live' && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      match.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      match.status === 'live' ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {match.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {match.score?.teamA || 0} - {match.score?.teamB || 0}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{match.teamA?.name || match.team1?.name}</span>
                    <span className="text-sm text-gray-500">vs</span>
                    <span className="font-medium text-gray-900">{match.teamB?.name || match.team2?.name}</span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      <span>{match.tournament?.title || match.tournament?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(match.scheduledTime).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Field {match.field}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.location.href = `/matches/${match._id}`}
                  >
                    View Details
                  </Button>
                  {canUpdateScore && match.status !== 'completed' && (
                    <Button 
                      size="sm" 
                      onClick={() => openScoreModal(match)}
                      className="flex items-center gap-1"
                    >
                      {match.status === 'live' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      Score
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Match">
        <form onSubmit={handleCreate} className="space-y-4">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team A</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.teamA}
                onChange={(e) => setFormData({...formData, teamA: e.target.value})}
                required
              >
                <option value="">Select Team</option>
                {teams.map(team => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team B</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.teamB}
                onChange={(e) => setFormData({...formData, teamB: e.target.value})}
                required
              >
                <option value="">Select Team</option>
                {teams.map(team => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Input
            label="Scheduled Time"
            type="datetime-local"
            value={formData.scheduledTime}
            onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Field"
              value={formData.field}
              onChange={(e) => setFormData({...formData, field: e.target.value})}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Round</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.round}
                onChange={(e) => setFormData({...formData, round: e.target.value})}
                required
              >
                <option value="Round 1">Round 1</option>
                <option value="Round 2">Round 2</option>
                <option value="Round 3">Round 3</option>
                <option value="Quarter Final">Quarter Final</option>
                <option value="Semi Final">Semi Final</option>
                <option value="Final">Final</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Match</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showScoreModal} onClose={() => setShowScoreModal(false)} title="Update Score">
        {selectedMatch && (
          <form onSubmit={handleScoreSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedMatch.teamA?.name} vs {selectedMatch.teamB?.name}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={selectedMatch.teamA?.name}
                type="number"
                min="0"
                value={scoreData.teamAScore}
                onChange={(e) => setScoreData({...scoreData, teamAScore: parseInt(e.target.value)})}
                required
              />
              <Input
                label={selectedMatch.teamB?.name}
                type="number"
                min="0"
                value={scoreData.teamBScore}
                onChange={(e) => setScoreData({...scoreData, teamBScore: parseInt(e.target.value)})}
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowScoreModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Score</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}