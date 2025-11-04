'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { reportAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { Download, FileText, Users, Calendar, Database } from 'lucide-react';

export default function DataExportPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState({});
  const [filters, setFilters] = useState({
    children: {
      programme: '',
      active: 'true',
      startDate: '',
      endDate: ''
    },
    sessions: {
      programme: '',
      coach: '',
      startDate: '',
      endDate: ''
    }
  });

  const handleExport = async (type, exportFilters = {}) => {
    try {
      setLoading(prev => ({ ...prev, [type]: true }));
      
      let response;
      let filename;
      
      switch (type) {
        case 'children':
          response = await reportAPI.exportChildren({ 
            format: 'csv', 
            ...exportFilters 
          });
          filename = `children-export-${Date.now()}.csv`;
          break;
          
        case 'sessions':
          response = await reportAPI.exportSessions({ 
            format: 'csv', 
            ...exportFilters 
          });
          filename = `sessions-export-${Date.now()}.csv`;
          break;
          
        case 'coaching':
          response = await reportAPI.exportCoaching({ 
            format: 'csv', 
            ...exportFilters 
          });
          filename = `coaching-data-export-${Date.now()}.csv`;
          break;
          
        default:
          throw new Error('Invalid export type');
      }
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const canExport = ['programme_director', 'programme_manager', 'reporting_team'].includes(user?.role);

  if (!canExport) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to export data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-600" />
          Data Export & Integration
        </h1>
        <p className="text-gray-600 mt-2">
          Export child and session data in CSV/Excel format for analysis and integration with other systems
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Children Data Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Children Data</h2>
                <p className="text-sm text-gray-500">Export comprehensive child profiles and statistics</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Programme</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.children.programme}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    children: { ...prev.children, programme: e.target.value }
                  }))}
                >
                  <option value="">All Programmes</option>
                  <option value="school">School Programme</option>
                  <option value="community">Community Programme</option>
                  <option value="workshop">Workshop Programme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.children.active}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    children: { ...prev.children, active: e.target.value }
                  }))}
                >
                  <option value="true">Active Only</option>
                  <option value="false">Inactive Only</option>
                  <option value="">All Children</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => handleExport('children', filters.children)}
                disabled={loading.children}
                className="w-full flex items-center justify-center gap-2"
              >
                {loading.children ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export Children Data (CSV)
              </Button>
              
              <div className="text-xs text-gray-500">
                Includes: Name, Age, Gender, Guardian Info, Address, School, Programme, Attendance Stats
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Sessions Data Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Sessions Data</h2>
                <p className="text-sm text-gray-500">Export session details and attendance records</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Programme</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={filters.sessions.programme}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    sessions: { ...prev.sessions, programme: e.target.value }
                  }))}
                >
                  <option value="">All Programmes</option>
                  <option value="school">School Programme</option>
                  <option value="community">Community Programme</option>
                  <option value="workshop">Workshop Programme</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Date"
                  type="date"
                  value={filters.sessions.startDate}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    sessions: { ...prev.sessions, startDate: e.target.value }
                  }))}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={filters.sessions.endDate}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    sessions: { ...prev.sessions, endDate: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => handleExport('sessions', filters.sessions)}
                disabled={loading.sessions}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {loading.sessions ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export Sessions Data (CSV)
              </Button>
              
              <div className="text-xs text-gray-500">
                Includes: Session Details, Coach, Attendance Records, Activities, Duration, Location
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Complete Coaching Data Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Complete Coaching Data</h2>
                <p className="text-sm text-gray-500">Export comprehensive coaching programme data including children, sessions, assessments, and home visits</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => handleExport('coaching')}
                disabled={loading.coaching}
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {loading.coaching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export All Data (CSV)
              </Button>
              
              <div className="md:col-span-2 text-sm text-gray-600">
                <strong>Includes:</strong> All children profiles, session records, attendance data, assessment results, home visit reports, coach workload, and programme analytics
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Integration Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration & API Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">CSV/Excel Compatibility</h4>
              <p className="text-sm text-gray-600">
                All exported files are in CSV format, compatible with Excel, Google Sheets, and other data analysis tools.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">API Integration</h4>
              <p className="text-sm text-gray-600">
                RESTful API endpoints available for real-time data integration with external systems and automated reporting.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}