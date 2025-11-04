'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { programAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { Plus, Users, MapPin, Calendar, Clock, Target, Star, Settings, Eye } from 'lucide-react';

export default function ProgramsPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'school',
    description: '',
    location: {
      name: '',
      address: ''
    },
    schedule: {
      days: [],
      startTime: '',
      endTime: '',
      duration: 60
    },
    capacity: {
      min: 5,
      max: 20
    },
    ageRange: {
      min: 5,
      max: 18
    },
    objectives: [''],
    activities: [''],
    requirements: [''],
    resources: {
      materials: [''],
      equipment: [''],
      space: ''
    },
    fees: {
      amount: 0,
      frequency: 'monthly'
    },
    tags: []
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await programAPI.getAll();
      setPrograms(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await programAPI.create(formData);
      setShowCreateModal(false);
      resetForm();
      fetchPrograms();
      alert('Program created successfully!');
    } catch (error) {
      console.error('Error creating program:', error);
      alert('Error creating program');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'school',
      description: '',
      location: { name: '', address: '' },
      schedule: { days: [], startTime: '', endTime: '', duration: 60 },
      capacity: { min: 5, max: 20 },
      ageRange: { min: 5, max: 18 },
      objectives: [''],
      activities: [''],
      requirements: [''],
      resources: { materials: [''], equipment: [''], space: '' },
      fees: { amount: 0, frequency: 'monthly' },
      tags: []
    });
  };

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter(d => d !== day)
          : [...prev.schedule.days, day]
      }
    }));
  };

  const canCreateProgram = ['programme_director', 'programme_manager'].includes(user?.role);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'school': return '🏫';
      case 'community': return '🏠';
      case 'workshop': return '🔧';
      default: return '📚';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            📚 Programs
          </h1>
          <p className="text-gray-600 mt-2">Create and manage educational programs</p>
        </div>
        {canCreateProgram && (
          <Button 
            onClick={() => setShowCreateModal(true)} 
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            ✨ Create Program
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Programs</p>
              <p className="text-3xl font-bold text-purple-900">{programs.length}</p>
            </div>
            <div className="p-4 bg-purple-500 rounded-xl shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Active Programs</p>
              <p className="text-3xl font-bold text-green-900">
                {programs.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div className="p-4 bg-green-500 rounded-xl shadow-lg">
              <Star className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Capacity</p>
              <p className="text-3xl font-bold text-blue-900">
                {programs.reduce((sum, p) => sum + (p.capacity?.max || 0), 0)}
              </p>
            </div>
            <div className="p-4 bg-blue-500 rounded-xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Locations</p>
              <p className="text-3xl font-bold text-orange-900">
                {new Set(programs.map(p => p.location?.name).filter(Boolean)).size}
              </p>
            </div>
            <div className="p-4 bg-orange-500 rounded-xl shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {programs.map((program, index) => (
          <motion.div
            key={program._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl overflow-hidden">
              <div className="relative">
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(program.status)} shadow-md`}>
                  {program.status?.toUpperCase()}
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {getTypeIcon(program.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {program.name}
                      </h3>
                      <p className="text-sm text-indigo-600 font-medium capitalize">
                        {program.type} Program
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {program.description}
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-blue-800">
                        📍 {program.location?.name || 'Location TBD'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-green-800">
                        👥 {program.enrollment?.currentCount || 0}/{program.capacity?.max || 0} enrolled
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-purple-800">
                        🎯 Ages {program.ageRange?.min}-{program.ageRange?.max}
                      </span>
                    </div>
                    
                    {program.schedule?.days?.length > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                        <div className="p-2 bg-orange-500 rounded-lg">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-orange-800">
                          ⏰ {program.schedule.days.length} days/week
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 font-medium"
                      onClick={() => window.location.href = `/programs/${program._id}`}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      👁️ View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100 font-medium"
                      onClick={() => window.location.href = `/programs/${program._id}/children`}
                    >
                      <Users className="w-4 h-4" />
                    </Button>
                    {canCreateProgram && (
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-medium shadow-md"
                        onClick={() => window.location.href = `/programs/${program._id}/settings`}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Create Program Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="✨ Create New Program">
        <div className="max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleCreate} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                📋 Basic Information
              </h3>
              <div className="space-y-4">
                <Input
                  label="Program Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Ultimate Frisbee School Program"
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                  >
                    <option value="school">🏫 School Program</option>
                    <option value="community">🏠 Community Program</option>
                    <option value="workshop">🔧 Workshop Program</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the program objectives and activities..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location & Schedule */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                📍 Location & Schedule
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Location Name"
                    value={formData.location.name}
                    onChange={(e) => setFormData({...formData, location: {...formData.location, name: e.target.value}})}
                    placeholder="School/Center Name"
                    required
                  />
                  <Input
                    label="Address"
                    value={formData.location.address}
                    onChange={(e) => setFormData({...formData, location: {...formData.location, address: e.target.value}})}
                    placeholder="Full address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Days</label>
                  <div className="flex flex-wrap gap-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          formData.schedule.days.includes(day)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Start Time"
                    type="time"
                    value={formData.schedule.startTime}
                    onChange={(e) => setFormData({...formData, schedule: {...formData.schedule, startTime: e.target.value}})}
                  />
                  <Input
                    label="End Time"
                    type="time"
                    value={formData.schedule.endTime}
                    onChange={(e) => setFormData({...formData, schedule: {...formData.schedule, endTime: e.target.value}})}
                  />
                  <Input
                    label="Duration (min)"
                    type="number"
                    value={formData.schedule.duration}
                    onChange={(e) => setFormData({...formData, schedule: {...formData.schedule, duration: parseInt(e.target.value)}})}
                  />
                </div>
              </div>
            </div>

            {/* Capacity & Age Range */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                👥 Capacity & Age Range
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Min"
                      type="number"
                      value={formData.capacity.min}
                      onChange={(e) => setFormData({...formData, capacity: {...formData.capacity, min: parseInt(e.target.value)}})}
                    />
                    <Input
                      label="Max"
                      type="number"
                      value={formData.capacity.max}
                      onChange={(e) => setFormData({...formData, capacity: {...formData.capacity, max: parseInt(e.target.value)}})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Min Age"
                      type="number"
                      value={formData.ageRange.min}
                      onChange={(e) => setFormData({...formData, ageRange: {...formData.ageRange, min: parseInt(e.target.value)}})}
                      required
                    />
                    <Input
                      label="Max Age"
                      type="number"
                      value={formData.ageRange.max}
                      onChange={(e) => setFormData({...formData, ageRange: {...formData.ageRange, max: parseInt(e.target.value)}})}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                ✨ Create Program
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}