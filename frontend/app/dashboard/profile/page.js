'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Lock, Save, Camera } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.updateProfile(profileData);
      updateUser(response.data.data);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully!');
    } catch (error) {
      alert('Error changing password: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{user?.name}</h3>
              <p className="text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              <Button variant="outline" className="mt-4 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Change Photo
              </Button>
            </div>
          </Card>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  icon={User}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  icon={Mail}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  icon={Phone}
                />
                <Input
                  label="Address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  icon={MapPin}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={4}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <Button type="submit" disabled={loading} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Card>

          {/* Change Password */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                icon={Lock}
                required
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  icon={Lock}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  icon={Lock}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} variant="outline">
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}