'use client';

import { useState, useEffect } from 'react';
import { Camera, Upload, Filter, Grid, List, Play, Download, Heart, Star, Eye, X, ArrowLeft, Sparkles, Image, Video } from 'lucide-react';

export default function MediaGalleryPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [currentView, setCurrentView] = useState('selection'); // 'selection' or 'gallery'
  const [filter, setFilter] = useState({ type: 'all', category: 'all' });
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [likedMedia, setLikedMedia] = useState(new Set());

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament && currentView === 'gallery') fetchMedia();
  }, [selectedTournament, filter, currentView]);

  const fetchTournaments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tournaments');
      const data = await response.json();
      if (data.success) setTournaments(data.data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchMedia = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.type !== 'all') params.append('type', filter.type);
      if (filter.category !== 'all') params.append('category', filter.category);

      const response = await fetch(`http://localhost:5000/api/media/tournament/${selectedTournament}?${params}`);
      const data = await response.json();
      if (data.success) setMedia(data.data);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentSelect = (tournamentId) => {
    setSelectedTournament(tournamentId);
    setCurrentView('gallery');
  };

  const handleUpload = async (files) => {
    if (!files.length) return;
    
    setUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    
    formData.append('type', files[0].type.startsWith('video/') ? 'video' : 'photo');
    formData.append('category', 'general');
    formData.append('title', files[0].name);
    
    try {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDhiNTYzZjllMGE0YmJjODU0NjkwYSIsImlhdCI6MTc2MjE3ODQwNCwiZXhwIjoxNzY0NzcwNDA0fQ.EeTnA_1zkL4HsWUx-xbBfpS8sfpThahOBi9c6NqtIiM';
      
      const response = await fetch(`http://localhost:5000/api/media/tournament/${selectedTournament}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchMedia();
        alert('🎉 Media uploaded successfully!');
      } else {
        const error = await response.json();
        alert('❌ Upload failed: ' + error.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLike = (mediaId) => {
    const newLiked = new Set(likedMedia);
    if (newLiked.has(mediaId)) {
      newLiked.delete(mediaId);
    } else {
      newLiked.add(mediaId);
    }
    setLikedMedia(newLiked);
  };

  const handleDownload = async (mediaUrl, filename) => {
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'media-file';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('❌ Download failed');
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      highlight: '🏆',
      sponsor: '💼', 
      match: '⚽',
      general: '📸'
    };
    return icons[category] || '📸';
  };

  const getCategoryColor = (category) => {
    const colors = {
      highlight: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
      sponsor: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      match: 'bg-gradient-to-r from-green-400 to-blue-500 text-white',
      general: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white'
    };
    return colors[category] || colors.general;
  };

  const getRandomGradient = (index) => {
    const gradients = [
      'from-pink-400 via-purple-500 to-indigo-600',
      'from-yellow-400 via-red-500 to-pink-600',
      'from-green-400 via-blue-500 to-purple-600',
      'from-blue-400 via-purple-500 to-pink-500',
      'from-indigo-400 via-purple-500 to-pink-500',
      'from-red-400 via-pink-500 to-purple-600'
    ];
    return gradients[index % gradients.length];
  };

  if (currentView === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-gradient-to-br from-pink-200/20 to-purple-200/20"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto p-6 pt-20">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
              <Camera className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              🎨 Media Gallery
            </h1>
            <p className="text-xl text-gray-600 mb-2">Choose your tournament to explore amazing content</p>
            <div className="flex items-center justify-center space-x-2 text-purple-600">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Discover • Upload • Share</span>
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament, index) => (
              <div
                key={tournament._id}
                onClick={() => handleTournamentSelect(tournament._id)}
                className={`bg-gradient-to-br ${getRandomGradient(index)} p-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-200 transition-colors">
                    {tournament.title || tournament.name}
                  </h3>
                  
                  <p className="text-white/80 text-sm mb-4 line-clamp-2">
                    {tournament.description || 'Explore photos and videos from this tournament'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-white/90">
                      <Image className="w-4 h-4" />
                      <span className="text-sm">Photos</span>
                      <Video className="w-4 h-4 ml-2" />
                      <span className="text-sm">Videos</span>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <span className="text-white text-sm">→</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {tournaments.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Tournaments Found</h3>
              <p className="text-gray-500">Create a tournament to start uploading media</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const selectedTournamentData = tournaments.find(t => t._id === selectedTournament);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full bg-gradient-to-br from-indigo-200/20 to-pink-200/20"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl mb-8 overflow-hidden border border-white/20">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentView('selection')}
                  className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">🎨 {selectedTournamentData?.title || 'Media Gallery'}</h1>
                  <p className="text-indigo-100">Upload and explore amazing content</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-lg rounded-lg px-3 py-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm">Live</span>
                </div>
                <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-lg rounded-lg px-3 py-1">
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
                  <span className="text-white text-sm">{media.length} Items</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-purple-600" />
                  <select
                    value={filter.type}
                    onChange={(e) => setFilter({...filter, type: e.target.value})}
                    className="px-4 py-2 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="all">🎭 All Types</option>
                    <option value="photo">📸 Photos</option>
                    <option value="video">🎥 Videos</option>
                  </select>
                  
                  <select
                    value={filter.category}
                    onChange={(e) => setFilter({...filter, category: e.target.value})}
                    className="px-4 py-2 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="all">🌟 All Categories</option>
                    <option value="highlight">🏆 Highlights</option>
                    <option value="sponsor">💼 Sponsor Content</option>
                    <option value="match">⚽ Match Photos</option>
                    <option value="general">📸 General</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex bg-purple-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-lg text-purple-600' : 'text-purple-500'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-lg text-purple-600' : 'text-purple-500'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Upload Zone */}
            <div className="border-3 border-dashed border-purple-300 rounded-2xl p-8 text-center mb-8 hover:border-purple-400 transition-colors bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-200/30 rounded-full translate-y-12 -translate-x-12"></div>
              
              {uploading ? (
                <div className="py-8 relative z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-purple-600 font-semibold">✨ Uploading your amazing content...</p>
                </div>
              ) : (
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-purple-800 mb-3">🎨 Upload Your Media</h3>
                  <p className="text-purple-600 mb-6 text-lg">Drag & drop your photos/videos or click to browse</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => handleUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 cursor-pointer font-bold transition-all duration-300 inline-flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:scale-105"
                  >
                    <Camera className="w-6 h-6" />
                    <span>Choose Amazing Files</span>
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Media Content */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-6"></div>
            <p className="text-purple-600 text-xl font-semibold">🎨 Loading your gallery...</p>
          </div>
        ) : (
          <>
            {media.length === 0 ? (
              <div className="text-center py-20 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                  <Camera className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-purple-800 mb-4">🎨 No Media Yet</h3>
                <p className="text-purple-600 mb-8 text-lg">Upload some amazing photos or videos to get started!</p>
                <label
                  htmlFor="file-upload"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-700 cursor-pointer font-bold transition-all duration-300 inline-flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload First Media</span>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </label>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' : 'space-y-6'}>
                {media.map((item, index) => (
                  <div key={item._id} className={`bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden border border-white/30 hover:shadow-2xl transition-all duration-500 group transform hover:scale-105 ${viewMode === 'list' ? 'flex' : ''}`}>
                    <div className={`relative ${viewMode === 'list' ? 'w-64 flex-shrink-0' : ''}`}>
                      {item.type === 'photo' ? (
                        <img
                          src={item.url}
                          alt={item.title}
                          className={`object-cover cursor-pointer group-hover:scale-110 transition-transform duration-500 ${viewMode === 'list' ? 'w-full h-40' : 'w-full h-56'}`}
                          onClick={() => setSelectedMedia(item)}
                        />
                      ) : (
                        <div className={`relative ${viewMode === 'list' ? 'h-40' : 'h-56'} bg-gradient-to-br ${getRandomGradient(index)}`}>
                          <video
                            src={item.url}
                            className="w-full h-full object-cover opacity-80"
                            poster={item.thumbnail}
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                              <Play className="w-8 h-8 text-gray-800 ml-1" />
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-lg ${getCategoryColor(item.category)}`}>
                          {getCategoryIcon(item.category)} {item.category}
                        </span>
                      </div>
                      <div className="absolute top-4 left-4">
                        <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                          {item.type === 'photo' ? <Image className="w-4 h-4 text-purple-600" /> : <Video className="w-4 h-4 text-pink-600" />}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{item.title || 'Untitled'}</h3>
                        <div className="flex items-center space-x-1 bg-purple-100 rounded-full px-2 py-1">
                          <Eye className="w-4 h-4 text-purple-600" />
                          <span className="text-xs text-purple-600 font-semibold">0</span>
                        </div>
                      </div>
                      
                      {item.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 bg-gradient-to-r ${getRandomGradient(index)} rounded-full flex items-center justify-center shadow-lg`}>
                            <span className="text-white text-xs font-bold">
                              {item.uploadedBy?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            <div className="font-semibold text-gray-700">{item.uploadedBy?.name || 'Unknown'}</div>
                            <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleLike(item._id)}
                            className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                              likedMedia.has(item._id) 
                                ? 'bg-red-500 text-white shadow-lg' 
                                : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${likedMedia.has(item._id) ? 'fill-current' : ''}`} />
                          </button>
                          <button 
                            onClick={() => handleDownload(item.url, item.title)}
                            className="p-2 bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-500 rounded-full transition-all duration-300 transform hover:scale-110"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Media Modal */}
        {selectedMedia && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedMedia(null)}>
            <div className="max-w-6xl max-h-full bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-pink-600">
                <h3 className="font-bold text-white text-xl">{selectedMedia.title || 'Media Preview'}</h3>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="max-h-96 overflow-hidden">
                {selectedMedia.type === 'photo' ? (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.title}
                    className="w-full h-full object-contain bg-gray-100"
                  />
                ) : (
                  <video
                    src={selectedMedia.url}
                    controls
                    className="w-full h-full object-contain bg-gray-100"
                    autoPlay
                  />
                )}
              </div>
              {selectedMedia.description && (
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <p className="text-gray-700">{selectedMedia.description}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}