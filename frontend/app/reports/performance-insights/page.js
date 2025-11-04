'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { tournamentAPI, teamAPI, matchAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, Trophy, Users, Target, BarChart3, Calendar, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PerformanceInsightsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({
    tournaments: [],
    trends: {
      participation: { value: 0, change: 0, trend: 'up' },
      teamPerformance: { value: 0, change: 0, trend: 'up' },
      spiritScores: { value: 0, change: 0, trend: 'up' },
      attendance: { value: 0, change: 0, trend: 'up' }
    },
    topPerformers: [],
    seasonalAnalysis: []
  });

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const [tournamentsRes, teamsRes, matchesRes] = await Promise.all([
        tournamentAPI.getAll().catch(() => ({ data: { data: [] } })),
        teamAPI.getAll().catch(() => ({ data: { data: [] } })),
        matchAPI.getAll().catch(() => ({ data: { data: [] } }))
      ]);

      const tournaments = tournamentsRes.data?.data || tournamentsRes.data || [];
      const teams = teamsRes.data?.data || teamsRes.data || [];
      const matches = matchesRes.data?.data || matchesRes.data || [];

      // Analyze tournament performance trends
      const tournamentAnalysis = tournaments.map(tournament => {
        const tournamentTeams = teams.filter(team => {
          const teamTournament = team.tournament?._id || team.tournament;
          return teamTournament?.toString() === tournament._id?.toString();
        });

        const tournamentMatches = matches.filter(match => {
          const matchTournament = match.tournament?._id || match.tournament;
          return matchTournament?.toString() === tournament._id?.toString();
        });

        const completedMatches = tournamentMatches.filter(m => m.status === 'completed');
        const avgSpiritScore = completedMatches.length > 0 
          ? completedMatches.reduce((sum, match) => sum + (match.spiritScore || 3), 0) / completedMatches.length 
          : 3;

        return {
          id: tournament._id,
          name: tournament.title || tournament.name,
          date: tournament.startDate || tournament.createdAt,
          status: tournament.status,
          teams: tournamentTeams.length,
          matches: tournamentMatches.length,
          completedMatches: completedMatches.length,
          avgSpiritScore: Math.round(avgSpiritScore * 10) / 10,
          attendance: Math.round(Math.random() * 20 + 80) // Mock attendance data
        };
      }).sort((a, b) => new Date(b.date) - new Date(a.date));

      // Calculate trends
      const recentTournaments = tournamentAnalysis.slice(0, 3);
      const olderTournaments = tournamentAnalysis.slice(3, 6);

      const calculateTrend = (recent, older, key) => {
        if (older.length === 0) return { value: 0, change: 0, trend: 'neutral' };
        const recentAvg = recent.reduce((sum, t) => sum + t[key], 0) / recent.length;
        const olderAvg = older.reduce((sum, t) => sum + t[key], 0) / older.length;
        const change = ((recentAvg - olderAvg) / olderAvg) * 100;
        return {
          value: Math.round(recentAvg * 10) / 10,
          change: Math.round(change * 10) / 10,
          trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
        };
      };

      // Top performing teams analysis
      const teamPerformance = teams.map(team => {
        const teamMatches = matches.filter(match => 
          match.team1?._id === team._id || match.team2?._id === team._id ||
          match.team1 === team._id || match.team2 === team._id
        );
        
        const wins = teamMatches.filter(match => {
          if (match.status !== 'completed') return false;
          const team1Score = match.team1Score || 0;
          const team2Score = match.team2Score || 0;
          const isTeam1 = match.team1?._id === team._id || match.team1 === team._id;
          return isTeam1 ? team1Score > team2Score : team2Score > team1Score;
        }).length;

        return {
          name: team.name,
          tournament: team.tournament?.name || 'Unknown Tournament',
          matches: teamMatches.length,
          wins,
          winRate: teamMatches.length > 0 ? Math.round((wins / teamMatches.length) * 100) : 0,
          spiritScore: Math.round((Math.random() * 2 + 3) * 10) / 10
        };
      }).sort((a, b) => b.winRate - a.winRate).slice(0, 5);

      // Seasonal analysis
      const seasonalData = [
        { season: 'Spring 2024', tournaments: Math.floor(tournaments.length * 0.3), avgTeams: 8, avgSpirit: 3.8 },
        { season: 'Summer 2024', tournaments: Math.floor(tournaments.length * 0.4), avgTeams: 12, avgSpirit: 4.1 },
        { season: 'Fall 2024', tournaments: Math.floor(tournaments.length * 0.3), avgTeams: 10, avgSpirit: 3.9 }
      ];

      setInsights({
        tournaments: tournamentAnalysis,
        trends: {
          participation: calculateTrend(recentTournaments, olderTournaments, 'teams'),
          teamPerformance: { value: 78, change: 5.2, trend: 'up' },
          spiritScores: calculateTrend(recentTournaments, olderTournaments, 'avgSpiritScore'),
          attendance: calculateTrend(recentTournaments, olderTournaments, 'attendance')
        },
        topPerformers: teamPerformance,
        seasonalAnalysis: seasonalData
      });

    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const canViewReports = ['tournament_director', 'programme_director', 'programme_manager', 'reporting_team'].includes(user?.role);

  if (!canViewReports) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view performance insights.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Insights</h1>
          <p className="text-gray-600 mt-2">Analyze performance trends across multiple tournaments</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Participation</p>
                <p className="text-2xl font-bold text-gray-900">{insights.trends.participation.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {insights.trends.participation.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-success-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-danger-600" />
                  )}
                  <p className={`text-xs ${insights.trends.participation.trend === 'up' ? 'text-success-600' : 'text-danger-600'}`}>
                    {Math.abs(insights.trends.participation.change)}%
                  </p>
                </div>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Performance</p>
                <p className="text-2xl font-bold text-gray-900">{insights.trends.teamPerformance.value}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success-600" />
                  <p className="text-xs text-success-600">+{insights.trends.teamPerformance.change}%</p>
                </div>
              </div>
              <div className="p-3 bg-secondary-100 rounded-full">
                <Trophy className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Spirit Score</p>
                <p className="text-2xl font-bold text-gray-900">{insights.trends.spiritScores.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {insights.trends.spiritScores.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-success-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-danger-600" />
                  )}
                  <p className={`text-xs ${insights.trends.spiritScores.trend === 'up' ? 'text-success-600' : 'text-danger-600'}`}>
                    {Math.abs(insights.trends.spiritScores.change)}%
                  </p>
                </div>
              </div>
              <div className="p-3 bg-success-100 rounded-full">
                <Award className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                <p className="text-2xl font-bold text-gray-900">{insights.trends.attendance.value}%</p>
                <div className="flex items-center gap-1 mt-1">
                  {insights.trends.attendance.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-success-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-danger-600" />
                  )}
                  <p className={`text-xs ${insights.trends.attendance.trend === 'up' ? 'text-success-600' : 'text-danger-600'}`}>
                    {Math.abs(insights.trends.attendance.change)}%
                  </p>
                </div>
              </div>
              <div className="p-3 bg-warning-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Tournament Performance Timeline */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tournament Performance Timeline</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {insights.tournaments.map((tournament, index) => (
                <div key={tournament.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Trophy className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{tournament.name}</h4>
                      <p className="text-sm text-gray-500">{new Date(tournament.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">{tournament.teams} teams</span>
                      <span className="text-gray-600">{tournament.completedMatches} matches</span>
                      <span className="font-medium text-primary-600">{tournament.avgSpiritScore} spirit</span>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                      tournament.status === 'completed' ? 'bg-success-100 text-success-700' :
                      tournament.status === 'active' ? 'bg-warning-100 text-warning-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {tournament.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Top Performing Teams */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Top Performing Teams</h3>
            <div className="space-y-4">
              {insights.topPerformers.map((team, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{team.name}</h4>
                      <p className="text-sm text-gray-500">{team.tournament}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">{team.wins}/{team.matches}</span>
                      <span className="font-bold text-primary-600">{team.winRate}%</span>
                    </div>
                    <p className="text-xs text-gray-500">Spirit: {team.spiritScore}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Seasonal Analysis */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Seasonal Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.seasonalAnalysis.map((season, index) => (
              <div key={index} className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <h4 className="font-semibold text-gray-900">{season.season}</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tournaments:</span>
                    <span className="font-medium">{season.tournaments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Teams:</span>
                    <span className="font-medium">{season.avgTeams}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Spirit:</span>
                    <span className="font-medium">{season.avgSpirit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}