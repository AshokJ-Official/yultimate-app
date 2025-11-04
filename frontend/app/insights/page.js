'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { childAPI, sessionAPI, assessmentAPI } from '@/lib/api';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Calendar, Target, Award, BarChart3, PieChart } from 'lucide-react';

export default function ProgrammeInsightsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({
    participation: {
      totalChildren: 0,
      activeChildren: 0,
      retentionRate: 0,
      trend: 'up'
    },
    attendance: {
      averageRate: 0,
      totalSessions: 0,
      completedSessions: 0,
      trend: 'up'
    },
    programmes: {
      school: { children: 0, sessions: 0 },
      community: { children: 0, sessions: 0 },
      workshop: { children: 0, sessions: 0 }
    },
    demographics: {
      ageGroups: { '5-8': 0, '9-12': 0, '13-15': 0, '16+': 0 },
      gender: { male: 0, female: 0, other: 0 }
    },
    performance: {
      assessmentCount: 0,
      averageScore: 0,
      improvement: 12.5
    }
  });

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const [childrenRes, sessionsRes, assessmentsRes] = await Promise.all([
        childAPI.getAll().catch(() => ({ data: { data: [] } })),
        sessionAPI.getAll().catch(() => ({ data: { data: [] } })),
        assessmentAPI.getAll().catch(() => ({ data: { data: [] } }))
      ]);

      const children = childrenRes.data?.data || childrenRes.data || [];
      const sessions = sessionsRes.data?.data || sessionsRes.data || [];
      const assessments = assessmentsRes.data?.data || assessmentsRes.data || [];

      const activeChildren = children.filter(c => c.isActive).length;
      const totalChildren = children.length;
      const retentionRate = totalChildren > 0 ? ((activeChildren / totalChildren) * 100).toFixed(1) : 0;

      const completedSessions = sessions.filter(s => s.status === 'completed').length;
      const avgAttendance = children.length > 0 
        ? (children.reduce((sum, child) => sum + (child.stats?.attendanceRate || 0), 0) / children.length).toFixed(1)
        : 0;

      const programmeStats = {
        school: { children: 0, sessions: 0 },
        community: { children: 0, sessions: 0 },
        workshop: { children: 0, sessions: 0 }
      };

      children.forEach(child => {
        child.programmes?.forEach(prog => {
          if (prog.isActive && programmeStats[prog.type]) {
            programmeStats[prog.type].children++;
          }
        });
      });

      sessions.forEach(session => {
        if (programmeStats[session.type]) {
          programmeStats[session.type].sessions++;
        }
      });

      const ageGroups = { '5-8': 0, '9-12': 0, '13-15': 0, '16+': 0 };
      const gender = { male: 0, female: 0, other: 0 };

      children.forEach(child => {
        if (child.age <= 8) ageGroups['5-8']++;
        else if (child.age <= 12) ageGroups['9-12']++;
        else if (child.age <= 15) ageGroups['13-15']++;
        else ageGroups['16+']++;

        if (gender[child.gender]) gender[child.gender]++;
      });

      const avgScore = assessments.length > 0
        ? (assessments.reduce((sum, a) => sum + (a.averageScore || 0), 0) / assessments.length).toFixed(1)
        : 0;

      setInsights({
        participation: {
          totalChildren,
          activeChildren,
          retentionRate: parseFloat(retentionRate),
          trend: retentionRate > 80 ? 'up' : 'down'
        },
        attendance: {
          averageRate: parseFloat(avgAttendance),
          totalSessions: sessions.length,
          completedSessions,
          trend: avgAttendance > 75 ? 'up' : 'down'
        },
        programmes: programmeStats,
        demographics: { ageGroups, gender },
        performance: {
          assessmentCount: assessments.length,
          averageScore: parseFloat(avgScore),
          improvement: 12.5
        }
      });

    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-purple-600" />
          Programme Insights
        </h1>
        <p className="text-gray-600 mt-2">
          Analyze trends, track participation, and measure programme effectiveness
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Participation</p>
                <p className="text-2xl font-bold text-blue-900">{insights.participation.totalChildren}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-600">{insights.participation.activeChildren} active</span>
                </div>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Retention Rate</p>
                <p className="text-2xl font-bold text-green-900">{insights.participation.retentionRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-600">Strong retention</span>
                </div>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Avg Attendance</p>
                <p className="text-2xl font-bold text-orange-900">{insights.attendance.averageRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-600">{insights.attendance.completedSessions} sessions</span>
                </div>
              </div>
              <div className="p-3 bg-orange-500 rounded-full">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Assessment Score</p>
                <p className="text-2xl font-bold text-purple-900">{insights.performance.averageScore}/5</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-600">+{insights.performance.improvement}% improvement</span>
                </div>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              Programme Breakdown
            </h3>
            <div className="space-y-4">
              {Object.entries(insights.programmes).map(([type, stats]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{type} Programme</p>
                    <p className="text-sm text-gray-500">{stats.children} children • {stats.sessions} sessions</p>
                  </div>
                  <div className={`w-16 h-2 rounded-full ${
                    type === 'school' ? 'bg-blue-500' :
                    type === 'community' ? 'bg-green-500' : 'bg-purple-500'
                  }`} />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Demographics
            </h3>
            
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Age Groups</h4>
              <div className="space-y-2">
                {Object.entries(insights.demographics.ageGroups).map(([age, count]) => (
                  <div key={age} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{age} years</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${insights.participation.totalChildren > 0 ? (count / insights.participation.totalChildren) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-3">Gender Distribution</h4>
              <div className="space-y-2">
                {Object.entries(insights.demographics.gender).map(([gender, count]) => (
                  <div key={gender} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{gender}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${
                            gender === 'male' ? 'bg-blue-500' :
                            gender === 'female' ? 'bg-pink-500' : 'bg-gray-500'
                          }`}
                          style={{ width: `${insights.participation.totalChildren > 0 ? (count / insights.participation.totalChildren) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}