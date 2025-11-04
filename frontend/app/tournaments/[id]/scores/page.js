'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { matchAPI, tournamentAPI, teamAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Target, Users } from 'lucide-react';
import Link from 'next/link';

export default function TournamentScoresPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [tournamentRes, matchesRes, teamsRes] = await Promise.all([
        tournamentAPI.getById(id),
        matchAPI.getByTournament(id),
        teamAPI.getByTournament(id)
      ]);
      
      setTournament(tournamentRes.data.data || tournamentRes.data);
      setMatches(matchesRes.data.data || matchesRes.data || []);
      setTeams(teamsRes.data.data || teamsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Mock data fallback
      setMatches([
        {
          _id: '1',
          teamA: { name: 'Team Alpha' },
          teamB: { name: 'Team Beta' },
          scoreA: 15,
          scoreB: 12,
          status: 'completed'
        },
        {
          _id: '2',
          teamA: { name: 'Team Gamma' },
          teamB: { name: 'Team Delta' },
          scoreA: 13,
          scoreB: 15,
          status: 'completed'
        }
      ]);
      setTeams([
        { _id: '1', name: 'Team Alpha', stats: { wins: 1, losses: 0, points: 15 } },
        { _id: '2', name: 'Team Beta', stats: { wins: 0, losses: 1, points: 12 } },
        { _id: '3', name: 'Team Gamma', stats: { wins: 0, losses: 1, points: 13 } },
        { _id: '4', name: 'Team Delta', stats: { wins: 1, losses: 0, points: 15 } }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const completedMatches = matches.filter(match => match.status === 'completed');
  const sortedTeams = teams.sort((a, b) => (b.stats?.wins || 0) - (a.stats?.wins || 0));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href={`/tournaments/${id}`}>
          <Button variant="ghost" className="flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Tournament
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tournament Scores
          </h1>
          <p className="text-gray-600">{tournament?.title}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leaderboard */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">Leaderboard</h2>
            </div>
            
            <div className="space-y-3">
              {sortedTeams.length > 0 ? sortedTeams.map((team, index) => (
                <div key={team._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium">{team.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {team.stats?.wins || 0}W - {team.stats?.losses || 0}L
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No teams data available</p>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Results */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-semibold">Recent Results</h2>
            </div>
            
            <div className="space-y-4">
              {completedMatches.length > 0 ? completedMatches.slice(-5).reverse().map((match, index) => (
                <motion.div
                  key={match._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{match.teamA?.name || 'TBD'}</span>
                        <span className="text-lg font-bold">{match.scoreA || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{match.teamB?.name || 'TBD'}</span>
                        <span className="text-lg font-bold">{match.scoreB || 0}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Link href={`/matches/${match._id}`}>
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No completed matches yet</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}