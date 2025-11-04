'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { homeVisitAPI, childAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { Plus, Home, Calendar, User, MapPin, Clock } from 'lucide-react';

export default function HomeVisitsPage() {
  const { user } = useAuth();
  const [visits, setVisits] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVisitViewModal, setShowVisitViewModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [completeData, setCompleteData] = useState({});
  const [photos, setPhotos] = useState([]);
  const [mobilizationPhotos, setMobilizationPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [visitData, setVisitData] = useState({
    child: '',
    coach: '',
    visitDate: '',
    visitTime: '',
    duration: 60,
    purpose: 'community_visit',
    location: {
      address: ''
    },
    attendees: [{ name: '', relationship: '', age: '' }],
    notes: '',
    followUpRequired: false
  });
  
  const communities = [
    'Abhas(Tugalkabad)', 'Garhi', 'Karm Marg(Faridabad)', 'Pushp Vihar', 
    'Saket', 'Zamrudpur', 'Mehrauli', 'Sanjay Colony(LBL)', 'Seemapuri'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [visitsRes, childrenRes] = await Promise.all([
        homeVisitAPI.getAll(),
        childAPI.getAll()
      ]);
      
      setVisits(visitsRes.data?.data || visitsRes.data || []);
      setChildren(childrenRes.data?.data || childrenRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setVisits([]);
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const visitPayload = {
        child: visitData.child,
        coach: visitData.coach,
        scheduledDate: visitData.visitDate,
        visitDate: visitData.visitDate,
        visitTime: visitData.visitTime,
        duration: visitData.duration,
        purpose: visitData.purpose,
        location: visitData.location,
        attendees: visitData.attendees,
        notes: visitData.notes,
        followUpRequired: visitData.followUpRequired
      };
      
      await homeVisitAPI.create(visitPayload);
      setShowCreateModal(false);
      setVisitData({
        child: '',
        coach: '',
        visitDate: '',
        visitTime: '',
        duration: 60,
        purpose: 'community_visit',
        location: { address: '' },
        attendees: [{ name: '', relationship: '', age: '' }],
        notes: '',
        followUpRequired: false
      });
      fetchData();
      alert('Community visit scheduled successfully!');
    } catch (error) {
      console.error('Error creating visit:', error);
      alert('Error scheduling visit. Please try again.');
    }
  };

  const canManageVisits = ['programme_director', 'programme_manager', 'coach'].includes(user?.role);

  const viewVisit = (visit) => {
    setSelectedVisit(visit);
    setShowVisitViewModal(true);
  };

  const completeVisit = (visit) => {
    setSelectedVisit(visit);
    setCompleteData({
      uin: visit.uin || '',
      community: visit.community || '',
      team: visit.team || '',
      visitedWith: visit.visitedWith || '',
      comesHomeOnTime: visit.comesHomeOnTime || '',
      lateReason: visit.lateReason || '',
      studiesProgress: visit.studiesProgress || '',
      childBehaviorAtHome: visit.childBehaviorAtHome || '',
      schoolRegularity: visit.schoolRegularity || '',
      parentFeedback: visit.parentFeedback || '',
      feedbackType: visit.feedbackType || '',
      overallHomeSituation: visit.overallHomeSituation || '',
      notes: visit.notes || ''
    });
    setShowCompleteModal(true);
  };

  const handlePhotoUpload = async (files, type) => {
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('photos', file));
    
    try {
      const response = await homeVisitAPI.uploadPhotos(selectedVisit._id, formData);
      if (type === 'mobilization') {
        setMobilizationPhotos(prev => [...prev, ...response.data.photos]);
      } else {
        setPhotos(prev => [...prev, ...response.data.photos]);
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Error uploading photos');
    } finally {
      setUploading(false);
    }
  };

  const handleCompleteVisit = async (e) => {
    e.preventDefault();
    try {
      await homeVisitAPI.update(selectedVisit._id, {
        ...completeData,
        photos,
        mobilizationPhotos,
        status: 'completed'
      });
      setShowCompleteModal(false);
      setPhotos([]);
      setMobilizationPhotos([]);
      fetchData();
      alert('Visit completed successfully!');
    } catch (error) {
      console.error('Error completing visit:', error);
      alert('Error completing visit. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            🏠 Community Visits
            <span className="text-lg bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
              & Home Tracking
            </span>
          </h1>
          <p className="text-gray-600 mt-2">
            📋 Schedule community visits, track home situations, and capture comprehensive family engagement data
          </p>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              📊 Child Progress Tracking
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
              👨👩👧👦 Family Engagement
            </span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
              🏠 Home Environment Assessment
            </span>
          </div>
        </div>
        {canManageVisits && (
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            📅 Schedule Visit
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Visits</p>
              <p className="text-2xl font-bold text-blue-900">{visits.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-900">
                {visits.filter(v => v.status === 'completed').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-yellow-600 font-medium">Scheduled</p>
              <p className="text-2xl font-bold text-yellow-900">
                {visits.filter(v => v.status === 'planned').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Families</p>
              <p className="text-2xl font-bold text-purple-900">
                {new Set(visits.map(v => v.child?._id || v.child)).size}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visits.map((visit, index) => (
          <motion.div
            key={visit._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
              visit.status === 'completed' ? 'border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-emerald-50' :
              visit.status === 'planned' ? 'border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50' :
              visit.status === 'cancelled' ? 'border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-pink-50' :
              'border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-yellow-50'
            }`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl shadow-md ${
                      visit.status === 'completed' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                      visit.status === 'planned' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                      visit.status === 'cancelled' ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                      'bg-gradient-to-br from-orange-500 to-yellow-600'
                    }`}>
                      <Home className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {visit.child?.name || 'Unknown Child'}
                      </h3>
                      <p className="text-sm font-medium text-gray-600 capitalize">
                        {visit.purpose?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                      visit.status === 'completed' ? 'bg-green-500 text-white' :
                      visit.status === 'planned' ? 'bg-blue-500 text-white' :
                      visit.status === 'cancelled' ? 'bg-red-500 text-white' :
                      visit.status === 'rescheduled' ? 'bg-orange-500 text-white' :
                      'bg-yellow-500 text-white'
                    }`}>
                      {visit.status === 'completed' ? '✅ Completed' :
                       visit.status === 'planned' ? '📅 Scheduled' :
                       visit.status === 'cancelled' ? '❌ Cancelled' :
                       visit.status === 'rescheduled' ? '🔄 Rescheduled' :
                       visit.status}
                    </span>
                    {visit.status === 'completed' && (
                      <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                        🎉 Done
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(visit.visitDate || visit.scheduledDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{visit.location?.address || visit.child?.address || 'No address'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{visit.coach?.name || visit.visitedWith || 'Unassigned'}</span>
                  </div>
                  {visit.community && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs text-blue-600">🏠</span>
                      </div>
                      <span className="font-medium text-blue-600">{visit.community}</span>
                    </div>
                  )}
                  {visit.team && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs text-green-600">👥</span>
                      </div>
                      <span className="font-medium text-green-600">{visit.team}</span>
                    </div>
                  )}
                  {visit.feedbackType && (
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        visit.feedbackType === 'Positive' ? 'bg-green-100' :
                        visit.feedbackType === 'Negative' ? 'bg-red-100' :
                        visit.feedbackType === 'Both Positive and Negative' ? 'bg-yellow-100' :
                        'bg-gray-100'
                      }`}>
                        <span className={`text-xs ${
                          visit.feedbackType === 'Positive' ? 'text-green-600' :
                          visit.feedbackType === 'Negative' ? 'text-red-600' :
                          visit.feedbackType === 'Both Positive and Negative' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {visit.feedbackType === 'Positive' ? '😊' :
                           visit.feedbackType === 'Negative' ? '😟' :
                           visit.feedbackType === 'Both Positive and Negative' ? '🤔' : '😐'}
                        </span>
                      </div>
                      <span className={`font-medium ${
                        visit.feedbackType === 'Positive' ? 'text-green-600' :
                        visit.feedbackType === 'Negative' ? 'text-red-600' :
                        visit.feedbackType === 'Both Positive and Negative' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {visit.feedbackType}
                      </span>
                    </div>
                  )}
                </div>
                
                {visit.status === 'completed' && (
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-xl mb-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-600 font-bold">✨ Visit Summary</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {visit.studiesProgress && (
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <p className="font-semibold text-blue-800 mb-1">📚 Studies</p>
                          <p className="text-blue-700">{visit.studiesProgress.substring(0, 50)}...</p>
                        </div>
                      )}
                      {visit.parentFeedback && (
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <p className="font-semibold text-purple-800 mb-1">👨👩👧👦 Feedback</p>
                          <p className="text-purple-700">{visit.parentFeedback.substring(0, 50)}...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {visit.notes && visit.status !== 'completed' && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-1">📝 Notes</p>
                    <p className="text-sm text-gray-600">{visit.notes.substring(0, 80)}{visit.notes.length > 80 ? '...' : ''}</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`flex-1 transition-all duration-200 ${
                      visit.status === 'completed' ? 'border-green-300 text-green-700 hover:bg-green-50' :
                      'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => viewVisit(visit)}
                  >
                    {visit.status === 'completed' ? '🔍 View Report' : '👁️ View Details'}
                  </Button>
                  {visit.status === 'planned' && (user?.role === 'coach' || canManageVisits) && (
                    <Button 
                      size="sm" 
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-md transition-all duration-200" 
                      onClick={() => completeVisit(visit)}
                    >
                      ✅ Complete
                    </Button>
                  )}
                  {visit.status === 'completed' && (
                    <div className="flex-1 text-center py-2 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                      🎆 Completed
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="🏠 Schedule Home Visit">
        <form onSubmit={handleCreate} className="space-y-6">
          {/* Child & Coach Selection */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
              👥 Visit Assignment
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Child *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={visitData.child}
                  onChange={(e) => setVisitData({...visitData, child: e.target.value})}
                  required
                >
                  <option value="">Select Child</option>
                  {children.map(child => (
                    <option key={child._id} value={child._id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coach *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={visitData.coach}
                  onChange={(e) => setVisitData({...visitData, coach: e.target.value})}
                  required
                >
                  <option value="">Select Coach</option>
                  <option value={user?.id}>{user?.name} (Me)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Visit Details */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
              📅 Visit Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Visit Date *"
                type="date"
                value={visitData.visitDate}
                onChange={(e) => setVisitData({...visitData, visitDate: e.target.value})}
                required
              />
              <Input
                label="Visit Time *"
                type="time"
                value={visitData.visitTime}
                onChange={(e) => setVisitData({...visitData, visitTime: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={visitData.duration}
                  onChange={(e) => setVisitData({...visitData, duration: parseInt(e.target.value)})}
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={visitData.purpose}
                  onChange={(e) => setVisitData({...visitData, purpose: e.target.value})}
                >
                  <option value="community_visit">🏠 Community Visit</option>
                  <option value="initial_assessment">🔍 Initial Assessment</option>
                  <option value="follow_up">📋 Follow-up</option>
                  <option value="family_engagement">👨👩👧👦 Family Engagement</option>
                  <option value="academic_support">📚 Academic Support</option>
                  <option value="behavioral_support">🎯 Behavioral Support</option>
                  <option value="other">📝 Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              📍 Location
            </h3>
            <Input
              label="Address *"
              value={visitData.location.address}
              onChange={(e) => setVisitData({...visitData, location: { address: e.target.value }})}
              placeholder="Full address for the home visit"
              required
            />
          </div>

          {/* Additional Information */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
            <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
              📝 Additional Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visit Notes</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  value={visitData.notes}
                  onChange={(e) => setVisitData({...visitData, notes: e.target.value})}
                  placeholder="Special instructions, preparation notes, or specific topics to discuss..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="followUp"
                  checked={visitData.followUpRequired}
                  onChange={(e) => setVisitData({...visitData, followUpRequired: e.target.checked})}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="followUp" className="text-sm font-medium text-gray-700">
                  📅 Follow-up visit required
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              🏠 Schedule Visit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Complete Visit Modal */}
      <Modal isOpen={showCompleteModal} onClose={() => setShowCompleteModal(false)} title="✅ Complete Visit">
        <form onSubmit={handleCompleteVisit} className="space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Visit: {selectedVisit?.child?.name}</h3>
            <p className="text-sm text-blue-700">Date: {formatDate(selectedVisit?.visitDate)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="UIN"
              value={completeData.uin || ''}
              onChange={(e) => setCompleteData({...completeData, uin: e.target.value})}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Community</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={completeData.community || ''}
                onChange={(e) => setCompleteData({...completeData, community: e.target.value})}
              >
                <option value="">Select Community</option>
                {communities.map(community => (
                  <option key={community} value={community}>{community}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={completeData.team || ''}
                onChange={(e) => setCompleteData({...completeData, team: e.target.value})}
              >
                <option value="">Select Team</option>
                <option value="Abhas B1">Abhas B1</option>
                <option value="Abhas B2">Abhas B2</option>
                <option value="Zamrudpur B1">Zamrudpur B1</option>
                <option value="Mehrauli B1">Mehrauli B1</option>
                <option value="Saket B1">Saket B1</option>
              </select>
            </div>
            <Input
              label="Visited With"
              value={completeData.visitedWith || ''}
              onChange={(e) => setCompleteData({...completeData, visitedWith: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comes Home On Time</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={completeData.comesHomeOnTime || ''}
                onChange={(e) => setCompleteData({...completeData, comesHomeOnTime: e.target.value})}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <Input
              label="Late Reason (if applicable)"
              value={completeData.lateReason || ''}
              onChange={(e) => setCompleteData({...completeData, lateReason: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Studies Progress</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={completeData.studiesProgress || ''}
              onChange={(e) => setCompleteData({...completeData, studiesProgress: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Child Behavior at Home</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={completeData.childBehaviorAtHome || ''}
              onChange={(e) => setCompleteData({...completeData, childBehaviorAtHome: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School Regularity</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              value={completeData.schoolRegularity || ''}
              onChange={(e) => setCompleteData({...completeData, schoolRegularity: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Feedback</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={completeData.parentFeedback || ''}
              onChange={(e) => setCompleteData({...completeData, parentFeedback: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feedback Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={completeData.feedbackType || ''}
              onChange={(e) => setCompleteData({...completeData, feedbackType: e.target.value})}
            >
              <option value="">Select Type</option>
              <option value="Positive">Positive</option>
              <option value="Negative">Negative</option>
              <option value="Neutral">Neutral</option>
              <option value="Both Positive and Negative">Both Positive and Negative</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Overall Home Situation</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={completeData.overallHomeSituation || ''}
              onChange={(e) => setCompleteData({...completeData, overallHomeSituation: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={completeData.notes || ''}
              onChange={(e) => setCompleteData({...completeData, notes: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📸 Visit Photos</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e.target.files, 'visit')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={uploading}
              />
              {photos.length > 0 && (
                <p className="text-sm text-green-600 mt-1">{photos.length} photos uploaded</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📱 Mobilization Photos</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e.target.files, 'mobilization')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={uploading}
              />
              {mobilizationPhotos.length > 0 && (
                <p className="text-sm text-green-600 mt-1">{mobilizationPhotos.length} photos uploaded</p>
              )}
            </div>
          </div>

          {uploading && (
            <div className="text-center py-2">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Uploading photos...
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowCompleteModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-green-500 hover:bg-green-600">
              ✅ Complete Visit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Visit View Modal */}
      <Modal isOpen={showVisitViewModal} onClose={() => setShowVisitViewModal(false)} title="🏠 Visit Details">
        {selectedVisit && (
          <div className="max-h-[80vh] overflow-y-auto space-y-6">
            {/* Visit Header */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-purple-900">🏠 Home Visit</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedVisit.status === 'completed' ? 'bg-green-100 text-green-800' :
                  selectedVisit.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                  selectedVisit.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedVisit.status === 'completed' ? '✅ Completed' :
                   selectedVisit.status === 'planned' ? '📋 Planned' :
                   selectedVisit.status === 'cancelled' ? '❌ Cancelled' :
                   '🔄 ' + selectedVisit.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span><strong>Date:</strong> {formatDate(selectedVisit.visitDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⏰</span>
                  <span><strong>Time:</strong> {selectedVisit.visitTime || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span><strong>Duration:</strong> {selectedVisit.duration || 60} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🎯</span>
                  <span><strong>Purpose:</strong> {selectedVisit.purpose?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👶</span>
                  <span><strong>Child:</strong> {selectedVisit.child?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👨‍🏫</span>
                  <span><strong>Coach:</strong> {selectedVisit.coach?.name || selectedVisit.visitedWith || 'Unassigned'}</span>
                </div>
              </div>
            </div>

            {/* Location */}
            {selectedVisit.location?.address && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  📍 Location
                </h4>
                <p className="text-gray-700">{selectedVisit.location.address}</p>
              </div>
            )}

            {/* Community Visit Details */}
            {(selectedVisit.community || selectedVisit.team || selectedVisit.uin) && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                  🏘️ Community Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedVisit.community && (
                    <div><strong>Community:</strong> {selectedVisit.community}</div>
                  )}
                  {selectedVisit.team && (
                    <div><strong>Team:</strong> {selectedVisit.team}</div>
                  )}
                  {selectedVisit.uin && (
                    <div><strong>UIN:</strong> {selectedVisit.uin}</div>
                  )}
                </div>
              </div>
            )}

            {/* Assessment Data */}
            {(selectedVisit.studiesProgress || selectedVisit.childBehaviorAtHome || selectedVisit.parentFeedback) && (
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
                <h4 className="text-lg font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  📊 Assessment Data
                </h4>
                <div className="space-y-3">
                  {selectedVisit.studiesProgress && (
                    <div className="bg-white p-3 rounded-lg">
                      <strong className="text-gray-700">📚 Studies Progress:</strong>
                      <p className="text-gray-600 mt-1">{selectedVisit.studiesProgress}</p>
                    </div>
                  )}
                  {selectedVisit.childBehaviorAtHome && (
                    <div className="bg-white p-3 rounded-lg">
                      <strong className="text-gray-700">👶 Child Behavior:</strong>
                      <p className="text-gray-600 mt-1">{selectedVisit.childBehaviorAtHome}</p>
                    </div>
                  )}
                  {selectedVisit.parentFeedback && (
                    <div className="bg-white p-3 rounded-lg">
                      <strong className="text-gray-700">👨‍👩‍👧‍👦 Parent Feedback:</strong>
                      <p className="text-gray-600 mt-1">{selectedVisit.parentFeedback}</p>
                      {selectedVisit.feedbackType && (
                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                          selectedVisit.feedbackType === 'Positive' ? 'bg-green-100 text-green-800' :
                          selectedVisit.feedbackType === 'Negative' ? 'bg-red-100 text-red-800' :
                          selectedVisit.feedbackType === 'Both Positive and Negative' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedVisit.feedbackType}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedVisit.notes && (
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  📝 Notes
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedVisit.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setShowVisitViewModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}