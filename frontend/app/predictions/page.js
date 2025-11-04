'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, TrendingUp, Users, Clock, Star, Vote, BarChart3 } from 'lucide-react';

export default function Predictions() {
  const [activeTab, setActiveTab] = useState('predictions');
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [polls, setPolls] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [newPoll, setNewPoll] = useState({ title: '', question: '', options: ['', ''] });

  useEffect(() => {
    fetchMatches();
    fetchPredictions();
    fetchPolls();
    fetchLeaderboard();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/matches', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        const upcomingMatches = data.data.filter(match => 
          match.status === 'scheduled' || match.status === 'in_progress'
        );
        // Remove duplicates based on team combination
        const uniqueMatches = upcomingMatches.filter((match, index, self) => 
          index === self.findIndex(m => 
            (m.teamA?._id === match.teamA?._id && m.teamB?._id === match.teamB?._id) ||
            (m.teamA?._id === match.teamB?._id && m.teamB?._id === match.teamA?._id)
          )
        );
        setMatches(uniqueMatches);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchPredictions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/predictions/my-predictions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setPredictions(data.data);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const fetchPolls = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/polls', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setPolls(data.data);
    } catch (error) {
      console.error('Error fetching polls:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/predictions/leaderboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setLeaderboard(data.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
    setLoading(false);
  };

  const makePrediction = async (matchId, predictedWinner, predictedScore, confidence) => {
    try {
      const response = await fetch('http://localhost:5000/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ matchId, predictedWinner, predictedScore, confidence })
      });
      const data = await response.json();
      if (data.success) fetchPredictions();
    } catch (error) {
      console.error('Error making prediction:', error);
    }
  };

  const voteOnPoll = async (pollId, optionIndex) => {
    try {
      const response = await fetch(`http://localhost:5000/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ optionIndex })
      });
      const data = await response.json();
      if (data.success) fetchPolls();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const createPoll = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: newPoll.title,
          question: newPoll.question,
          options: newPoll.options.filter(opt => opt.trim() !== '')
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchPolls();
        setShowCreatePoll(false);
        setNewPoll({ title: '', question: '', options: ['', ''] });
      }
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-200 via-blue-200 to-orange-300 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-blue-200 to-orange-300 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Prediction Games</h1>
          <p className="text-xl text-gray-700">Test your Ultimate Frisbee knowledge and compete with other fans</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-1 border border-white/40 shadow-lg">
            <button
              onClick={() => setActiveTab('predictions')}
              className={`px-6 py-3 rounded-xl transition-all font-medium ${
                activeTab === 'predictions'
                  ? 'bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-lg'
                  : 'text-black hover:bg-white/50'
              }`}
            >
              Match Predictions
            </button>
            <button
              onClick={() => setActiveTab('polls')}
              className={`px-6 py-3 rounded-xl transition-all font-medium ${
                activeTab === 'polls'
                  ? 'bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-lg'
                  : 'text-black hover:bg-white/50'
              }`}
            >
              Fan Polls
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 rounded-xl transition-all font-medium ${
                activeTab === 'leaderboard'
                  ? 'bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-lg'
                  : 'text-black hover:bg-white/50'
              }`}
            >
              Leaderboard
            </button>
          </div>
        </div>

        {/* Match Predictions Tab */}
        {activeTab === 'predictions' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {matches.map((match) => (
                <PredictionCard
                  key={match._id}
                  match={match}
                  onPredict={makePrediction}
                  existingPrediction={predictions.find(p => p.match._id === match._id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Polls Tab */}
        {activeTab === 'polls' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Fan Polls</h2>
              <button
                onClick={() => setShowCreatePoll(true)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                + Create Poll
              </button>
            </div>

            {showCreatePoll && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-300 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Poll</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Poll Title"
                    value={newPoll.title}
                    onChange={(e) => setNewPoll({...newPoll, title: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="text"
                    placeholder="Poll Question"
                    value={newPoll.question}
                    onChange={(e) => setNewPoll({...newPoll, question: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                  />
                  {newPoll.options.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...newPoll.options];
                        newOptions[index] = e.target.value;
                        setNewPoll({...newPoll, options: newOptions});
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                  ))}
                  <button
                    onClick={() => setNewPoll({...newPoll, options: [...newPoll.options, '']})}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Add Option
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={createPoll}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                    >
                      Create Poll
                    </button>
                    <button
                      onClick={() => setShowCreatePoll(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {polls.length === 0 ? (
              <div className="text-center py-12">
                <Vote className="text-6xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No polls available yet</p>
                <p className="text-gray-500 text-sm">Create the first poll to get started!</p>
              </div>
            ) : (
              polls.map((poll) => (
                <PollCard key={poll._id} poll={poll} onVote={voteOnPoll} />
              ))
            )}
          </motion.div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-300 shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <Trophy className="text-yellow-500" />
              <span>Prediction Leaderboard</span>
            </h3>
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="text-6xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No predictions made yet</p>
                <p className="text-gray-500 text-sm">Make some predictions to see the leaderboard!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div key={entry._id} className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-semibold text-gray-800">{entry.user.name}</span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span>{entry.totalPoints} pts</span>
                      <span>{Math.round(entry.accuracy * 100)}% accuracy</span>
                      <span>{entry.totalPredictions} predictions</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function PredictionCard({ match, onPredict, existingPrediction }) {
  const [gameMode, setGameMode] = useState('quick');
  const [selectedWinner, setSelectedWinner] = useState(existingPrediction?.predictedWinner?._id || '');
  const [scoreA, setScoreA] = useState(existingPrediction?.predictedScore?.teamA || 7);
  const [scoreB, setScoreB] = useState(existingPrediction?.predictedScore?.teamB || 5);
  const [confidence, setConfidence] = useState(existingPrediction?.confidence || 3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickPredict = async (winnerId, margin) => {
    if (!winnerId || !match._id || isSubmitting) return;
    
    setIsSubmitting(true);
    let scoreTeamA, scoreTeamB;
    const isTeamAWinner = winnerId === match.teamA?._id;
    
    if (margin === 'close') {
      scoreTeamA = isTeamAWinner ? 15 : 13;
      scoreTeamB = isTeamAWinner ? 13 : 15;
    } else if (margin === 'comfortable') {
      scoreTeamA = isTeamAWinner ? 15 : 10;
      scoreTeamB = isTeamAWinner ? 10 : 15;
    } else {
      scoreTeamA = isTeamAWinner ? 15 : 7;
      scoreTeamB = isTeamAWinner ? 7 : 15;
    }
    
    await onPredict(match._id, winnerId, { teamA: scoreTeamA, teamB: scoreTeamB }, confidence);
    setIsSubmitting(false);
  };

  const handleDetailedPredict = () => {
    if (!selectedWinner) return;
    onPredict(match._id, selectedWinner, { teamA: scoreA, teamB: scoreB }, confidence);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className={`bg-white/90 backdrop-blur-md rounded-2xl p-6 border-2 shadow-xl relative overflow-hidden transition-all duration-300 ${
        match.status === 'in_progress' 
          ? 'border-green-400 shadow-green-200/50' 
          : 'border-blue-400 shadow-blue-200/50'
      } ${isSubmitting ? 'opacity-70 pointer-events-none' : ''}`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl ${
        match.status === 'in_progress'
          ? 'bg-gradient-to-br from-green-300/30 to-emerald-300/30'
          : 'bg-gradient-to-br from-orange-300/30 to-blue-300/30'
      }`} />
      
      <div className="relative z-10 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              match.status === 'in_progress' ? 'bg-green-500' : 'bg-blue-500'
            }`} />
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              match.status === 'in_progress' 
                ? 'bg-green-500/20 text-green-700 border border-green-300' 
                : 'bg-blue-500/20 text-blue-700 border border-blue-300'
            }`}>
              {match.status === 'in_progress' ? '🔴 LIVE' : '📅 UPCOMING'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {new Date(match.scheduledTime).toLocaleDateString()}
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 text-center">
          <span className="text-blue-600">{match.teamA?.name || 'Team A'}</span>
          <span className="mx-3 text-gray-400">VS</span>
          <span className="text-orange-600">{match.teamB?.name || 'Team B'}</span>
        </h3>
      </div>

      <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setGameMode('quick')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            gameMode === 'quick' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'
          }`}
        >
          🎯 Quick Pick
        </button>
        <button
          onClick={() => setGameMode('detailed')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            gameMode === 'detailed' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'
          }`}
        >
          📊 Detailed
        </button>
      </div>

      {gameMode === 'quick' ? (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h4 className="text-md font-medium text-gray-700 mb-2">
              {match.status === 'in_progress' ? '⚡ Live Prediction' : 'Pick Winner & Victory Style'}
            </h4>
            {match.status === 'in_progress' && (
              <p className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full inline-block">
                Match is live! Predict the final outcome
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-600">{match.teamA?.name || 'Team A'} Wins</h5>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickPredict(match.teamA?._id, 'close')}
                className="p-4 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all text-sm font-medium disabled:opacity-50"
                disabled={isSubmitting}
              >
                🔥 Close Game<br/><span className="text-xs opacity-90">15-13</span>
              </button>
              <button
                onClick={() => handleQuickPredict(match.teamA?._id, 'comfortable')}
                className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all text-sm font-medium disabled:opacity-50"
                disabled={isSubmitting}
              >
                💪 Comfortable<br/><span className="text-xs opacity-90">15-10</span>
              </button>
              <button
                onClick={() => handleQuickPredict(match.teamA?._id, 'dominant')}
                className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all text-sm font-medium disabled:opacity-50"
                disabled={isSubmitting}
              >
                🚀 Dominant<br/><span className="text-xs opacity-90">15-7</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-600">{match.teamB?.name || 'Team B'} Wins</h5>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickPredict(match.teamB?._id, 'close')}
                className="p-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all text-sm font-medium disabled:opacity-50"
                disabled={isSubmitting}
              >
                🔥 Close Game<br/><span className="text-xs opacity-90">15-13</span>
              </button>
              <button
                onClick={() => handleQuickPredict(match.teamB?._id, 'comfortable')}
                className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all text-sm font-medium disabled:opacity-50"
                disabled={isSubmitting}
              >
                💪 Comfortable<br/><span className="text-xs opacity-90">15-10</span>
              </button>
              <button
                onClick={() => handleQuickPredict(match.teamB?._id, 'dominant')}
                className="p-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all text-sm font-medium disabled:opacity-50"
                disabled={isSubmitting}
              >
                🚀 Dominant<br/><span className="text-xs opacity-90">15-7</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Predicted Winner</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedWinner(match.teamA?._id)}
                className={`p-3 rounded-lg border transition-all ${
                  selectedWinner === match.teamA?._id
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white border-gray-300 hover:border-blue-400'
                }`}
              >
                {match.teamA?.name || 'Team A'}
              </button>
              <button
                onClick={() => setSelectedWinner(match.teamB?._id)}
                className={`p-3 rounded-lg border transition-all ${
                  selectedWinner === match.teamB?._id
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white border-gray-300 hover:border-orange-400'
                }`}
              >
                {match.teamB?.name || 'Team B'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {match.teamA?.name || 'Team A'} Score
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={scoreA}
                onChange={(e) => setScoreA(parseInt(e.target.value))}
                className="w-full mb-2"
              />
              <div className="text-center text-2xl font-bold text-blue-600">{scoreA}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {match.teamB?.name || 'Team B'} Score
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={scoreB}
                onChange={(e) => setScoreB(parseInt(e.target.value))}
                className="w-full mb-2"
              />
              <div className="text-center text-2xl font-bold text-orange-600">{scoreB}</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confidence: {['😐', '🙂', '😊', '😄', '🤩'][confidence - 1]} ({confidence}/5)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={confidence}
              onChange={(e) => setConfidence(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={handleDetailedPredict}
            disabled={!selectedWinner}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {existingPrediction ? '🔄 Update Prediction' : '🎯 Make Prediction'}
          </button>
        </div>
      )}
      
      {existingPrediction && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="text-sm text-green-700">
            ✅ Your prediction: {existingPrediction.predictedWinner?.name} wins {existingPrediction.predictedScore?.teamA}-{existingPrediction.predictedScore?.teamB}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function PollCard({ poll, onVote }) {
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-300 shadow-lg"
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{poll.title}</h3>
      <p className="text-gray-600 mb-4">{poll.question}</p>
      
      <div className="space-y-3">
        {poll.options.map((option, index) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          return (
            <button
              key={index}
              onClick={() => onVote(poll._id, index)}
              className="w-full p-3 bg-white border border-gray-300 rounded-lg hover:border-blue-400 transition-all relative overflow-hidden"
            >
              <div
                className="absolute left-0 top-0 h-full bg-blue-500/20 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
              <div className="relative flex justify-between items-center">
                <span className="text-gray-800">{option.text}</span>
                <span className="text-sm text-gray-600">
                  {option.votes} votes ({Math.round(percentage)}%)
                </span>
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 text-sm text-gray-500 flex justify-between">
        <span>Total votes: {totalVotes}</span>
        <span>By {poll.createdBy.name}</span>
      </div>
    </motion.div>
  );
}