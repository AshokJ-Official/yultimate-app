'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { 
  Youtube, Instagram, Facebook, Twitter, Globe, Plus, ExternalLink, 
  Radio, Eye, Calendar, Edit, Trash2, Play, Users, Heart, MessageCircle, Share
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SocialMediaPage() {
  const { user } = useAuth();
  const [socialMedia, setSocialMedia] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filter, setFilter] = useState('all');

  const [formData, setFormData] = useState({
    platform: 'youtube',
    type: 'livestream',
    title: '',
    description: '',
    url: '',
    embedId: '',
    isLive: false,
    scheduledTime: ''
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchSocialMedia();
    }
  }, [selectedTournament, filter]);

  const fetchTournaments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tournaments');
      const data = await response.json();
      if (data.success) {
        setTournaments(data.data);
        if (data.data.length > 0) {
          setSelectedTournament(data.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchSocialMedia = async () => {
    try {
      setLoading(true);
      const filterParam = filter !== 'all' ? `?platform=${filter}` : '';
      const response = await fetch(`http://localhost:5000/api/social-media/tournament/${selectedTournament}${filterParam}`);
      const data = await response.json();
      if (data.success) {
        setSocialMedia(data.data);
      }
    } catch (error) {
      console.error('Error fetching social media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingItem 
        ? `http://localhost:5000/api/social-media/${editingItem._id}`
        : `http://localhost:5000/api/social-media/tournament/${selectedTournament}`;
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchSocialMedia();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving social media:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this social media link?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/social-media/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchSocialMedia();
      }
    } catch (error) {
      console.error('Error deleting social media:', error);
    }
  };

  const toggleLive = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/social-media/${id}/live`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchSocialMedia();
      }
    } catch (error) {
      console.error('Error toggling live status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      platform: 'youtube',
      type: 'livestream',
      title: '',
      description: '',
      url: '',
      embedId: '',
      isLive: false,
      scheduledTime: ''
    });
    setEditingItem(null);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      platform: item.platform,
      type: item.type,
      title: item.title,
      description: item.description || '',
      url: item.url,
      embedId: item.embedId || '',
      isLive: item.isLive,
      scheduledTime: item.scheduledTime ? new Date(item.scheduledTime).toISOString().slice(0, 16) : ''
    });
    setShowModal(true);
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      youtube: <Youtube className="w-5 h-5 text-red-500" />,
      instagram: <Instagram className="w-5 h-5 text-pink-500" />,
      facebook: <Facebook className="w-5 h-5 text-blue-600" />,
      twitter: <Twitter className="w-5 h-5 text-blue-400" />,
      website: <Globe className="w-5 h-5 text-gray-600" />
    };
    return icons[platform] || <Globe className="w-5 h-5 text-gray-600" />;
  };

  const getPlatformColor = (platform) => {
    const colors = {
      youtube: 'from-red-500 to-red-600',
      instagram: 'from-pink-500 to-purple-600',
      facebook: 'from-blue-600 to-blue-700',
      twitter: 'from-blue-400 to-blue-500',
      website: 'from-gray-500 to-gray-600'
    };
    return colors[platform] || 'from-gray-500 to-gray-600';
  };

  const canManage = ['tournament_director', 'volunteer'].includes(user?.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl shadow-2xl p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">📱 Social Media Hub</h1>
              <p className="text-purple-100">Connect tournaments with social media platforms</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4">
                <div className="flex items-center gap-2 text-white">
                  <Radio className="w-5 h-5 animate-pulse" />
                  <span className="font-semibold">Live Integration</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tournament Selector & Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Tournament</option>
                {tournaments.map(tournament => (
                  <option key={tournament._id} value={tournament._id}>
                    {tournament.title}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                {['all', 'youtube', 'instagram', 'facebook', 'twitter'].map(filterOption => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      filter === filterOption
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filterOption === 'all' ? 'All' : filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {canManage && (
              <Button
                onClick={() => { resetForm(); setShowModal(true); }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Social Media
              </Button>
            )}
          </div>
        </div>

        {/* Social Media Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-purple-600 font-semibold">Loading social media...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {socialMedia.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`relative overflow-hidden bg-gradient-to-br ${getPlatformColor(item.platform)} text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
                    <div className="p-6">
                      {/* Live Badge */}
                      {item.isLive && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                          🔴 LIVE
                        </div>
                      )}

                      {/* Platform Icon & Type */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(item.platform)}
                          <span className="text-sm font-semibold opacity-90">
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </span>
                        </div>
                        {canManage && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1 hover:bg-white/20 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-1 hover:bg-white/20 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm opacity-90 mb-4 line-clamp-2">{item.description}</p>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs opacity-80 mb-4">
                        {item.metadata?.duration && (
                          <div className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {item.metadata.duration}
                          </div>
                        )}
                        {item.viewCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {item.viewCount}
                          </div>
                        )}
                        {item.metadata?.likes && (
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {item.metadata.likes}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-lg rounded-lg px-4 py-2 text-center font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View
                        </a>
                        {canManage && item.type === 'livestream' && (
                          <button
                            onClick={() => toggleLive(item._id)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                              item.isLive 
                                ? 'bg-red-500 hover:bg-red-600' 
                                : 'bg-green-500 hover:bg-green-600'
                            }`}
                          >
                            {item.isLive ? 'End Live' : 'Go Live'}
                          </button>
                        )}
                      </div>

                      {/* Scheduled Time */}
                      {item.scheduledTime && (
                        <div className="mt-3 flex items-center gap-2 text-xs opacity-80">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.scheduledTime).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {socialMedia.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-10 h-10 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Social Media Links</h3>
            <p className="text-gray-600 mb-6">Start connecting your tournament with social media platforms</p>
            {canManage && (
              <Button
                onClick={() => { resetForm(); setShowModal(true); }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Link
              </Button>
            )}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => { setShowModal(false); resetForm(); }}
          title={editingItem ? 'Edit Social Media Link' : 'Add Social Media Link'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter</option>
                  <option value="website">Website</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="livestream">Livestream</option>
                  <option value="video">Video</option>
                  <option value="post">Post</option>
                  <option value="story">Story</option>
                  <option value="event">Event</option>
                  <option value="page">Page</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Embed ID (Optional)</label>
              <input
                type="text"
                value={formData.embedId}
                onChange={(e) => setFormData({...formData, embedId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="YouTube video ID, Instagram post ID, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Time (Optional)</label>
              <input
                type="datetime-local"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {formData.type === 'livestream' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isLive"
                  checked={formData.isLive}
                  onChange={(e) => setFormData({...formData, isLive: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isLive" className="text-sm font-medium text-gray-700">
                  Currently Live
                </label>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowModal(false); resetForm(); }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              >
                {editingItem ? 'Update' : 'Add'} Link
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}