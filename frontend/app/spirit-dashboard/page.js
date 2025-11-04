'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { spiritAPI, teamAPI } from '@/lib/api';
import Card from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Award, Users, Star, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SpiritDashboardPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [spiritSummary, setSpiritSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchSpiritSummary();
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    try {
      const response = await teamAPI.getAll();
      const teamsData = response.data?.data || response.data || [];
      setTeams(teamsData);
      if (teamsData.length > 0) {
        setSelectedTeam(teamsData[0]._id);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpiritSummary = async () => {
    try {
      const response = await spiritAPI.getTeamSummary(selectedTeam);
      setSpiritSummary(response.data);
    } catch (error) {
      console.error('Error fetching spirit summary:', error);
      setSpiritSummary(null);
    }
  };

  const getScoreColor = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 3.5) return 'text-green-600';
    if (numScore >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 3.5) return 'bg-green-100';
    if (numScore >= 2.5) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const categories = [
    { key: 'rulesKnowledge', label: 'Rules Knowledge', icon: '📚' },
    { key: 'foulsAndContact', label: 'Fouls & Contact', icon: '⚠️' },
    { key: 'fairMindedness', label: 'Fair-Mindedness', icon: '⚖️' },
    { key: 'positiveAttitude', label: 'Positive Attitude', icon: '😊' },
    { key: 'communication', label: 'Communication', icon: '💬' }
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Spirit Score Dashboard</h1>
          <p className="text-gray-600 mt-2">Auto-calculated per-match and average spirit scores</p>
        </div>
      </div>

      {/* Team Selection */}
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Select Team:</label>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <option value="">Select a team</option>
            {teams.map(team => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {spiritSummary && (
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Scores Received</p>
                    <p className="text-2xl font-bold text-gray-900">{spiritSummary.received.count}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <TrendingDown className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Scores Given</p>
                    <p className="text-2xl font-bold text-gray-900">{spiritSummary.given.count}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Received</p>
                    <p className={`text-2xl font-bold ${getScoreColor(spiritSummary.received.averages.total)}`}>
                      {spiritSummary.received.averages.total}/20
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Given</p>
                    <p className={`text-2xl font-bold ${getScoreColor(spiritSummary.given.averages.total)}`}>
                      {spiritSummary.given.averages.total}/20
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Star className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scores Received */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Eye className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Scores You Received</h2>
              </div>
              
              <div className="space-y-4">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium text-gray-900">{category.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBg(spiritSummary.received.averages[category.key])} ${getScoreColor(spiritSummary.received.averages[category.key])}`}>
                        {spiritSummary.received.averages[category.key]}/4
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Scores Given */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Scores You Gave</h2>
              </div>
              
              <div className="space-y-4">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.key}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium text-gray-900">{category.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBg(spiritSummary.given.averages[category.key])} ${getScoreColor(spiritSummary.given.averages[category.key])}`}>
                        {spiritSummary.given.averages[category.key]}/4
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Received */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Scores Received</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {spiritSummary.received.scores.slice(0, 10).map((score, index) => (
                  <motion.div
                    key={score._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">From: {score.scoringTeam?.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(score.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getScoreColor(score.totalScore)}`}>
                          {score.totalScore}/20
                        </p>
                      </div>
                    </div>
                    {score.comments && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                        <span className="font-medium">Feedback: </span>
                        {score.comments}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Recent Given */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Scores Given</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {spiritSummary.given.scores.slice(0, 10).map((score, index) => (
                  <motion.div
                    key={score._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">To: {score.scoredTeam?.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(score.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getScoreColor(score.totalScore)}`}>
                          {score.totalScore}/20
                        </p>
                      </div>
                    </div>
                    {score.comments && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                        <span className="font-medium">Your feedback: </span>
                        {score.comments}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}