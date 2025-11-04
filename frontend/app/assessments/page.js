'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { assessmentAPI, childAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { Plus, Target, User, Calendar, TrendingUp, CheckCircle } from 'lucide-react';

export default function AssessmentsPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    child: '',
    assessorName: '',
    assessmentDate: '',
    dateOfJoining: '',
    dateOfBirth: '',
    apparentAge: '',
    languageDifficulty: '',
    coachingSite: '',
    lsasScores: {
      interactingWithOthers: { score: 0, comments: '', anyComment: '' },
      overcomingDifficulties: { score: 0, comments: '', anyComment: '' },
      takingInitiative: { score: 0, comments: '', anyComment: '' },
      managingConflict: { score: 0, comments: '', anyComment: '' },
      understandingInstructions: { score: 0, comments: '', anyComment: '' },
      overallScore: { score: 0, comments: '', anyComment: '' }
    },
    extraNotes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assessmentsRes, childrenRes] = await Promise.all([
        assessmentAPI.getAll(),
        childAPI.getAll()
      ]);
      
      setAssessments(assessmentsRes.data?.data || assessmentsRes.data || []);
      setChildren(childrenRes.data?.data || childrenRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAssessments([]);
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await assessmentAPI.create(formData);
      setShowCreateModal(false);
      setFormData({
        child: '',
        assessorName: '',
        assessmentDate: '',
        dateOfJoining: '',
        dateOfBirth: '',
        apparentAge: '',
        languageDifficulty: '',
        coachingSite: '',
        lsasScores: {
          interactingWithOthers: { score: 0, comments: '', anyComment: '' },
          overcomingDifficulties: { score: 0, comments: '', anyComment: '' },
          takingInitiative: { score: 0, comments: '', anyComment: '' },
          managingConflict: { score: 0, comments: '', anyComment: '' },
          understandingInstructions: { score: 0, comments: '', anyComment: '' },
          overallScore: { score: 0, comments: '', anyComment: '' }
        },
        extraNotes: ''
      });
      fetchData();
      alert('Assessment completed successfully!');
    } catch (error) {
      console.error('Error creating assessment:', error);
      alert('Error creating assessment. Please try again.');
    }
  };

  const canManageAssessments = ['programme_director', 'programme_manager', 'coach'].includes(user?.role);

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
          <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-600 mt-2">Life Skills Assessment System (LSAS) tracking</p>
        </div>
        {canManageAssessments && (
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Assessment
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <Target className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assessments.length > 0 
                    ? (assessments.reduce((sum, a) => sum + a.averageScore, 0) / assessments.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <div className="p-3 bg-secondary-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Children Assessed</p>
                <p className="text-2xl font-bold text-gray-900">{children.length}</p>
              </div>
              <div className="p-3 bg-success-100 rounded-full">
                <User className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{assessments.filter(a => a.status === 'completed').length}</p>
              </div>
              <div className="p-3 bg-warning-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Assessments List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Assessments</h2>
        
        {assessments.length > 0 ? (
          <div className="space-y-4">
            {assessments.map((assessment, index) => (
              <motion.div
                key={assessment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {assessment.averageScore.toFixed(1)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {assessment.child?.name || 'Unknown Child'}
                    </h3>
                    <p className="text-sm text-gray-500">LSAS Assessment</p>
                    <p className="text-xs text-gray-400">
                      Assessed by {assessment.assessorName || assessment.assessor?.name || 'Unknown'} • {new Date(assessment.assessmentDate || assessment.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-1 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">IO: {assessment.lsasScores?.interactingWithOthers?.score || 0}</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">DP: {assessment.lsasScores?.overcomingDifficulties?.score || 0}</span>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">TI: {assessment.lsasScores?.takingInitiative?.score || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                  <p className="text-sm text-gray-500 mt-1">Total: {assessment.totalScore || 0}/30</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No assessments yet</h3>
            <p className="text-gray-500 mb-6">Start conducting LSAS assessments to track progress</p>
            {canManageAssessments && (
              <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create First Assessment
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Create Assessment Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="🎯 LSAS Assessment Form">
        <form onSubmit={handleCreate} className="space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Basic Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">📝 Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coaching Site *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.coachingSite}
                  onChange={(e) => setFormData({...formData, coachingSite: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name of Child *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.child}
                  onChange={(e) => setFormData({...formData, child: e.target.value})}
                  placeholder="Enter child's name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name of Assessor *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.assessorName}
                  onChange={(e) => setFormData({...formData, assessorName: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Assessment *</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.assessmentDate}
                  onChange={(e) => setFormData({...formData, assessmentDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.dateOfJoining}
                  onChange={(e) => setFormData({...formData, dateOfJoining: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">How old does the child look?</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.apparentAge}
                  onChange={(e) => setFormData({...formData, apparentAge: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language Difficulty?</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  value={formData.languageDifficulty}
                  onChange={(e) => setFormData({...formData, languageDifficulty: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* LSAS Scores */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-4">🎯 LSAS Assessment (0-5 Scale)</h3>
            {[
              { key: 'interactingWithOthers', label: 'IO: INTERACTING WITH OTHERS', desc: 'Does X interact appropriately with peers, staff, opposite sex? Does X communicate effectively?' },
              { key: 'overcomingDifficulties', label: 'DP: OVERCOMING DIFFICULTIES & SOLVING PROBLEMS', desc: 'Does X find a way around obstacles? Does X ask for help appropriately?' },
              { key: 'takingInitiative', label: 'TI: TAKING INITIATIVE', desc: 'Does X carry out tasks without being told? Does X show age appropriate leadership?' },
              { key: 'managingConflict', label: 'MC: MANAGING CONFLICT', desc: 'Does X show appropriate assertiveness? Does X resolve disagreements appropriately?' },
              { key: 'understandingInstructions', label: 'UI: UNDERSTANDING & FOLLOWING INSTRUCTIONS', desc: 'Does X understand instructions when given? Does X comply with instructions?' },
              { key: 'overallScore', label: 'OS: OVERALL SCORE', desc: 'Overall assessment of the child\'s life skills development' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="mb-6 p-4 bg-white rounded-lg border">
                <label className="block text-sm font-bold text-gray-800 mb-2">{label}</label>
                <p className="text-xs text-gray-600 mb-3">{desc}</p>
                
                <div className="flex gap-2 mb-3">
                  {[0, 1, 2, 3, 4, 5].map(value => (
                    <Button
                      key={value}
                      type="button"
                      size="sm"
                      variant={formData.lsasScores[key].score === value ? 'default' : 'outline'}
                      onClick={() => setFormData({
                        ...formData,
                        lsasScores: {
                          ...formData.lsasScores,
                          [key]: { ...formData.lsasScores[key], score: value }
                        }
                      })}
                      className="w-10 h-10 font-bold"
                    >
                      {value}
                    </Button>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Comments:</label>
                    <textarea
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      rows={2}
                      value={formData.lsasScores[key].comments}
                      onChange={(e) => setFormData({
                        ...formData,
                        lsasScores: {
                          ...formData.lsasScores,
                          [key]: { ...formData.lsasScores[key], comments: e.target.value }
                        }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Any Comment:</label>
                    <textarea
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      rows={2}
                      value={formData.lsasScores[key].anyComment}
                      onChange={(e) => setFormData({
                        ...formData,
                        lsasScores: {
                          ...formData.lsasScores,
                          [key]: { ...formData.lsasScores[key], anyComment: e.target.value }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Extra Notes */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-900 mb-4">📝 Extra Notes</h3>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={4}
              value={formData.extraNotes}
              onChange={(e) => setFormData({...formData, extraNotes: e.target.value})}
              placeholder="Additional observations, recommendations, or notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
              🎯 Complete LSAS Assessment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}