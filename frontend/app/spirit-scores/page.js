'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useSearchParams } from 'next/navigation';
import { spiritAPI, tournamentAPI, teamAPI, matchAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { Star, Trophy, Users, Plus, Award, TrendingUp } from 'lucide-react';

export default function SpiritScoresPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const preSelectedMatchId = searchParams.get('matchId');
  const [spiritScores, setSpiritScores] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [matches, setMatches] = useState([]);
  const [spiritData, setSpiritData] = useState({
    match: '',
    team: '',
    rulesKnowledge: 0,
    foulsAndBodyContact: 0,
    fairMindedness: 0,
    positiveAttitude: 0,
    communication: 0,
    comments: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Pre-select match if provided in URL
    if (preSelectedMatchId && matches.length > 0) {
      const match = matches.find(m => m._id === preSelectedMatchId);
      if (match) {
        setSpiritData(prev => ({ ...prev, match: preSelectedMatchId }));
        setShowSubmitModal(true);
      }
    }
  }, [preSelectedMatchId, matches]);

  const fetchData = async () => {
    try {
      // Fetch real data from API
      const [tournamentsRes, teamsRes, spiritRes, matchesRes] = await Promise.all([
        tournamentAPI.getAll(),
        teamAPI.getAll(),
        spiritAPI.getAll(),
        matchAPI.getAll()
      ]);
      
      const tournaments = tournamentsRes.data?.data || tournamentsRes.data || [];
      const teams = teamsRes.data?.data || teamsRes.data || [];
      const spiritScores = spiritRes.data?.data || spiritRes.data || [];
      const matches = matchesRes.data?.data || matchesRes.data || [];
      
      setTournaments(tournaments);
      setTeams(teams);
      setSpiritScores(spiritScores);
      setMatches(matches);
      
      console.log('Tournaments loaded:', tournaments);
      console.log('Teams loaded:', teams);
      console.log('Spirit scores loaded:', spiritScores);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to empty arrays if API fails
      setTournaments([]);
      setTeams([]);
      setSpiritScores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        matchId: spiritData.match,
        scoredTeamId: spiritData.team,
        scores: {
          rulesKnowledge: spiritData.rulesKnowledge,
          foulsAndContact: spiritData.foulsAndBodyContact,
          fairMindedness: spiritData.fairMindedness,
          positiveAttitude: spiritData.positiveAttitude,
          communication: spiritData.communication
        },
        comments: spiritData.comments
      };
      
      await spiritAPI.submit(submitData);
      
      setShowSubmitModal(false);
      setSpiritData({
        match: '',
        team: '',
        rulesKnowledge: 0,
        foulsAndBodyContact: 0,
        fairMindedness: 0,
        positiveAttitude: 0,
        communication: 0,
        comments: ''
      });
      setSelectedTournament('');
      
      // Refresh data after submission
      fetchData();
      alert('Spirit score submitted successfully!');
    } catch (error) {
      console.error('Error submitting spirit score:', error);
      alert('Error submitting spirit score');
    }
  };

  const canSubmitSpirit = ['player', 'team_manager'].includes(user?.role);

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
          <h1 className="text-3xl font-bold text-gray-900">Spirit Scores</h1>
          <p className="text-gray-600 mt-2">Track and submit spirit of the game scores</p>
        </div>
        {canSubmitSpirit && (
          <Button onClick={() => setShowSubmitModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Submit Spirit Score
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{spiritScores.length}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <Star className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {spiritScores.length > 0 
                    ? (spiritScores.reduce((sum, score) => sum + (score.averageScore || score.totalScore / 5), 0) / spiritScores.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <div className="p-3 bg-secondary-100 rounded-full">
                <Award className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Highest Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {spiritScores.length > 0 
                    ? Math.max(...spiritScores.map(score => score.totalScore || 0))
                    : '0'
                  }
                </p>
              </div>
              <div className="p-3 bg-success-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tournaments</p>
                <p className="text-2xl font-bold text-gray-900">{tournaments.length}</p>
              </div>
              <div className="p-3 bg-warning-100 rounded-full">
                <Trophy className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Spirit Scores List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Spirit Scores</h2>
        
        {spiritScores.length > 0 ? (
          <div className="space-y-4">
            {spiritScores.map((score, index) => (
              <motion.div
                key={score._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {score.averageScore || (score.totalScore / 5).toFixed(1)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{score.scoredTeam?.name || 'Unknown Team'}</h3>
                    <p className="text-sm text-gray-500">{score.match?.tournament?.title || score.match?.tournament?.name || 'Unknown Tournament'}</p>
                    <p className="text-xs text-gray-400">Submitted by {score.submittedBy?.name || score.scoringTeam?.name || 'Anonymous'}</p>
                    <div className="flex gap-1 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Rules: {score.scores?.rulesKnowledge || 0}</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Fair: {score.scores?.fairMindedness || 0}</span>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Attitude: {score.scores?.positiveAttitude || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(score.averageScore || (score.totalScore / 5)) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(score.submittedAt || score.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No spirit scores yet</h3>
            <p className="text-gray-500 mb-6">Start submitting spirit scores to track team sportsmanship</p>
            {canSubmitSpirit && (
              <Button onClick={() => setShowSubmitModal(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Submit First Score
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Submit Spirit Score Modal */}
      <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="Submit Spirit Score">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Match</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={spiritData.match}
              onChange={(e) => setSpiritData({...spiritData, match: e.target.value})}
              required
            >
              <option value="">Select Match</option>
              {matches.map(match => (
                <option key={match._id} value={match._id}>
                  {match.teamA?.name || 'Team A'} vs {match.teamB?.name || 'Team B'} - {match.field}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team to Score</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={spiritData.team}
              onChange={(e) => setSpiritData({...spiritData, team: e.target.value})}
              required
            >
              <option value="">Select Team to Score</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {[
              { key: 'rulesKnowledge', label: 'Rules Knowledge & Use' },
              { key: 'foulsAndBodyContact', label: 'Fouls & Body Contact' },
              { key: 'fairMindedness', label: 'Fair-Mindedness' },
              { key: 'positiveAttitude', label: 'Positive Attitude' },
              { key: 'communication', label: 'Communication' }
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map(value => (
                    <Button
                      key={value}
                      type="button"
                      size="sm"
                      variant={spiritData[key] === value ? 'default' : 'outline'}
                      onClick={() => setSpiritData({...spiritData, [key]: value})}
                      className="w-10 h-10"
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              value={spiritData.comments}
              onChange={(e) => setSpiritData({...spiritData, comments: e.target.value})}
              placeholder="Optional comments about the team's spirit..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowSubmitModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Spirit Score</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}