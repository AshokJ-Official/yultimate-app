'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { programAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { ArrowLeft, Edit, Users, MapPin, Calendar, Clock, Target, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProgramDetailsPage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchProgram();
  }, [params.id]);

  const fetchProgram = async () => {
    try {
      const response = await programAPI.getById(params.id);
      setProgram(response.data?.data);
      setEditData(response.data?.data || {});
    } catch (error) {
      console.error('Error fetching program:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await programAPI.update(params.id, editData);
      setShowEditModal(false);
      fetchProgram();
      alert('Program updated successfully!');
    } catch (error) {
      console.error('Error updating program:', error);
      alert('Error updating program');
    }
  };

  const canEdit = ['programme_director', 'programme_manager'].includes(user?.role);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Program not found</h1>
        <Button onClick={() => router.push('/programs')} className="mt-4">
          Back to Programs
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/programs')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {program.name}
        </h1>
        {canEdit && (
          <Button
            onClick={() => setShowEditModal(true)}
            className="ml-auto flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <Edit className="w-4 h-4" />
            Edit Program
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Program Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Type</label>
                <p className="text-lg capitalize">{program.type} Program</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900">{program.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  program.status === 'active' ? 'bg-green-100 text-green-800' :
                  program.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {program.status?.toUpperCase()}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Schedule & Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">{program.location?.name}</p>
                    <p className="text-sm text-blue-700">{program.location?.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <Users className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Capacity</p>
                    <p className="text-sm text-green-700">{program.capacity?.min}-{program.capacity?.max} participants</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                  <Target className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-purple-900">Age Range</p>
                    <p className="text-sm text-purple-700">{program.ageRange?.min}-{program.ageRange?.max} years</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-900">Schedule</p>
                    <p className="text-sm text-orange-700">
                      {program.schedule?.days?.length || 0} days/week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Enrollment</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Current</span>
                <span className="font-medium">{program.enrollment?.currentCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Capacity</span>
                <span className="font-medium">{program.capacity?.max}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  style={{ width: `${((program.enrollment?.currentCount || 0) / (program.capacity?.max || 1)) * 100}%` }}
                />
              </div>
            </div>
          </Card>

          {program.fees?.amount > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Fees</h3>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  ${program.fees.amount}
                </p>
                <p className="text-sm text-gray-600 capitalize">
                  per {program.fees.frequency}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Program">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Program Name"
            value={editData.name || ''}
            onChange={(e) => setEditData({...editData, name: e.target.value})}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              value={editData.description || ''}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={editData.status || 'draft'}
              onChange={(e) => setEditData({...editData, status: e.target.value})}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">
              Update Program
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}