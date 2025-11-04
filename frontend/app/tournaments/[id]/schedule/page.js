'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { matchAPI, tournamentAPI } from '@/lib/api';
import { useSocket } from '@/lib/socket-context';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, Edit, Play, Pause, RotateCcw, Filter, Grid, List } from 'lucide-react';
import Link from 'next/link';

export default function TournamentSchedulePage() {
  const { id } = useParams();
  const { socket } = useSocket();
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('field'); // 'field' or 'list'
  const [selectedField, setSelectedField] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [fields, setFields] = useState([]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (socket && id) {
      socket.emit('join-tournament', id);
      
      socket.on('match-score-updated', (data) => {
        setMatches(prev => prev.map(match => 
          match._id === data.matchId ? { ...match, ...data } : match
        ));
      });
      
      return () => {
        socket.off('match-score-updated');
      };
    }
  }, [socket, id]);

  const fetchData = async () => {
    try {
      const [tournamentRes, matchesRes] = await Promise.all([
        tournamentAPI.getById(id),
        matchAPI.getByTournament(id)
      ]);
      
      const tournamentData = tournamentRes.data.data || tournamentRes.data;
      const matchesData = matchesRes.data.data || matchesRes.data || [];
      
      setTournament(tournamentData);
      setMatches(matchesData);
      setFields(tournamentData?.fields || [{ name: 'Field 1' }, { name: 'Field 2' }]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setFields([{ name: 'Field 1' }, { name: 'Field 2' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMatch = (match) => {
    setEditingMatch(match);
    setShowEditModal(true);
  };

  const handleUpdateMatch = async (matchData) => {
    try {
      await matchAPI.update(editingMatch._id, matchData);
      await fetchData();
      setShowEditModal(false);
      
      if (socket) {
        socket.emit('match-updated', { matchId: editingMatch._id, ...matchData, tournamentId: id });
      }
    } catch (error) {
      console.error('Error updating match:', error);
      alert('Error updating match');
    }
  };

  const filteredMatches = selectedField === 'all' 
    ? matches 
    : matches.filter(match => match.field === selectedField);

  const getMatchesByField = () => {
    const matchesByField = {};
    fields.forEach(field => {
      matchesByField[field.name] = matches.filter(match => match.field === field.name);
    });
    return matchesByField;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'delayed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Tournament Schedule
              </h1>
              <p className="text-gray-600">{tournament?.title}</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('field')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'field' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Grid className="w-4 h-4 mr-1 inline" />
                  Field View
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <List className="w-4 h-4 mr-1 inline" />
                  List View
                </button>
              </div>
              
              {/* Field Filter */}
              {viewMode === 'list' && (
                <select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Fields</option>
                  {fields.map(field => (
                    <option key={field.name} value={field.name}>{field.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Field View */}
        {viewMode === 'field' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(getMatchesByField()).map(([fieldName, fieldMatches]) => (
              <motion.div
                key={fieldName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    {fieldName}
                  </h3>
                  <p className="text-blue-100 text-sm">{fieldMatches.length} matches scheduled</p>
                </div>
                
                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                  {fieldMatches.length > 0 ? fieldMatches.map((match, index) => (
                    <motion.div
                      key={match._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {match.teamA?.name || 'TBD'} vs {match.teamB?.name || 'TBD'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {match.scheduledTime ? new Date(match.scheduledTime).toLocaleString() : 'Time TBD'}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(match.status)}`}>
                          {match.status}
                        </span>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditMatch(match)}
                          className="text-xs px-2 py-1 h-6"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Link href={`/matches/${match._id}`}>
                          <Button size="sm" className="text-xs px-2 py-1 h-6">
                            View
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No matches scheduled</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredMatches.length > 0 ? filteredMatches.map((match, index) => (
              <motion.div
                key={match._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold">
                          {match.teamA?.name || 'TBD'} vs {match.teamB?.name || 'TBD'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                          {match.status}
                        </span>
                        {match.status === 'ongoing' && (
                          <div className="flex items-center text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                            <span className="text-sm font-medium">LIVE</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {match.scheduledTime ? 
                              new Date(match.scheduledTime).toLocaleDateString() : 
                              'Date TBD'
                            }
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {match.scheduledTime ? 
                              new Date(match.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                              'Time TBD'
                            }
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{match.field || 'Field TBD'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditMatch(match)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Link href={`/matches/${match._id}`}>
                        <Button size="sm">
                          View Match
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )) : (
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches found</h3>
                <p className="text-gray-500">No matches scheduled for the selected field</p>
              </Card>
            )}
          </div>
        )}
        
        {/* Edit Match Modal */}
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Match">
          {editingMatch && (
            <EditMatchForm
              match={editingMatch}
              fields={fields}
              onSave={handleUpdateMatch}
              onCancel={() => setShowEditModal(false)}
            />
          )}
        </Modal>
      </motion.div>
    </div>
  );
}

// Edit Match Form Component
function EditMatchForm({ match, fields, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    scheduledTime: match.scheduledTime ? new Date(match.scheduledTime).toISOString().slice(0, 16) : '',
    field: match.field || '',
    status: match.status || 'scheduled'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      scheduledTime: new Date(formData.scheduledTime).toISOString()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Match</label>
        <div className="text-lg font-semibold text-gray-900">
          {match.teamA?.name || 'TBD'} vs {match.teamB?.name || 'TBD'}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Time</label>
        <input
          type="datetime-local"
          value={formData.scheduledTime}
          onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Field</label>
        <select
          value={formData.field}
          onChange={(e) => setFormData({...formData, field: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Field</option>
          {fields.map(field => (
            <option key={field.name} value={field.name}>{field.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({...formData, status: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="scheduled">Scheduled</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="delayed">Delayed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
}