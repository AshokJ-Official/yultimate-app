'use client';

import { useState, useEffect } from 'react';
import { spiritAPI, tournamentAPI } from '@/lib/api';
import Card from '@/components/ui/Card';
import { Trophy, Medal, Award, Star, TrendingUp, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SpiritLeaderboardPage() {
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
      const response = await spiritAPI.getLeaderboard(selectedTournament);
      const leaderboardData = response.data?.data || response.data || [];
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Award className="w-8 h-8 text-amber-600" />;
      default:
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-blue-600">{rank}</span>
          </div>
        );
    }
  };

  const getRankBg = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 18) return 'text-green-600';
    if (score >= 15) return 'text-blue-600';
    if (score >= 12) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score) => {
    if (score >= 18) return 'bg-green-100 text-green-800';
    if (score >= 15) return 'bg-blue-100 text-blue-800';
    if (score >= 12) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Spirit Leaderboard</h1>
          <p className="text-gray-600 mt-2">Overall spirit rankings separate from performance scores</p>
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

      {/* Spirit Leaderboard */}
      {selectedTournament && (
        <div className="space-y-6">
          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Spirit Champions</h2>
              <div className="flex justify-center items-end gap-8">
                {/* 2nd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="w-24 h-20 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg flex items-end justify-center pb-2">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                  <div className="mt-4">
                    <Medal className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <h3 className="font-bold text-gray-900">{leaderboard[1]?.team?.name}</h3>
                    <p className="text-2xl font-bold text-gray-600">{leaderboard[1]?.averageSpiritScore}</p>
                  </div>
                </motion.div>

                {/* 1st Place */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-t-lg flex items-end justify-center pb-2">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <div className="mt-4">
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-2" />
                    <h3 className="font-bold text-gray-900 text-lg">{leaderboard[0]?.team?.name}</h3>
                    <p className="text-3xl font-bold text-yellow-600">{leaderboard[0]?.averageSpiritScore}</p>
                  </div>
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className="w-24 h-16 bg-gradient-to-t from-amber-500 to-amber-600 rounded-t-lg flex items-end justify-center pb-2">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div className="mt-4">
                    <Award className="w-10 h-10 text-amber-600 mx-auto mb-2" />
                    <h3 className="font-bold text-gray-900">{leaderboard[2]?.team?.name}</h3>
                    <p className="text-xl font-bold text-amber-600">{leaderboard[2]?.averageSpiritScore}</p>
                  </div>
                </motion.div>
              </div>
            </Card>
          )}

          {/* Full Rankings */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900">Complete Spirit Rankings</h2>
            </div>
            
            {leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((team, index) => (
                  <motion.div
                    key={team.team.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${getRankBg(team.rank)}`}
                  >
                    <div className="flex items-center gap-4">
                      {getRankIcon(team.rank)}
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{team.team.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>Games: {team.gamesPlayed}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>Spirit Score</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className={`text-3xl font-bold ${getScoreColor(team.averageSpiritScore)}`}>
                            {team.averageSpiritScore}
                          </p>
                          <p className="text-xs text-gray-500">out of 20</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBadge(team.averageSpiritScore)}`}>
                          {team.averageSpiritScore >= 18 ? 'Excellent' :
                           team.averageSpiritScore >= 15 ? 'Great' :
                           team.averageSpiritScore >= 12 ? 'Good' : 'Needs Improvement'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No spirit scores yet</h3>
                <p className="text-gray-500">Spirit scores will appear here once teams start submitting them</p>
              </div>
            )}
          </Card>

          {/* Spirit Score Legend */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spirit Score Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Score Categories (0-4 each):</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Rules Knowledge & Use</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Fouls & Body Contact</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>Fair-Mindedness</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span>Positive Attitude</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span>Communication</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Rating Scale:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>18-20:</span>
                    <span className="text-green-600 font-medium">Excellent Spirit</span>
                  </div>
                  <div className="flex justify-between">
                    <span>15-17:</span>
                    <span className="text-blue-600 font-medium">Great Spirit</span>
                  </div>
                  <div className="flex justify-between">
                    <span>12-14:</span>
                    <span className="text-yellow-600 font-medium">Good Spirit</span>
                  </div>
                  <div className="flex justify-between">
                    <span>0-11:</span>
                    <span className="text-red-600 font-medium">Needs Improvement</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}