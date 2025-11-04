'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { matchAPI, spiritAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Users, Trophy, Play, Pause, Star, Plus, Minus, Camera, Upload, Download, X } from 'lucide-react';
import SpiritScoreAlert from '@/components/SpiritScoreAlert';

export default function MatchDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showSpiritModal, setShowSpiritModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [scoreData, setScoreData] = useState({
    team1Score: 0,
    team2Score: 0
  });
  const [spiritData, setSpiritData] = useState({
    rulesKnowledge: 0,
    foulsAndBodyContact: 0,
    fairMindedness: 0,
    positiveAttitude: 0,
    communication: 0,
    comments: ''
  });

  useEffect(() => {
    if (id) {
      fetchMatchDetails();
    }
  }, [id]);

  useEffect(() => {
    // Load existing attendance data when match is loaded
    if (match) {
      const newAttendanceStatus = {};
      
      // Load Team A attendance
      match.attendance?.teamA?.forEach(attendance => {
        const playerId = attendance.player?._id || attendance.player;
        if (playerId) {
          newAttendanceStatus[`A-${playerId}`] = attendance.present;
        }
      });
      
      // Load Team B attendance
      match.attendance?.teamB?.forEach(attendance => {
        const playerId = attendance.player?._id || attendance.player;
        if (playerId) {
          newAttendanceStatus[`B-${playerId}`] = attendance.present;
        }
      });
      
      setAttendanceStatus(newAttendanceStatus);
    }
  }, [match]);

  const fetchMatchDetails = async () => {
    try {
      const response = await matchAPI.getById(id);
      const matchData = response.data?.data || response.data;
      setMatch(matchData);
      setScoreData({
        team1Score: matchData.score?.teamA || matchData.team1Score || 0,
        team2Score: matchData.score?.teamB || matchData.team2Score || 0
      });
    } catch (error) {
      console.error('Error fetching match details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreUpdate = async (e) => {
    e.preventDefault();
    try {
      await matchAPI.updateScore(id, {
        teamAScore: scoreData.team1Score,
        teamBScore: scoreData.team2Score
      });
      setShowScoreModal(false);
      fetchMatchDetails();
    } catch (error) {
      console.error('Error updating score:', error);
      alert('Error updating score');
    }
  };

  const markPlayerAttendance = async (playerId, team, present) => {
    try {
      // Optimistically update UI
      setAttendanceStatus(prev => ({
        ...prev,
        [`${team}-${playerId}`]: present
      }));
      
      await matchAPI.markAttendance(id, {
        team,
        playerId,
        present
      });
      
      // Don't show alert, just update silently
      fetchMatchDetails();
    } catch (error) {
      console.error('Error marking attendance:', error);
      // Revert optimistic update on error
      setAttendanceStatus(prev => {
        const newState = { ...prev };
        delete newState[`${team}-${playerId}`];
        return newState;
      });
      alert('Error marking attendance');
    }
  };
  
  const getAttendanceStatus = (playerId, team) => {
    const key = `${team}-${playerId}`;
    return attendanceStatus[key];
  };

  const handleSpiritSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        matchId: id,
        scoredTeamId: match.teamB?._id || match.team2?._id,
        scores: {
          rulesKnowledge: spiritData.rulesKnowledge,
          foulsAndContact: spiritData.foulsAndBodyContact,
          fairMindedness: spiritData.fairMindedness,
          positiveAttitude: spiritData.positiveAttitude,
          communication: spiritData.communication
        },
        comments: spiritData.comments
      };
      
      console.log('Submitting spirit score:', submitData);
      await spiritAPI.submit(submitData);
      setShowSpiritModal(false);
      setSpiritData({
        rulesKnowledge: 0,
        foulsAndBodyContact: 0,
        fairMindedness: 0,
        positiveAttitude: 0,
        communication: 0,
        comments: ''
      });
      alert('Spirit score submitted successfully!');
    } catch (error) {
      console.error('Error submitting spirit score:', error);
      alert('Error submitting spirit score: ' + (error.response?.data?.message || error.message));
    }
  };

  const adjustScore = (team, increment) => {
    if (team === 1) {
      setScoreData(prev => ({
        ...prev,
        team1Score: Math.max(0, prev.team1Score + increment)
      }));
    } else {
      setScoreData(prev => ({
        ...prev,
        team2Score: Math.max(0, prev.team2Score + increment)
      }));
    }
  };

  const canUpdateScore = ['tournament_director', 'scoring_team', 'volunteer'].includes(user?.role);
  const canSubmitSpirit = ['player', 'team_manager'].includes(user?.role);
  const canMarkAttendance = ['volunteer', 'team_manager'].includes(user?.role);
  const canUploadPhotos = ['tournament_director', 'team_manager', 'volunteer'].includes(user?.role);

  const getUserTeamId = () => {
    if (!match || !user) return null;
    
    // For team managers, check if they manage either team
    if (user.role === 'team_manager') {
      // Check if user is manager of teamA or teamB
      if (match.teamA?.manager === user.id || match.teamA?.manager?._id === user.id) {
        return match.teamA._id;
      }
      if (match.teamB?.manager === user.id || match.teamB?.manager?._id === user.id) {
        return match.teamB._id;
      }
    }
    
    // For players, check if they're in either team's roster
    if (user.role === 'player') {
      const isInTeamA = match.teamA?.players?.some(p => 
        (p.player?._id || p.player) === user.id || p._id === user.id
      );
      const isInTeamB = match.teamB?.players?.some(p => 
        (p.player?._id || p.player) === user.id || p._id === user.id
      );
      
      if (isInTeamA) return match.teamA._id;
      if (isInTeamB) return match.teamB._id;
    }
    
    // Fallback: use user.teamId if available
    if (user.teamId) {
      if (match.teamA?._id === user.teamId) return match.teamA._id;
      if (match.teamB?._id === user.teamId) return match.teamB._id;
    }
    
    console.log('Could not determine team ID for user:', user.id, 'in match:', match._id);
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Match Not Found</h2>
          <p className="text-gray-600 mb-4">The match you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/matches')}>Back to Matches</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Spirit Score Alert */}
      {user && ['team_manager', 'player'].includes(user.role) && match && (
        <SpiritScoreAlert 
          teamId={getUserTeamId()} 
          onSpiritSubmitted={fetchMatchDetails}
        />
      )}
      
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.push('/matches')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Matches
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Match Details</h1>
          <p className="text-gray-600">{match.teamA?.name || match.team1?.name} vs {match.teamB?.name || match.team2?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Info */}
        <div className="lg:col-span-2">
          <Card className="p-6 mb-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-8 mb-4">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900">{match.teamA?.name || match.team1?.name}</h3>
                  <div className="text-4xl font-bold text-primary-600 mt-2">{match.score?.teamA || match.team1Score || 0}</div>
                </div>
                <div className="text-2xl font-bold text-gray-400">VS</div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900">{match.teamB?.name || match.team2?.name}</h3>
                  <div className="text-4xl font-bold text-primary-600 mt-2">{match.score?.teamB || match.team2Score || 0}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                {match.status === 'in_progress' && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  match.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  match.status === 'in_progress' ? 'bg-red-100 text-red-800' :
                  match.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {match.status === 'in_progress' ? 'LIVE' : match.status?.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{match.tournament?.title || match.tournament?.name}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {new Date(match.scheduledTime).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Field {match.field}</span>
              </div>
            </div>
          </Card>

          {/* Match Status Info */}
          {match.status === 'completed' && (
            <Card className="p-6 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Match Completed</h2>
                <p className="text-gray-600">
                  Final Score: {match.teamA?.name} {match.score?.teamA || 0} - {match.score?.teamB || 0} {match.teamB?.name}
                </p>
                {match.winner && (
                  <p className="text-green-600 font-medium mt-2">
                    Winner: {match.winner.toString() === match.teamA?._id ? match.teamA?.name : match.teamB?.name}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Live Scoring */}
          {canUpdateScore && match.status !== 'completed' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Scoring</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <h3 className="font-medium text-gray-900 mb-3">{match.teamA?.name || match.team1?.name}</h3>
                  <div className="flex items-center justify-center gap-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => adjustScore(1, -1)}
                      disabled={scoreData.team1Score <= 0}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-3xl font-bold text-primary-600 min-w-[60px]">
                      {scoreData.team1Score}
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => adjustScore(1, 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="font-medium text-gray-900 mb-3">{match.teamB?.name || match.team2?.name}</h3>
                  <div className="flex items-center justify-center gap-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => adjustScore(2, -1)}
                      disabled={scoreData.team2Score <= 0}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-3xl font-bold text-primary-600 min-w-[60px]">
                      {scoreData.team2Score}
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => adjustScore(2, 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button 
                  className="flex-1"
                  onClick={async () => {
                    try {
                      await matchAPI.updateScore(id, {
                        teamAScore: scoreData.team1Score,
                        teamBScore: scoreData.team2Score
                      });
                      fetchMatchDetails();
                    } catch (error) {
                      console.error('Error updating score:', error);
                      alert('Error updating score');
                    }
                  }}
                >
                  Update Score
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowScoreModal(true)}
                >
                  Manual Entry
                </Button>
                {match.status === 'in_progress' && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={async () => {
                      try {
                        await matchAPI.complete(id);
                        fetchMatchDetails();
                        alert('Match completed successfully!');
                      } catch (error) {
                        console.error('Error completing match:', error);
                        alert('Error completing match');
                      }
                    }}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              {canUpdateScore && match.status !== 'completed' && (
                <Button 
                  className="w-full flex items-center gap-2"
                  onClick={() => setShowScoreModal(true)}
                >
                  {match.status === 'in_progress' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  Update Score
                </Button>
              )}
              
              {canUpdateScore && match.status === 'in_progress' && (
                <Button 
                  className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  onClick={async () => {
                    try {
                      await matchAPI.complete(id);
                      fetchMatchDetails();
                      alert('Match completed successfully!');
                    } catch (error) {
                      console.error('Error completing match:', error);
                      alert('Error completing match');
                    }
                  }}
                >
                  <Trophy className="w-4 h-4" />
                  Complete Match
                </Button>
              )}
              
              {canSubmitSpirit && (
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={() => setShowSpiritModal(true)}
                >
                  <Star className="w-4 h-4" />
                  Submit Spirit Score
                </Button>
              )}
              
              {canMarkAttendance && (
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={() => setShowAttendanceModal(true)}
                >
                  <Users className="w-4 h-4" />
                  Mark Attendance
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/matches/${id}/statistics`)}
              >
                View Statistics
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/matches/${id}/report`)}
              >
                Match Report
              </Button>
              
              {canUploadPhotos && (
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={() => setShowPhotoModal(true)}
                >
                  <Camera className="w-4 h-4" />
                  Upload Photos
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">90 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Format</span>
                <span className="font-medium">15 points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Referee</span>
                <span className="font-medium">Self-officiated</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Photo Gallery */}
      {match.photos && match.photos.length > 0 && (
        <Card className="p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Match Photos</h2>
            <span className="text-sm text-gray-500">{match.photos.length} photos</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {match.photos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative group cursor-pointer"
                onClick={() => window.open(photo.url, '_blank')}
              >
                <img
                  src={photo.url}
                  alt={photo.caption || `Match photo ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                  <Download className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                    {photo.caption}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Score Modal */}
      <Modal isOpen={showScoreModal} onClose={() => setShowScoreModal(false)} title="Update Score">
        <form onSubmit={handleScoreUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={match.teamA?.name || match.team1?.name}
              type="number"
              min="0"
              value={scoreData.team1Score}
              onChange={(e) => setScoreData({...scoreData, team1Score: parseInt(e.target.value) || 0})}
              required
            />
            <Input
              label={match.teamB?.name || match.team2?.name}
              type="number"
              min="0"
              value={scoreData.team2Score}
              onChange={(e) => setScoreData({...scoreData, team2Score: parseInt(e.target.value) || 0})}
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
      </Modal>

      {/* Spirit Score Modal */}
      <Modal isOpen={showSpiritModal} onClose={() => setShowSpiritModal(false)} title="Submit Spirit Score">
        <form onSubmit={handleSpiritSubmit} className="space-y-4">
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
              placeholder="Optional comments about the match..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowSpiritModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Spirit Score</Button>
          </div>
        </form>
      </Modal>

      {/* Attendance Modal */}
      <Modal isOpen={showAttendanceModal} onClose={() => setShowAttendanceModal(false)} title="Mark Attendance">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {match.teamA?.name || match.team1?.name} vs {match.teamB?.name || match.team2?.name}
            </h3>
            <p className="text-gray-600">Mark player attendance for this match</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">{match.teamA?.name || match.team1?.name}</h4>
              <div className="space-y-2">
                {match.teamA?.players?.map((playerEntry) => {
                  const player = playerEntry.player || playerEntry;
                  const isPresent = getAttendanceStatus(player._id, 'A');
                  return (
                    <div key={player._id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">{player.name}</span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant={isPresent === true ? "default" : "outline"}
                          style={isPresent === true ? {
                            backgroundColor: '#10b981',
                            borderColor: '#10b981',
                            color: 'white'
                          } : {
                            color: '#059669',
                            borderColor: '#10b981'
                          }}
                          onClick={() => markPlayerAttendance(player._id, 'A', true)}
                        >
                          Present
                        </Button>
                        <Button 
                          size="sm" 
                          variant={isPresent === false ? "default" : "outline"}
                          style={isPresent === false ? {
                            backgroundColor: '#ef4444',
                            borderColor: '#ef4444',
                            color: 'white'
                          } : {
                            color: '#dc2626',
                            borderColor: '#ef4444'
                          }}
                          onClick={() => markPlayerAttendance(player._id, 'A', false)}
                        >
                          Absent
                        </Button>
                      </div>
                    </div>
                  );
                }) || <p className="text-gray-500 text-sm">No players found</p>}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">{match.teamB?.name || match.team2?.name}</h4>
              <div className="space-y-2">
                {match.teamB?.players?.map((playerEntry) => {
                  const player = playerEntry.player || playerEntry;
                  const isPresent = getAttendanceStatus(player._id, 'B');
                  return (
                    <div key={player._id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">{player.name}</span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant={isPresent === true ? "default" : "outline"}
                          style={isPresent === true ? {
                            backgroundColor: '#10b981',
                            borderColor: '#10b981',
                            color: 'white'
                          } : {
                            color: '#059669',
                            borderColor: '#10b981'
                          }}
                          onClick={() => markPlayerAttendance(player._id, 'B', true)}
                        >
                          Present
                        </Button>
                        <Button 
                          size="sm" 
                          variant={isPresent === false ? "default" : "outline"}
                          style={isPresent === false ? {
                            backgroundColor: '#ef4444',
                            borderColor: '#ef4444',
                            color: 'white'
                          } : {
                            color: '#dc2626',
                            borderColor: '#ef4444'
                          }}
                          onClick={() => markPlayerAttendance(player._id, 'B', false)}
                        >
                          Absent
                        </Button>
                      </div>
                    </div>
                  );
                }) || <p className="text-gray-500 text-sm">No players found</p>}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => setShowAttendanceModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Photo Upload Modal */}
      <Modal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} title="Upload Match Photos">
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Upload event photos for teams to view and download</p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to select photos</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
                </div>
              </label>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Selected Files ({selectedFiles.length})</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <button
                      onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowPhotoModal(false);
                setSelectedFiles([]);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (selectedFiles.length === 0) {
                  alert('Please select at least one photo');
                  return;
                }
                
                setUploading(true);
                try {
                  // Create FormData for file upload
                  const formData = new FormData();
                  selectedFiles.forEach((file, index) => {
                    formData.append('photos', file);
                  });
                  
                  // Upload photos
                  await matchAPI.uploadPhotos(id, formData);
                  
                  setShowPhotoModal(false);
                  setSelectedFiles([]);
                  fetchMatchDetails(); // Refresh to show new photos
                  alert('Photos uploaded successfully!');
                } catch (error) {
                  console.error('Error uploading photos:', error);
                  alert('Error uploading photos');
                } finally {
                  setUploading(false);
                }
              }}
              disabled={selectedFiles.length === 0 || uploading}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                'Upload Photos'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}