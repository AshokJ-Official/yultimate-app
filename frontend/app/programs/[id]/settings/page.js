'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { programAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { ArrowLeft, Save, Trash2, Users, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProgramSettingsPage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProgram();
  }, [params.id]);

  const fetchProgram = async () => {
    try {
      const response = await programAPI.getById(params.id);
      const programData = response.data?.data;
      setProgram(programData);
      setFormData(programData || {});
    } catch (error) {
      console.error('Error fetching program:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await programAPI.update(params.id, formData);
      alert('Program settings updated successfully!');
      fetchProgram();
    } catch (error) {
      console.error('Error updating program:', error);
      alert('Error updating program settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
      try {
        await programAPI.delete(params.id);
        alert('Program deleted successfully!');
        router.push('/programs');
      } catch (error) {
        console.error('Error deleting program:', error);
        alert('Error deleting program');
      }
    }
  };

  const canDelete = user?.role === 'programme_director';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
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
          ⚙️ Program Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            📝 Basic Information
          </h2>
          <div className="space-y-4">
            <Input
              label="Program Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.type || 'school'}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="school">🏫 School Program</option>
                <option value="community">🏠 Community Program</option>
                <option value="workshop">🔧 Workshop Program</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.status || 'draft'}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="draft">📝 Draft</option>
                <option value="active">✅ Active</option>
                <option value="paused">⏸️ Paused</option>
                <option value="completed">🏁 Completed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Capacity & Enrollment */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Capacity Management
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Capacity"
                type="number"
                value={formData.capacity?.min || 5}
                onChange={(e) => setFormData({
                  ...formData, 
                  capacity: {...formData.capacity, min: parseInt(e.target.value)}
                })}
              />
              <Input
                label="Max Capacity"
                type="number"
                value={formData.capacity?.max || 20}
                onChange={(e) => setFormData({
                  ...formData, 
                  capacity: {...formData.capacity, max: parseInt(e.target.value)}
                })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Age"
                type="number"
                value={formData.ageRange?.min || 5}
                onChange={(e) => setFormData({
                  ...formData, 
                  ageRange: {...formData.ageRange, min: parseInt(e.target.value)}
                })}
              />
              <Input
                label="Max Age"
                type="number"
                value={formData.ageRange?.max || 18}
                onChange={(e) => setFormData({
                  ...formData, 
                  ageRange: {...formData.ageRange, max: parseInt(e.target.value)}
                })}
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Current Enrollment:</strong> {program?.enrollment?.currentCount || 0} / {formData.capacity?.max || 0}
              </p>
            </div>
          </div>
        </Card>

        {/* Location Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">📍 Location Settings</h2>
          <div className="space-y-4">
            <Input
              label="Location Name"
              value={formData.location?.name || ''}
              onChange={(e) => setFormData({
                ...formData, 
                location: {...formData.location, name: e.target.value}
              })}
            />
            <Input
              label="Address"
              value={formData.location?.address || ''}
              onChange={(e) => setFormData({
                ...formData, 
                location: {...formData.location, address: e.target.value}
              })}
            />
          </div>
        </Card>

        {/* Fee Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">💰 Fee Settings</h2>
          <div className="space-y-4">
            <Input
              label="Fee Amount"
              type="number"
              value={formData.fees?.amount || 0}
              onChange={(e) => setFormData({
                ...formData, 
                fees: {...formData.fees, amount: parseFloat(e.target.value)}
              })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.fees?.frequency || 'monthly'}
                onChange={(e) => setFormData({
                  ...formData, 
                  fees: {...formData.fees, frequency: e.target.value}
                })}
              >
                <option value="one-time">One-time</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <div>
          {canDelete && (
            <Button
              onClick={handleDelete}
              variant="outline"
              className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete Program
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/programs/${params.id}`)}
          >
            View Details
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {!canDelete && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            Only Programme Directors can delete programs.
          </p>
        </div>
      )}
    </div>
  );
}