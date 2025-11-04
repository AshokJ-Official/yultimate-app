'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tournamentAPI, teamAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Settings, Play, Save } from 'lucide-react';
import Link from 'next/link';

export default function ScheduleBuilderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  
  const [config, setConfig] = useState({
    type: 'round_robin',
    startDate: '',
    matchDuration: 90,
    numRounds: 5
  });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [tournamentRes, teamsRes] = await Promise.all([
        tournamentAPI.getById(id),
        teamAPI.getByTournament(id)
      ]);
      
      setTournament(tournamentRes.data.data || tournamentRes.data);
      setTeams(teamsRes.data.data || teamsRes.data || []);
      
      const tournamentData = tournamentRes.data.data || tournamentRes.data;
      if (tournamentData?.startDate) {
        setConfig(prev => ({
          ...prev,
          startDate: new Date(tournamentData.startDate).toISOString().split('T')[0]
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSchedule = async () => {
    setGenerating(true);
    try {
      const response = await tournamentAPI.generateSchedule(id, config);
      setGeneratedSchedule(response.data.data);
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert('Failed to generate schedule');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!generatedSchedule) return;
    
    setSaving(true);
    try {
      await tournamentAPI.saveSchedule(id, { matches: generatedSchedule.matches });
      alert('Schedule saved successfully!');
      router.push(`/tournaments/${id}/schedule`);
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const approvedTeams = teams.filter(team => team.status === 'approved');

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
            Schedule Builder
          </h1>
          <p className="text-gray-600">{tournament?.title}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold">Configuration</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tournament Type
                  </label>
                  <select
                    value={config.type}
                    onChange={(e) => setConfig(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="round_robin">Round Robin</option>
                    <option value="bracket">Bracket/Elimination</option>
                    <option value="swiss">Swiss System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={config.startDate}
                    onChange={(e) => setConfig(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Match Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={config.matchDuration}
                    onChange={(e) => setConfig(prev => ({ ...prev, matchDuration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="30"
                    max="180"
                  />
                </div>

                {config.type === 'swiss' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Rounds
                    </label>
                    <input
                      type="number"
                      value={config.numRounds}
                      onChange={(e) => setConfig(prev => ({ ...prev, numRounds: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="3"
                      max="10"
                    />
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600 mb-4">
                    <p><strong>Teams:</strong> {approvedTeams.length}</p>
                    <p><strong>Fields:</strong> {tournament?.fields?.length || 0}</p>
                  </div>

                  <Button
                    onClick={handleGenerateSchedule}
                    disabled={generating || approvedTeams.length < 2 || !config.startDate}
                    className="w-full flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    {generating ? 'Generating...' : 'Generate Schedule'}
                  </Button>
                  
                  {approvedTeams.length < 2 && (
                    <p className="text-sm text-amber-600 mt-2">
                      ⚠️ Need at least 2 teams for proper schedule. Current: {approvedTeams.length}
                    </p>
                  )}
                  
                  {!config.startDate && (
                    <p className="text-sm text-red-600 mt-2">
                      ❌ Please select a start date
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-500" />
                  <h2 className="text-lg font-semibold">Schedule Preview</h2>
                </div>
                
                {generatedSchedule && (
                  <Button
                    onClick={handleSaveSchedule}
                    disabled={saving}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Schedule'}
                  </Button>
                )}
              </div>

              {generatedSchedule ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Total Matches:</span>
                        <span className="font-medium ml-2">{generatedSchedule.summary.totalMatches}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Total Rounds:</span>
                        <span className="font-medium ml-2">{generatedSchedule.summary.totalRounds}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Fields Used:</span>
                        <span className="font-medium ml-2">{generatedSchedule.summary.fieldsUsed}</span>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {generatedSchedule.matches.map((match, index) => {
                      const teamA = teams.find(t => t._id === match.teamA);
                      const teamB = teams.find(t => t._id === match.teamB);
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">
                              {teamA?.name || 'Team A'} vs {teamB?.name || 'Team B'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {match.round} • {match.field}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(match.scheduledTime).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schedule Generated</h3>
                  <p className="text-gray-500">Configure your tournament settings and click "Generate Schedule" to preview matches</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}