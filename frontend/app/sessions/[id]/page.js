'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { sessionAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, Users, Play, Pause, CheckCircle, Camera, Upload, X } from 'lucide-react';

export default function SessionDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSessionDetails();
    }
  }, [id]);

  const fetchSessionDetails = async () => {
    try {
      const response = await sessionAPI.getById(id);
      const sessionData = response.data?.data || response.data;
      setSession(sessionData);
      setAttendance(sessionData.attendance || []);
    } catch (error) {
      console.error('Error fetching session details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      if (status === 'ongoing') {
        await sessionAPI.start(id);
      } else if (status === 'completed') {
        await sessionAPI.complete(id);
      }
      fetchSessionDetails();
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  const canManage = ['programme_director', 'programme_manager', 'coach'].includes(user?.role);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handlePhotoUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('photos', file);
      });
      
      await sessionAPI.uploadPhotos(id, formData);
      alert('Photos uploaded successfully!');
      setShowPhotoModal(false);
      setSelectedFiles([]);
      fetchSessionDetails();
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Error uploading photos');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setShowLightbox(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h2>
          <p className="text-gray-600 mb-4">The session you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/sessions')}>Back to Sessions</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.push('/sessions')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Sessions
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{session.title}</h1>
          <p className="text-gray-600">Session Details & Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Information */}
        <div className="lg:col-span-2">
          <Card className="p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Session Overview</h2>
              <div className="flex items-center gap-2">
                {session.status === 'ongoing' && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  session.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {session.status?.toUpperCase()}
                </span>
              </div>
            </div>

            <p className="text-gray-600 mb-6">{session.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">
                    {session.scheduledDate ? new Date(session.scheduledDate).toLocaleDateString() : 'Date TBD'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {session.scheduledStartTime && session.scheduledEndTime ? 
                      `${new Date(session.scheduledStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(session.scheduledEndTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 
                      'Time TBD'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{typeof session.location === 'string' ? session.location : session.location?.name || 'Location TBD'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Participants</p>
                  <p className="font-medium">
                    {attendance.filter(a => a.present === true).length}/{attendance.length}
                  </p>
                </div>
              </div>
            </div>

            {session.activities && session.activities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Planned Activities</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {session.activities.map((activity, index) => (
                    <div key={activity._id || index} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium text-gray-900">{activity.name}</h4>
                      {activity.description && (
                        <p className="text-gray-700 text-sm mt-1">{activity.description}</p>
                      )}
                      {activity.skillsFocused && activity.skillsFocused.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {activity.skillsFocused.map((skill, skillIndex) => (
                            <span key={skillIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Photo Gallery */}
          {session.photos && session.photos.length > 0 && (
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Session Photos ({session.photos.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {session.photos.map((photo, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="relative group cursor-pointer"
                    onClick={() => handlePhotoClick(photo)}
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Session photo'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-2 left-2 right-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {photo.caption && <p className="truncate">{photo.caption}</p>}
                        <p className="text-xs opacity-75">{new Date(photo.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}

          {/* Attendance */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                📋 Attendance Overview
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{attendance.length} registered</span>
                <button
                  onClick={() => router.push(`/sessions/${id}/attendance`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  ⚙️ Manage Attendance
                </button>
              </div>
            </div>
            
            {attendance.length > 0 ? (
              <div className="space-y-3">
                {attendance.map((item, index) => (
                  <motion.div
                    key={item.child?._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {(item.child?.name || item.child?.firstName || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {item.child?.name || `${item.child?.firstName || ''} ${item.child?.lastName || ''}`.trim() || 'Unknown Child'}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            🎂 Age {item.child?.age || 'N/A'}
                          </span>
                          {item.child?.gender && (
                            <span className="flex items-center gap-1">
                              {item.child.gender === 'male' ? '👦' : '👧'} {item.child.gender}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                        item.present === true ? 'bg-green-100 text-green-800 border border-green-200' :
                        item.present === false ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {item.present === true ? '✅ Present' :
                         item.present === false ? '❌ Absent' :
                         '⏳ Not Marked'}
                      </span>
                      <button
                        onClick={() => router.push(`/sessions/${id}/attendance`)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Mark →
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No attendance data available</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              {session.status === 'scheduled' && (
                <Button 
                  className="w-full flex items-center gap-2"
                  onClick={() => {
                    console.log('Starting session:', id);
                    handleStatusUpdate('ongoing');
                  }}
                >
                  <Play className="w-4 h-4" />
                  Start Session
                </Button>
              )}
              
              {session.status === 'ongoing' && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={() => router.push(`/sessions/${id}/attendance`)}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Attendance
                  </Button>
                  
                  <Button 
                    className="w-full flex items-center gap-2"
                    onClick={() => handleStatusUpdate('completed')}
                  >
                    <Pause className="w-4 h-4" />
                    Complete Session
                  </Button>
                </>
              )}
              
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2"
                onClick={() => {
                  console.log('Opening photo modal');
                  setShowPhotoModal(true);
                }}
              >
                <Camera className="w-4 h-4" />
                Upload Photos
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/sessions/${id}/report`)}
              >
                Session Report
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2"
                onClick={() => router.push(`/sessions/${id}/register`)}
              >
                <Users className="w-4 h-4" />
                Register Children
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">
                  {session.scheduledStartTime && session.scheduledEndTime ? 
                    `${new Date(session.scheduledStartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(session.scheduledEndTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 
                    'Not specified'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Participants</span>
                <span className="font-medium">{session.maxParticipants}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Present</span>
                <span className="font-medium text-green-600">
                  {attendance.filter(a => a.present === true).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Absent</span>
                <span className="font-medium text-red-600">
                  {attendance.filter(a => a.present === false).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Not Marked</span>
                <span className="font-medium text-yellow-600">
                  {attendance.filter(a => a.present === undefined || a.present === null).length}
                </span>
              </div>
            </div>
          </Card>

          {session.coach && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Coach</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {session.coach.name?.[0] || 'C'}
                </div>
                <div>
                  <p className="font-medium">{typeof session.coach.name === 'string' ? session.coach.name : session.coach.name?.name || 'Coach'}</p>
                  <p className="text-sm text-gray-500">{session.coach.email}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Photo Upload Modal */}
      <Modal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} title="Upload Session Photos">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Select photos to upload</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Selected Files:</p>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{file.name}</span>
                  <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowPhotoModal(false)}>Cancel</Button>
            <Button onClick={handlePhotoUpload} disabled={uploading || selectedFiles.length === 0}>
              {uploading ? 'Uploading...' : 'Upload Photos'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Photo Lightbox Modal */}
      <Modal 
        isOpen={showLightbox} 
        onClose={() => setShowLightbox(false)} 
        title="Session Photo"
        size="large"
      >
        {selectedPhoto && (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || 'Session photo'}
                className="w-full max-h-96 object-contain rounded-lg"
              />
            </motion.div>
            {selectedPhoto.caption && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 font-medium">{selectedPhoto.caption}</p>
              </div>
            )}
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Uploaded: {new Date(selectedPhoto.uploadedAt).toLocaleDateString()}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(selectedPhoto.url, '_blank')}
              >
                View Full Size
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}