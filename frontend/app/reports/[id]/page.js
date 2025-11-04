'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tournamentAPI, teamAPI, matchAPI, spiritAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Users, Trophy, Calendar, Target, Star } from 'lucide-react';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [spiritScores, setSpiritScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchReportData();
    }
  }, [params.id]);

  const fetchReportData = async () => {
    try {
      const [tournamentRes, teamsRes, matchesRes, spiritRes] = await Promise.all([
        tournamentAPI.getById(params.id),
        teamAPI.getByTournament(params.id),
        matchAPI.getByTournament(params.id),
        spiritAPI.getLeaderboard(params.id).catch(() => ({ data: { data: [] } }))
      ]);

      setTournament(tournamentRes.data?.data || tournamentRes.data);
      setTeams(teamsRes.data?.data || teamsRes.data || []);
      setMatches(matchesRes.data?.data || matchesRes.data || []);
      setSpiritScores(spiritRes.data?.data || spiritRes.data || []);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    let csvContent = 'Tournament Report\n\n';
    
    // Tournament Info
    csvContent += 'Tournament Information\n';
    csvContent += `Name,${tournament?.title || tournament?.name}\n`;
    csvContent += `Generated,${new Date().toLocaleString()}\n`;
    csvContent += `Total Teams,${teams.length}\n`;
    csvContent += `Total Matches,${matches.length}\n`;
    csvContent += `Completed Matches,${matches.filter(m => m.status === 'completed').length}\n\n`;
    
    // Teams Section
    csvContent += 'Teams\n';
    csvContent += 'Name,Status,Players\n';
    teams.forEach(team => {
      csvContent += `${team.name},${team.status},${team.players?.length || 0}\n`;
    });
    
    csvContent += '\n';
    
    // Matches Section
    csvContent += 'Matches\n';
    csvContent += 'Teams,Score,Status,Date,Field\n';
    matches.forEach(match => {
      csvContent += `"${match.teamA?.name} vs ${match.teamB?.name}","${match.score?.teamA || 0} - ${match.score?.teamB || 0}",${match.status},${new Date(match.scheduledTime).toLocaleDateString()},${match.field}\n`;
    });

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tournament?.title || 'tournament'}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{tournament.title || tournament.name}</h1>
            <p className="text-gray-600 mt-2">Tournament Report</p>
          </div>
        </div>
        <Button onClick={handleDownload} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Report
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary-600" />
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Matches</p>
                <p className="text-2xl font-bold text-gray-900">{matches.length}</p>
              </div>
              <Trophy className="w-8 h-8 text-secondary-600" />
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{matches.filter(m => m.status === 'completed').length}</p>
              </div>
              <Target className="w-8 h-8 text-success-600" />
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Spirit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {spiritScores.length > 0 
                    ? (spiritScores.reduce((sum, s) => sum + (s.averageSpiritScore || 0), 0) / spiritScores.length).toFixed(1)
                    : 'N/A'
                  }
                </p>
              </div>
              <Star className="w-8 h-8 text-warning-600" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Teams Section */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Registered Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team, index) => (
              <motion.div
                key={team._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <h3 className="font-semibold text-gray-900">{team.name}</h3>
                <p className="text-sm text-gray-600">Status: {team.status}</p>
                <p className="text-sm text-gray-600">Players: {team.players?.length || 0}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      {/* Matches Section */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Match Results</h2>
          <div className="space-y-4">
            {matches.map((match, index) => (
              <motion.div
                key={match._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {match.teamA?.name} vs {match.teamB?.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(match.scheduledTime).toLocaleDateString()} - Field {match.field}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {match.score?.teamA || 0} - {match.score?.teamB || 0}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    match.status === 'completed' ? 'bg-green-100 text-green-800' :
                    match.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {match.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}