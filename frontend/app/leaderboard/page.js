'use client';

import { useState, useEffect } from 'react';
import { tournamentAPI } from '@/lib/api';
import Card from '@/components/ui/Card';
import { Trophy, Medal, Award, TrendingUp, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchLeaderboard();
    }
  }, [selectedTournament]);

  const fetchTournaments = async () => {
    try {
      const response = await tournamentAPI.getAll();
      const tournamentsData = response.data?.data || response.data || [];
      setTournaments(tournamentsData);
      if (tournamentsData.length > 0) {
        setSelectedTournament(tournamentsData[0]._id);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await tournamentAPI.getLeaderboard(selectedTournament);
      const leaderboardData = response.data?.data || response.data || [];
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
    }
  };

  if (loading && tournaments.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Tournament Leaderboard</h1>
          <p className="text-gray-600 mt-2">Auto-generated standings based on wins, losses, points, and spirit scores</p>
        </div>
      </div>

      {/* Tournament Selection */}
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Select Tournament:</label>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedTournament}
            onChange={(e) => setSelectedTournament(e.target.value)}
          >
            <option value="">Select a tournament</option>
            {tournaments.map(tournament => (
              <option key={tournament._id} value={tournament._id}>
                {tournament.title || tournament.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Leaderboard */}
      {selectedTournament && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Standings</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="space-y-4">
              {leaderboard.map((team, index) => (
                <motion.div
                  key={team.team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    team.rank <= 3 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getRankColor(team.rank)}`}>
                      {getRankIcon(team.rank)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{team.team.name}</h3>
                      <div className="flex gap-4 text-sm text-gray-600 mt-1">
                        <span>GP: {team.gamesPlayed}</span>
                        <span className="text-green-600">W: {team.wins}</span>
                        <span className="text-red-600">L: {team.losses}</span>
                        {team.draws > 0 && <span className="text-yellow-600">D: {team.draws}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{team.points}</p>
                      <p className="text-xs text-gray-500">Points</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-700">{team.pointsFor}-{team.pointsAgainst}</p>
                      <p className="text-xs text-gray-500">Goals</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-700">{team.pointDifference > 0 ? '+' : ''}{team.pointDifference}</p>
                      <p className="text-xs text-gray-500">Diff</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <p className="text-lg font-semibold text-blue-600">{team.averageSpiritScore.toFixed(1)}</p>
                      </div>
                      <p className="text-xs text-gray-500">Spirit</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No standings available</h3>
              <p className="text-gray-500">Teams and matches need to be added to generate standings</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}