'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { childAPI, assessmentAPI, homeVisitAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Calendar, MapPin, Phone, Mail, Plus, FileText, Home } from 'lucide-react';

export default function ChildDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [child, setChild] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [homeVisits, setHomeVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    address: '',
    medicalInfo: ''
  });
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [assessmentData, setAssessmentData] = useState({
    type: 'baseline',
    programme: 'school',
    location: '',
    lsasScores: {
      communication: { score: 3, notes: '' },
      teamwork: { score: 3, notes: '' },
      leadership: { score: 3, notes: '' },
      problemSolving: { score: 3, notes: '' },
      selfConfidence: { score: 3, notes: '' },
      emotionalRegulation: { score: 3, notes: '' },
      socialSkills: { score: 3, notes: '' },
      resilience: { score: 3, notes: '' }
    },
    observations: {
      strengths: [],
      areasForImprovement: [],
      behavioralNotes: '',
      participationLevel: 'moderate',
      attentionSpan: 'moderate'
    },
    recommendations: []
  });
  const [visitData, setVisitData] = useState({
    visitDate: '',
    visitTime: '',
    duration: 60,
    purpose: 'initial_assessment',
    location: {
      address: ''
    },
    attendees: [{ name: '', relationship: '', age: '' }],
    notes: '',
    followUpRequired: false
  });
  const [showAssessmentViewModal, setShowAssessmentViewModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showVisitViewModal, setShowVisitViewModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [showVisitReportModal, setShowVisitReportModal] = useState(false);
  const [showCompleteVisitModal, setShowCompleteVisitModal] = useState(false);
  const [visitCompletionData, setVisitCompletionData] = useState({
    observations: {
      homeEnvironment: '',
      familyDynamics: '',
      childBehavior: '',
      academicSupport: '',
      challenges: ''
    },
    discussions: [{ topic: '', details: '', outcome: '' }],
    actionItems: [{ description: '', assignedTo: '', dueDate: '', status: 'pending' }],
    followUpRequired: false,
    nextVisitDate: '',
    notes: ''
  });
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollData, setEnrollData] = useState({
    type: 'school',
    location: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (id) {
      fetchChildDetails();
    }
  }, [id]);

  const fetchChildDetails = async () => {
    try {
      const childRes = await childAPI.getById(id);
      
      const responseData = childRes.data?.data || childRes.data;
      const childData = responseData.child || responseData;
      const assessmentsData = responseData.assessments || [];
      const homeVisitsData = responseData.homeVisits || [];
      
      setChild(childData);
      setAssessments(assessmentsData);
      setHomeVisits(homeVisitsData);
      
      setEditData({
        name: childData.name || '',
        guardianName: childData.guardianName || '',
        guardianPhone: childData.guardianPhone || '',
        guardianEmail: childData.guardianEmail || '',
        address: childData.address || '',
        medicalInfo: childData.medicalInfo || ''
      });
    } catch (error) {
      console.error('Error fetching child details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await childAPI.update(id, editData);
      setShowEditModal(false);
      fetchChildDetails();
      alert('Child profile updated successfully!');
    } catch (error) {
      console.error('Error updating child:', error);
      alert('Error updating child profile');
    }
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    try {
      const assessmentPayload = {
        child: id,
        type: assessmentData.type,
        assessmentDate: new Date(),
        programme: assessmentData.programme,
        location: assessmentData.location,
        lsasScores: assessmentData.lsasScores,
        observations: assessmentData.observations,
        recommendations: assessmentData.recommendations
      };
      
      await assessmentAPI.create(assessmentPayload);
      setShowAssessmentModal(false);
      setAssessmentData({
        type: 'baseline',
        programme: 'school',
        location: '',
        lsasScores: {
          communication: { score: 3, notes: '' },
          teamwork: { score: 3, notes: '' },
          leadership: { score: 3, notes: '' },
          problemSolving: { score: 3, notes: '' },
          selfConfidence: { score: 3, notes: '' },
          emotionalRegulation: { score: 3, notes: '' },
          socialSkills: { score: 3, notes: '' },
          resilience: { score: 3, notes: '' }
        },
        observations: {
          strengths: [],
          areasForImprovement: [],
          behavioralNotes: '',
          participationLevel: 'moderate',
          attentionSpan: 'moderate'
        },
        recommendations: []
      });
      setShowAssessmentViewModal(false);
      setSelectedAssessment(null);
      fetchChildDetails();
      alert('Assessment created successfully!');
    } catch (error) {
      console.error('Error creating assessment:', error);
      alert('Error creating assessment');
    }
  };

  const updateLSASScore = (skill, field, value) => {
    setAssessmentData(prev => ({
      ...prev,
      lsasScores: {
        ...prev.lsasScores,
        [skill]: {
          ...prev.lsasScores[skill],
          [field]: value
        }
      }
    }));
  };

  const updateObservation = (field, value) => {
    setAssessmentData(prev => ({
      ...prev,
      observations: {
        ...prev.observations,
        [field]: value
      }
    }));
  };

  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    try {
      await homeVisitAPI.create({
        child: id,
        ...visitData
      });
      setShowVisitModal(false);
      setVisitData({
        visitDate: '',
        visitTime: '',
        duration: 60,
        purpose: 'initial_assessment',
        location: { address: '' },
        attendees: [{ name: '', relationship: '', age: '' }],
        notes: '',
        followUpRequired: false
      });
      fetchChildDetails();
      alert('Home visit scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling visit:', error);
      alert('Error scheduling visit');
    }
  };

  const addAttendee = () => {
    setVisitData(prev => ({
      ...prev,
      attendees: [...prev.attendees, { name: '', relationship: '', age: '' }]
    }));
  };

  const updateAttendee = (index, field, value) => {
    setVisitData(prev => ({
      ...prev,
      attendees: prev.attendees.map((attendee, i) => 
        i === index ? { ...attendee, [field]: value } : attendee
      )
    }));
  };

  const removeAttendee = (index) => {
    setVisitData(prev => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index)
    }));
  };

  const viewAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    setShowAssessmentViewModal(true);
  };

  const viewVisit = (visit) => {
    setSelectedVisit(visit);
    setShowVisitViewModal(true);
  };

  const updateVisitStatus = async (visitId, status) => {
    try {
      await homeVisitAPI.update(visitId, { status });
      fetchChildDetails();
      alert(`Visit ${status} successfully!`);
    } catch (error) {
      console.error('Error updating visit status:', error);
      alert('Error updating visit status');
    }
  };

  const completeVisitWithDetails = async () => {
    try {
      await homeVisitAPI.update(selectedVisit._id, {
        status: 'completed',
        ...visitCompletionData
      });
      setShowCompleteVisitModal(false);
      setShowVisitViewModal(false);
      fetchChildDetails();
      alert('Visit completed successfully!');
    } catch (error) {
      console.error('Error completing visit:', error);
      alert('Error completing visit');
    }
  };

  const showVisitReport = (visit) => {
    setSelectedVisit(visit);
    setShowVisitReportModal(true);
  };

  const openCompleteVisitModal = (visit) => {
    setSelectedVisit(visit);
    setShowCompleteVisitModal(true);
  };

  const addDiscussion = () => {
    setVisitCompletionData(prev => ({
      ...prev,
      discussions: [...prev.discussions, { topic: '', details: '', outcome: '' }]
    }));
  };

  const updateDiscussion = (index, field, value) => {
    setVisitCompletionData(prev => ({
      ...prev,
      discussions: prev.discussions.map((disc, i) => 
        i === index ? { ...disc, [field]: value } : disc
      )
    }));
  };

  const addActionItem = () => {
    setVisitCompletionData(prev => ({
      ...prev,
      actionItems: [...prev.actionItems, { description: '', assignedTo: '', dueDate: '', status: 'pending' }]
    }));
  };

  const updateActionItem = (index, field, value) => {
    setVisitCompletionData(prev => ({
      ...prev,
      actionItems: prev.actionItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
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

  const canEdit = ['programme_director', 'programme_manager'].includes(user?.role);
  const canScheduleVisits = ['programme_director', 'programme_manager'].includes(user?.role);
  const canCreateAssessments = ['programme_director', 'programme_manager'].includes(user?.role);

  const handleEnrollProgramme = async (e) => {
    e.preventDefault();
    try {
      await childAPI.update(id, {
        $push: {
          programmes: {
            ...enrollData,
            startDate: new Date(enrollData.startDate),
            isActive: true,
            coach: user.id
          }
        }
      });
      setShowEnrollModal(false);
      setEnrollData({
        type: 'school',
        location: '',
        startDate: new Date().toISOString().split('T')[0]
      });
      fetchChildDetails();
      alert('Child enrolled in programme successfully!');
    } catch (error) {
      console.error('Error enrolling child:', error);
      alert('Error enrolling child in programme');
    }
  };

  const deactivateProgramme = async (programmeIndex) => {
    try {
      const updatedProgrammes = [...child.programmes];
      updatedProgrammes[programmeIndex].isActive = false;
      updatedProgrammes[programmeIndex].endDate = new Date();
      
      await childAPI.update(id, { programmes: updatedProgrammes });
      fetchChildDetails();
      alert('Programme deactivated successfully!');
    } catch (error) {
      console.error('Error deactivating programme:', error);
      alert('Error deactivating programme');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Child Not Found</h2>
          <p className="text-gray-600 mb-4">The child profile you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/children')}>Back to Children</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.push('/children')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Children
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{child.name}</h1>
          <p className="text-gray-600">Child Profile & Progress Tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Child Information */}
        <div className="lg:col-span-1">
          <Card className="p-6 mb-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                {child.name ? child.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'NA'}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{child.name}</h2>
              <p className="text-gray-500">Age {child.age}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                child.status === 'active' ? 'bg-green-100 text-green-800' :
                child.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {child.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Programmes</p>
                  <div className="space-y-1">
                    {child.programmes?.filter(p => p.isActive).length > 0 ? (
                      child.programmes.filter(p => p.isActive).map((prog, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                            {prog.type}
                          </span>
                          {prog.location && (
                            <span className="text-xs text-gray-500">@ {prog.location}</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="font-medium">{child.programme || 'Not assigned'}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{new Date(child.dateOfBirth).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{child.address}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" 
                onClick={() => router.push(`/children/${id}/register`)}
              >
                📝 Register for Programs & Sessions
              </Button>
              {canEdit && (
                <>
                  <Button className="w-full" onClick={() => setShowEditModal(true)}>
                    Edit Profile
                  </Button>
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600" 
                    onClick={() => setShowEnrollModal(true)}
                  >
                    📚 Enroll in Programme
                  </Button>
                </>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Parent/Guardian</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{child.guardianName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{child.guardianPhone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{child.guardianEmail}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress & Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Assessments */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Assessments</h2>
              {canCreateAssessments && (
                <Button size="sm" className="flex items-center gap-2" onClick={() => setShowAssessmentModal(true)}>
                  <Plus className="w-4 h-4" />
                  New Assessment
                </Button>
              )}
            </div>
            
            {assessments.length > 0 ? (
              <div className="space-y-3">
                {assessments.slice(0, 3).map((assessment, index) => (
                  <motion.div
                    key={assessment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <FileText className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium">{assessment.type} Assessment</p>
                        <p className="text-sm text-gray-500">
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => viewAssessment(assessment)}>View</Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No assessments yet</p>
              </div>
            )}
          </Card>

          {/* Home Visits */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Home Visits</h2>
              {canScheduleVisits && (
                <Button size="sm" className="flex items-center gap-2" onClick={() => setShowVisitModal(true)}>
                  <Plus className="w-4 h-4" />
                  Schedule Visit
                </Button>
              )}
            </div>
            
            {homeVisits.length > 0 ? (
              <div className="space-y-3">
                {homeVisits.slice(0, 3).map((visit, index) => (
                  <motion.div
                    key={visit._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                          <Home className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">🏠 Home Visit</p>
                          <p className="text-sm text-gray-500">
                            📅 {formatDateTime(visit.visitDate)}
                          </p>
                          <p className="text-sm text-gray-500">
                            🎯 {visit.purpose?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General Visit'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        visit.status === 'completed' ? 'bg-green-100 text-green-800' :
                        visit.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                        visit.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {visit.status === 'completed' ? '✅ Completed' :
                         visit.status === 'planned' ? '📋 Planned' :
                         visit.status === 'cancelled' ? '❌ Cancelled' :
                         '🔄 ' + visit.status}
                      </span>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => viewVisit(visit)} className="flex-1">
                        👁️ View Details
                      </Button>
                      {visit.status === 'planned' && canScheduleVisits && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => openCompleteVisitModal(visit)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            ✅ Complete
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateVisitStatus(visit._id, 'cancelled')}
                            className="text-red-500 hover:text-red-700 border-red-300"
                          >
                            ❌ Cancel
                          </Button>
                        </>
                      )}
                      {visit.status === 'completed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => showVisitReport(visit)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          📄 Report
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No home visits scheduled</p>
              </div>
            )}
          </Card>

          {/* Transfer History */}
          {child.transferHistory && child.transferHistory.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🔄 Transfer History</h2>
              <div className="space-y-3">
                {child.transferHistory.map((transfer, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-blue-900">
                          {transfer.fromLocation} → {transfer.toLocation}
                        </p>
                        <p className="text-sm text-blue-700">
                          📅 {formatDate(transfer.transferDate)}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Transfer #{child.transferHistory.length - index}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Reason:</strong> {transfer.reason}
                    </p>
                    {transfer.transferredBy && (
                      <p className="text-xs text-gray-500">
                        Transferred by: {transfer.transferredBy.name || 'System'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Programme History */}
          {child.programmes && child.programmes.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📚 Programme History</h2>
              <div className="space-y-3">
                {child.programmes.map((programme, index) => (
                  <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-green-900 capitalize">
                          {programme.type} Programme
                        </p>
                        <p className="text-sm text-green-700">
                          📍 {programme.location || 'Location not specified'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        programme.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {programme.isActive ? '✅ Active' : '⏸️ Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-sm text-gray-700">
                        <p><strong>Start:</strong> {formatDate(programme.startDate)}</p>
                        {programme.endDate && (
                          <p><strong>End:</strong> {formatDate(programme.endDate)}</p>
                        )}
                        {programme.coach && (
                          <p><strong>Coach:</strong> {programme.coach.name || 'Not assigned'}</p>
                        )}
                      </div>
                      {programme.isActive && canEdit && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deactivateProgramme(index)}
                          className="text-red-500 hover:text-red-700 border-red-300"
                        >
                          ⏸️ End Programme
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Medical Information */}
          {child.medicalInfo && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Medical Information</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">{child.medicalInfo}</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Child Profile">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Full Name"
            value={editData.name}
            onChange={(e) => setEditData({...editData, name: e.target.value})}
            required
          />
          <Input
            label="Guardian Name"
            value={editData.guardianName}
            onChange={(e) => setEditData({...editData, guardianName: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Guardian Phone"
              value={editData.guardianPhone}
              onChange={(e) => setEditData({...editData, guardianPhone: e.target.value})}
              required
            />
            <Input
              label="Guardian Email"
              type="email"
              value={editData.guardianEmail}
              onChange={(e) => setEditData({...editData, guardianEmail: e.target.value})}
              required
            />
          </div>
          <Input
            label="Address"
            value={editData.address}
            onChange={(e) => setEditData({...editData, address: e.target.value})}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medical Information</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              value={editData.medicalInfo}
              onChange={(e) => setEditData({...editData, medicalInfo: e.target.value})}
              placeholder="Any medical conditions, allergies, or special needs..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Profile</Button>
          </div>
        </form>
      </Modal>

      {/* New Assessment Modal */}
      <Modal isOpen={showAssessmentModal} onClose={() => setShowAssessmentModal(false)} title="Life Skills Assessment (LSAS)">
        <div className="max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleCreateAssessment} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={assessmentData.type}
                    onChange={(e) => setAssessmentData({...assessmentData, type: e.target.value})}
                    required
                  >
                    <option value="baseline">Baseline Assessment</option>
                    <option value="midline">Midline Assessment</option>
                    <option value="endline">Endline Assessment</option>
                    <option value="follow_up">Follow-up Assessment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Programme</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={assessmentData.programme}
                    onChange={(e) => setAssessmentData({...assessmentData, programme: e.target.value})}
                    required
                  >
                    <option value="school">School Programme</option>
                    <option value="community">Community Programme</option>
                    <option value="workshop">Workshop Programme</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <Input
                  label="Location"
                  value={assessmentData.location}
                  onChange={(e) => setAssessmentData({...assessmentData, location: e.target.value})}
                  placeholder="Assessment location"
                />
              </div>
            </div>

            {/* LSAS Scores */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Life Skills Assessment Scores (1-5 Scale)</h3>
              <div className="space-y-4">
                {Object.entries(assessmentData.lsasScores).map(([skill, data]) => (
                  <div key={skill} className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {skill.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(score => (
                          <button
                            key={score}
                            type="button"
                            onClick={() => updateLSASScore(skill, 'score', score)}
                            className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                              data.score === score
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      rows={2}
                      value={data.notes}
                      onChange={(e) => updateLSASScore(skill, 'notes', e.target.value)}
                      placeholder={`Notes for ${skill}...`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Observations */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Observations</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Participation Level</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={assessmentData.observations.participationLevel}
                      onChange={(e) => updateObservation('participationLevel', e.target.value)}
                    >
                      <option value="very_low">Very Low</option>
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                      <option value="very_high">Very High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attention Span</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={assessmentData.observations.attentionSpan}
                      onChange={(e) => updateObservation('attentionSpan', e.target.value)}
                    >
                      <option value="very_short">Very Short</option>
                      <option value="short">Short</option>
                      <option value="moderate">Moderate</option>
                      <option value="long">Long</option>
                      <option value="very_long">Very Long</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Behavioral Notes</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    value={assessmentData.observations.behavioralNotes}
                    onChange={(e) => updateObservation('behavioralNotes', e.target.value)}
                    placeholder="Detailed behavioral observations..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowAssessmentModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Assessment
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Schedule Visit Modal */}
      <Modal isOpen={showVisitModal} onClose={() => setShowVisitModal(false)} title="🏠 Schedule Home Visit">
        <div className="max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleScheduleVisit} className="space-y-6">
            {/* Visit Details */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                📅 Visit Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Visit Date"
                  type="date"
                  value={visitData.visitDate}
                  onChange={(e) => setVisitData({...visitData, visitDate: e.target.value})}
                  required
                />
                <Input
                  label="Visit Time"
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
                    <option value="initial_assessment">🔍 Initial Assessment</option>
                    <option value="follow_up">📋 Follow-up</option>
                    <option value="family_engagement">👨‍👩‍👧‍👦 Family Engagement</option>
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
                label="Address"
                value={visitData.location.address}
                onChange={(e) => setVisitData({...visitData, location: { address: e.target.value }})}
                placeholder="Full address for the home visit"
                required
              />
            </div>

            {/* Attendees */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2">
                  👥 Expected Attendees
                </h3>
                <Button type="button" size="sm" onClick={addAttendee} className="bg-green-500 hover:bg-green-600">
                  + Add Person
                </Button>
              </div>
              <div className="space-y-3">
                {visitData.attendees.map((attendee, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-green-200">
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        label="Name"
                        value={attendee.name}
                        onChange={(e) => updateAttendee(index, 'name', e.target.value)}
                        placeholder="Full name"
                      />
                      <Input
                        label="Relationship"
                        value={attendee.relationship}
                        onChange={(e) => updateAttendee(index, 'relationship', e.target.value)}
                        placeholder="e.g., Mother, Father"
                      />
                      <div className="flex gap-2">
                        <Input
                          label="Age"
                          type="number"
                          value={attendee.age}
                          onChange={(e) => updateAttendee(index, 'age', e.target.value)}
                          placeholder="Age"
                        />
                        {visitData.attendees.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeAttendee(index)}
                            className="mt-6 text-red-500 hover:text-red-700"
                          >
                            ✕
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              <Button type="button" variant="outline" onClick={() => setShowVisitModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                🏠 Schedule Visit
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Assessment View Modal */}
      <Modal isOpen={showAssessmentViewModal} onClose={() => setShowAssessmentViewModal(false)} title="📊 Assessment Details">
        {selectedAssessment && (
          <div className="max-h-[80vh] overflow-y-auto space-y-6">
            {/* Assessment Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-indigo-900 capitalize">
                  {selectedAssessment.type} Assessment
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedAssessment.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedAssessment.isCompleted ? '✅ Completed' : '⏳ In Progress'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>📅 Date: {new Date(selectedAssessment.assessmentDate || selectedAssessment.createdAt).toLocaleDateString()}</div>
                <div>🎯 Programme: {selectedAssessment.programme}</div>
                <div>👨‍🏫 Assessor: {selectedAssessment.assessor?.name || 'Unknown'}</div>
                <div>⭐ Average Score: {selectedAssessment.averageScore || 'N/A'}/5</div>
              </div>
            </div>

            {/* LSAS Scores */}
            {selectedAssessment.lsasScores && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">📈 Life Skills Scores</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedAssessment.lsasScores).map(([skill, data]) => (
                    <div key={skill} className="bg-white p-3 rounded-lg border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize text-gray-700">
                          {skill.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-bold text-blue-600">{data.score || 'N/A'}</span>
                          <span className="text-sm text-gray-500">/5</span>
                        </div>
                      </div>
                      {data.notes && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{data.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observations */}
            {selectedAssessment.observations && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-lg font-semibold text-green-900 mb-4">👁️ Observations</h4>
                <div className="space-y-3">
                  {selectedAssessment.observations.participationLevel && (
                    <div className="bg-white p-3 rounded-lg">
                      <span className="font-medium text-gray-700">Participation Level: </span>
                      <span className="capitalize text-green-600">{selectedAssessment.observations.participationLevel.replace('_', ' ')}</span>
                    </div>
                  )}
                  {selectedAssessment.observations.attentionSpan && (
                    <div className="bg-white p-3 rounded-lg">
                      <span className="font-medium text-gray-700">Attention Span: </span>
                      <span className="capitalize text-green-600">{selectedAssessment.observations.attentionSpan.replace('_', ' ')}</span>
                    </div>
                  )}
                  {selectedAssessment.observations.behavioralNotes && (
                    <div className="bg-white p-3 rounded-lg">
                      <span className="font-medium text-gray-700 block mb-2">Behavioral Notes:</span>
                      <p className="text-gray-600">{selectedAssessment.observations.behavioralNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setShowAssessmentViewModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Home Visit View Modal */}
      <Modal isOpen={showVisitViewModal} onClose={() => setShowVisitViewModal(false)} title="🏠 Home Visit Details">
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

            {/* Attendees */}
            {selectedVisit.attendees && selectedVisit.attendees.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                  👥 Attendees
                </h4>
                <div className="space-y-2">
                  {selectedVisit.attendees.map((attendee, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{attendee.name || 'Unnamed'}</span>
                        <div className="text-sm text-gray-600">
                          {attendee.relationship && <span className="mr-2">👤 {attendee.relationship}</span>}
                          {attendee.age && <span>🎂 {attendee.age} years</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedVisit.notes && (
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
                <h4 className="text-lg font-semibold text-orange-900 mb-2 flex items-center gap-2">
                  📝 Notes
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedVisit.notes}</p>
              </div>
            )}

            {/* Observations (if completed) */}
            {selectedVisit.status === 'completed' && selectedVisit.observations && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
                <h4 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  👁️ Observations
                </h4>
                <div className="space-y-3">
                  {selectedVisit.observations.homeEnvironment && (
                    <div className="bg-white p-3 rounded-lg">
                      <strong className="text-gray-700">🏠 Home Environment:</strong>
                      <p className="text-gray-600 mt-1">{selectedVisit.observations.homeEnvironment}</p>
                    </div>
                  )}
                  {selectedVisit.observations.familyDynamics && (
                    <div className="bg-white p-3 rounded-lg">
                      <strong className="text-gray-700">👨‍👩‍👧‍👦 Family Dynamics:</strong>
                      <p className="text-gray-600 mt-1">{selectedVisit.observations.familyDynamics}</p>
                    </div>
                  )}
                  {selectedVisit.observations.childBehavior && (
                    <div className="bg-white p-3 rounded-lg">
                      <strong className="text-gray-700">👶 Child Behavior:</strong>
                      <p className="text-gray-600 mt-1">{selectedVisit.observations.childBehavior}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowVisitViewModal(false)}>
                Close
              </Button>
              {selectedVisit.status === 'planned' && canScheduleVisits && (
                <>
                  <Button 
                    onClick={() => {
                      setShowVisitViewModal(false);
                      openCompleteVisitModal(selectedVisit);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    ✅ Complete Visit
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      updateVisitStatus(selectedVisit._id, 'cancelled');
                      setShowVisitViewModal(false);
                    }}
                    className="text-red-500 hover:text-red-700 border-red-300"
                  >
                    ❌ Cancel Visit
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Complete Visit Modal */}
      <Modal isOpen={showCompleteVisitModal} onClose={() => setShowCompleteVisitModal(false)} title="📝 Complete Home Visit">
        <div className="max-h-[80vh] overflow-y-auto">
          <form onSubmit={(e) => { e.preventDefault(); completeVisitWithDetails(); }} className="space-y-6">
            {/* Observations */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">🔍 Observations</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🏠 Home Environment</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={visitCompletionData.observations.homeEnvironment}
                    onChange={(e) => setVisitCompletionData(prev => ({
                      ...prev,
                      observations: { ...prev.observations, homeEnvironment: e.target.value }
                    }))}
                    placeholder="Describe the home environment, cleanliness, safety, resources available..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">👨‍👩‍👧‍👦 Family Dynamics</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={visitCompletionData.observations.familyDynamics}
                    onChange={(e) => setVisitCompletionData(prev => ({
                      ...prev,
                      observations: { ...prev.observations, familyDynamics: e.target.value }
                    }))}
                    placeholder="Family interactions, communication patterns, support systems..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">👶 Child Behavior</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={visitCompletionData.observations.childBehavior}
                    onChange={(e) => setVisitCompletionData(prev => ({
                      ...prev,
                      observations: { ...prev.observations, childBehavior: e.target.value }
                    }))}
                    placeholder="Child's behavior during visit, engagement level, mood..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📚 Academic Support</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    value={visitCompletionData.observations.academicSupport}
                    onChange={(e) => setVisitCompletionData(prev => ({
                      ...prev,
                      observations: { ...prev.observations, academicSupport: e.target.value }
                    }))}
                    placeholder="Academic support available at home, study space, parental involvement..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">⚠️ Challenges Identified</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    value={visitCompletionData.observations.challenges}
                    onChange={(e) => setVisitCompletionData(prev => ({
                      ...prev,
                      observations: { ...prev.observations, challenges: e.target.value }
                    }))}
                    placeholder="Any challenges or concerns identified during the visit..."
                  />
                </div>
              </div>
            </div>

            {/* Discussions */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-green-900">💬 Discussions</h3>
                <Button type="button" size="sm" onClick={addDiscussion} className="bg-green-500 hover:bg-green-600">
                  + Add Discussion
                </Button>
              </div>
              <div className="space-y-3">
                {visitCompletionData.discussions.map((discussion, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-green-200">
                    <div className="grid grid-cols-1 gap-3">
                      <Input
                        label="Topic"
                        value={discussion.topic}
                        onChange={(e) => updateDiscussion(index, 'topic', e.target.value)}
                        placeholder="Discussion topic"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          rows={2}
                          value={discussion.details}
                          onChange={(e) => updateDiscussion(index, 'details', e.target.value)}
                          placeholder="What was discussed?"
                        />
                      </div>
                      <Input
                        label="Outcome"
                        value={discussion.outcome}
                        onChange={(e) => updateDiscussion(index, 'outcome', e.target.value)}
                        placeholder="What was agreed or decided?"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-orange-900">✅ Action Items</h3>
                <Button type="button" size="sm" onClick={addActionItem} className="bg-orange-500 hover:bg-orange-600">
                  + Add Action
                </Button>
              </div>
              <div className="space-y-3">
                {visitCompletionData.actionItems.map((item, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-orange-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          rows={2}
                          value={item.description}
                          onChange={(e) => updateActionItem(index, 'description', e.target.value)}
                          placeholder="What needs to be done?"
                        />
                      </div>
                      <Input
                        label="Assigned To"
                        value={item.assignedTo}
                        onChange={(e) => updateActionItem(index, 'assignedTo', e.target.value)}
                        placeholder="Who is responsible?"
                      />
                      <Input
                        label="Due Date"
                        type="date"
                        value={item.dueDate}
                        onChange={(e) => updateActionItem(index, 'dueDate', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">🔄 Follow-up</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="followUpRequired"
                    checked={visitCompletionData.followUpRequired}
                    onChange={(e) => setVisitCompletionData(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="followUpRequired" className="text-sm font-medium text-gray-700">
                    📅 Follow-up visit required
                  </label>
                </div>
                {visitCompletionData.followUpRequired && (
                  <Input
                    label="Next Visit Date"
                    type="date"
                    value={visitCompletionData.nextVisitDate}
                    onChange={(e) => setVisitCompletionData(prev => ({ ...prev, nextVisitDate: e.target.value }))}
                  />
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    value={visitCompletionData.notes}
                    onChange={(e) => setVisitCompletionData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes or recommendations..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowCompleteVisitModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                ✅ Complete Visit
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Visit Report Modal */}
      <Modal isOpen={showVisitReportModal} onClose={() => setShowVisitReportModal(false)} title="📊 Home Visit Report">
        {selectedVisit && (
          <div className="max-h-[80vh] overflow-y-auto space-y-6">
            {/* Report Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
              <h3 className="text-xl font-bold text-indigo-900 mb-3">📊 Visit Report</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Child:</strong> {child.name}</div>
                <div><strong>Date:</strong> {formatDateTime(selectedVisit.visitDate)}</div>
                <div><strong>Duration:</strong> {selectedVisit.duration} minutes</div>
                <div><strong>Purpose:</strong> {selectedVisit.purpose?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                <div><strong>Coach:</strong> {selectedVisit.coach?.name || user?.name}</div>
                <div><strong>Status:</strong> {selectedVisit.status}</div>
              </div>
            </div>

            {/* Observations Report */}
            {selectedVisit.observations && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">🔍 Observations</h4>
                <div className="space-y-3">
                  {Object.entries(selectedVisit.observations).map(([key, value]) => (
                    value && (
                      <div key={key} className="bg-white p-3 rounded-lg">
                        <strong className="text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </strong>
                        <p className="text-gray-600 mt-1">{value}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Discussions Report */}
            {selectedVisit.discussions && selectedVisit.discussions.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-lg font-semibold text-green-900 mb-3">💬 Discussions</h4>
                <div className="space-y-3">
                  {selectedVisit.discussions.map((discussion, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-gray-800">{discussion.topic}</h5>
                      <p className="text-gray-600 mt-1">{discussion.details}</p>
                      {discussion.outcome && (
                        <p className="text-green-700 mt-2"><strong>Outcome:</strong> {discussion.outcome}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Items Report */}
            {selectedVisit.actionItems && selectedVisit.actionItems.length > 0 && (
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
                <h4 className="text-lg font-semibold text-orange-900 mb-3">✅ Action Items</h4>
                <div className="space-y-3">
                  {selectedVisit.actionItems.map((item, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-orange-200">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-gray-800">{item.description}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span><strong>Assigned to:</strong> {item.assignedTo}</span>
                        {item.dueDate && <span className="ml-4"><strong>Due:</strong> {formatDate(item.dueDate)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {selectedVisit.notes && (
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">📝 Additional Notes</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedVisit.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setShowVisitReportModal(false)}>
                Close Report
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Enroll Programme Modal */}
      <Modal isOpen={showEnrollModal} onClose={() => setShowEnrollModal(false)} title="📚 Enroll in Programme">
        <form onSubmit={handleEnrollProgramme} className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">🎯 Programme Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Programme Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={enrollData.type}
                  onChange={(e) => setEnrollData({...enrollData, type: e.target.value})}
                  required
                >
                  <option value="school">🏫 School Programme</option>
                  <option value="community">🏠 Community Programme</option>
                  <option value="workshop">🔧 Workshop Programme</option>
                </select>
              </div>
              
              <Input
                label="Location"
                value={enrollData.location}
                onChange={(e) => setEnrollData({...enrollData, location: e.target.value})}
                placeholder="Programme location (e.g., School Name, Community Center)"
                required
              />
              
              <Input
                label="Start Date"
                type="date"
                value={enrollData.startDate}
                onChange={(e) => setEnrollData({...enrollData, startDate: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <h4 className="text-lg font-semibold text-green-900 mb-2">ℹ️ Dual Programme Enrollment</h4>
            <div className="text-sm text-green-800 space-y-1">
              <p>• Children can be enrolled in multiple programmes simultaneously</p>
              <p>• Each programme tracks attendance and progress independently</p>
              <p>• You can end programmes individually when needed</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setShowEnrollModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
              📚 Enroll in Programme
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}