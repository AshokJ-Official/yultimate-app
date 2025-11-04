'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { childAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { Plus, User, Calendar, MapPin, Phone, Upload } from 'lucide-react';

export default function ChildrenPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    programme: '',
    medicalInfo: ''
  });
  const [transferData, setTransferData] = useState({
    newProgramme: '',
    reason: ''
  });
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [bulkUploadResults, setBulkUploadResults] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      console.log('Fetching children from API...');
      const response = await childAPI.getAll();
      console.log('API Response:', response.data);
      setChildren(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching children:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await childAPI.create(formData);
      setShowRegisterModal(false);
      setFormData({
        name: '',
        age: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        guardianName: '',
        guardianPhone: '',
        guardianEmail: '',
        programme: '',
        medicalInfo: ''
      });
      fetchChildren();
    } catch (error) {
      console.error('Error registering child:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      await childAPI.transfer(selectedChild._id, transferData);
      setShowTransferModal(false);
      setSelectedChild(null);
      setTransferData({ newProgramme: '', reason: '' });
      fetchChildren();
    } catch (error) {
      console.error('Error transferring child:', error);
    }
  };

  const openTransferModal = (child) => {
    setSelectedChild(child);
    setShowTransferModal(true);
  };

  const canRegisterChild = ['programme_director', 'programme_manager', 'coach'].includes(user?.role);
  const canTransferChild = ['programme_director', 'programme_manager'].includes(user?.role);

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkUploadFile) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', bulkUploadFile);

    try {
      setUploadProgress(10);
      const response = await childAPI.bulkUpload(formData);
      setUploadProgress(100);
      setBulkUploadResults(response.data.data);
      setBulkUploadFile(null);
      fetchChildren();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + (error.response?.data?.message || error.message));
      setUploadProgress(0);
    }
  };

  const downloadTemplate = () => {
    const template = [
      ['Name', 'Age', 'Gender', 'Date of Birth (YYYY-MM-DD)', 'Address', 'Guardian Name', 'Guardian Phone', 'Guardian Email', 'Programme', 'Medical Info'],
      ['John Doe', '10', 'male', '2014-05-15', '123 Main St, City', 'Jane Doe', '+1234567890', 'jane@email.com', 'school', 'No allergies'],
      ['Mary Smith', '12', 'female', '2012-08-20', '456 Oak Ave, Town', 'Bob Smith', '+0987654321', 'bob@email.com', 'community', 'Asthma medication']
    ];
    
    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'children_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
          <h1 className="text-3xl font-bold text-gray-900">Children</h1>
          <p className="text-gray-600 mt-2">Manage child profiles and programme participation</p>
        </div>
        <div className="flex gap-3">
          {canRegisterChild && (
            <>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100"
                onClick={() => setShowBulkUploadModal(true)}
              >
                <Upload className="w-4 h-4" />
                📊 Bulk Upload
              </Button>
              <Button 
                onClick={() => setShowRegisterModal(true)} 
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                <Plus className="w-4 h-4" />
                👶 Register Child
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Children</p>
              <p className="text-2xl font-bold text-blue-900">{children.length}</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Active Programs</p>
              <p className="text-2xl font-bold text-green-900">{new Set(children.map(c => c.programme).filter(Boolean)).size}</p>
            </div>
            <div className="p-3 bg-green-500 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Age Range</p>
              <p className="text-2xl font-bold text-purple-900">
                {children.length > 0 ? `${Math.min(...children.map(c => c.age || 0))}-${Math.max(...children.map(c => c.age || 0))}` : '0-0'}
              </p>
            </div>
            <div className="p-3 bg-purple-500 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">This Month</p>
              <p className="text-2xl font-bold text-orange-900">
                {children.filter(c => new Date(c.createdAt).getMonth() === new Date().getMonth()).length}
              </p>
            </div>
            <div className="p-3 bg-orange-500 rounded-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child, index) => (
          <motion.div
            key={child._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {child.name ? child.name.split(' ').map(n => n[0]).join('').substring(0, 2) : '👶'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {child.name || 'Unknown Child'}
                      </h3>
                      <p className="text-sm text-indigo-600 font-medium">🎂 Age {child.age || 'N/A'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    child.isActive !== false ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' :
                    'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                  }`}>
                    {child.isActive !== false ? '✅ Active' : '⏸️ Inactive'}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                    <div className="p-1 bg-blue-500 rounded">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-blue-800">
                      📚 {child.programme || child.programmes?.[0]?.type || 'No programme'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                    <div className="p-1 bg-green-500 rounded">
                      <Calendar className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-green-800">
                      📅 {child.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString() : 'No date'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                    <div className="p-1 bg-purple-500 rounded">
                      <MapPin className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-purple-800 truncate">
                      🏠 {child.address || 'No address'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                    <div className="p-1 bg-orange-500 rounded">
                      <Phone className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-orange-800">
                      📞 {child.guardianPhone || 'No phone'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 font-medium"
                    onClick={() => window.location.href = `/children/${child._id}`}
                  >
                    👁️ View Profile
                  </Button>
                  {canTransferChild && (
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-medium shadow-md"
                      onClick={() => openTransferModal(child)}
                    >
                      🔄 Transfer
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="Register Child">
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <Input
              label="Age"
              type="number"
              min="5"
              max="18"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || ''})}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Guardian Name"
              value={formData.guardianName}
              onChange={(e) => setFormData({...formData, guardianName: e.target.value})}
              required
            />
            <Input
              label="Guardian Phone"
              value={formData.guardianPhone}
              onChange={(e) => setFormData({...formData, guardianPhone: e.target.value})}
              required
            />
          </div>
          <Input
            label="Guardian Email"
            type="email"
            value={formData.guardianEmail}
            onChange={(e) => setFormData({...formData, guardianEmail: e.target.value})}
            required
          />
          <Input
            label="Programme"
            value={formData.programme}
            onChange={(e) => setFormData({...formData, programme: e.target.value})}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medical Information</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              value={formData.medicalInfo}
              onChange={(e) => setFormData({...formData, medicalInfo: e.target.value})}
              placeholder="Any medical conditions, allergies, or special needs..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowRegisterModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Register Child</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="Transfer Child">
        {selectedChild && (
          <form onSubmit={handleTransfer} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">
                Transfer {selectedChild.name}
              </h3>
              <p className="text-sm text-gray-500">Current Programme: {selectedChild.programme || selectedChild.programmes?.[0]?.type || 'No programme'}</p>
            </div>
            <Input
              label="New Programme"
              value={transferData.newProgramme}
              onChange={(e) => setTransferData({...transferData, newProgramme: e.target.value})}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Transfer</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                value={transferData.reason}
                onChange={(e) => setTransferData({...transferData, reason: e.target.value})}
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowTransferModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Transfer Child</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal isOpen={showBulkUploadModal} onClose={() => setShowBulkUploadModal(false)} title="📊 Bulk Upload Children">
        <div className="space-y-6">
          {!bulkUploadResults ? (
            <form onSubmit={handleBulkUpload} className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Upload Instructions</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>• Upload a CSV or Excel file with children data</p>
                  <p>• Maximum 100 children per upload</p>
                  <p>• Required fields: Name, Age, Gender, Guardian Name, Guardian Phone</p>
                  <p>• Download the template below for correct format</p>
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={downloadTemplate}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100"
                >
                  📥 Download Template
                </Button>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                <label className="block text-sm font-medium text-purple-900 mb-3">📁 Select File</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-purple-500" />
                      <p className="mb-2 text-sm text-purple-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-purple-500">CSV or Excel files only</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => setBulkUploadFile(e.target.files[0])}
                      required
                    />
                  </label>
                </div>
                {bulkUploadFile && (
                  <p className="mt-2 text-sm text-purple-700 font-medium">
                    📄 Selected: {bulkUploadFile.name}
                  </p>
                )}
              </div>

              {uploadProgress > 0 && (
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowBulkUploadModal(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!bulkUploadFile || uploadProgress > 0}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {uploadProgress > 0 ? '⏳ Uploading...' : '📤 Upload Children'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">📊 Upload Results</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{bulkUploadResults.successful?.length || 0}</p>
                    <p className="text-sm text-green-800">✅ Successful</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{bulkUploadResults.failed?.length || 0}</p>
                    <p className="text-sm text-red-800">❌ Failed</p>
                  </div>
                </div>
              </div>

              {bulkUploadResults.failed && bulkUploadResults.failed.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-900 mb-2">❌ Failed Uploads:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {bulkUploadResults.failed.map((item, index) => (
                      <p key={index} className="text-sm text-red-700">
                        • {item.name}: {item.error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setBulkUploadResults(null);
                    setUploadProgress(0);
                  }}
                >
                  📤 Upload More
                </Button>
                <Button 
                  onClick={() => {
                    setShowBulkUploadModal(false);
                    setBulkUploadResults(null);
                    setUploadProgress(0);
                  }}
                  className="flex-1"
                >
                  ✅ Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}