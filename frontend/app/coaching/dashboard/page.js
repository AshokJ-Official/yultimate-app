'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  Home, 
  Target, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  Zap,
  BookOpen,
  Heart,
  Award
} from 'lucide-react'
import Link from 'next/link'

export default function CoachingDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalChildren: 0,
    activeSessions: 0,
    pendingVisits: 0,
    completedAssessments: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Mock data - replace with actual API calls
    setStats({
      totalChildren: 45,
      activeSessions: 8,
      pendingVisits: 3,
      completedAssessments: 12
    })

    setRecentActivity([
      { id: 1, type: 'session', title: 'Morning Session completed', time: '2 hours ago', createdAt: new Date() },
      { id: 2, type: 'assessment', title: 'LSAS assessment for John Doe', time: '4 hours ago', createdAt: new Date() },
      { id: 3, type: 'visit', title: 'Home visit scheduled', time: '1 day ago', createdAt: new Date() }
    ])

    setUpcomingSessions([
      { id: 1, title: 'Morning Skills Session', time: '10:00 AM', participants: 12 },
      { id: 2, title: 'Afternoon Training', time: '2:00 PM', participants: 8 },
      { id: 3, title: 'Evening Practice', time: '5:00 PM', participants: 15 }
    ])
  }, [])

  const quickActions = [
    { title: 'Register Child', description: 'Add a new child to program', href: '/children', icon: Users, color: 'from-pink-400 to-rose-500' },
    { title: 'Create Session', description: 'Schedule a coaching session', href: '/sessions', icon: Calendar, color: 'from-blue-400 to-indigo-500' },
    { title: 'Schedule Visit', description: 'Plan a home visit', href: '/visits', icon: Home, color: 'from-purple-400 to-pink-500' },
    { title: 'New Assessment', description: 'Conduct LSAS assessment', href: '/assessments', icon: Target, color: 'from-emerald-400 to-teal-500' },
    { title: 'View Reports', description: 'Check progress reports', href: '/reports', icon: BookOpen, color: 'from-orange-400 to-red-500' },
    { title: 'Export Data', description: 'Download program data', href: '/export', icon: TrendingUp, color: 'from-indigo-400 to-purple-500' }
  ]

  const dashboardCards = [
    {
      name: 'Active Children',
      value: loading ? '...' : stats.totalChildren,
      icon: Users,
      color: 'from-pink-400 to-rose-500',
      change: 'Active'
    },
    {
      name: 'Total Sessions',
      value: loading ? '...' : stats.activeSessions,
      icon: Calendar,
      color: 'from-blue-400 to-indigo-500',
      change: 'This week'
    },
    {
      name: 'Pending Visits',
      value: loading ? '...' : stats.pendingVisits,
      icon: Home,
      color: 'from-purple-400 to-pink-500',
      change: 'Scheduled'
    },
    {
      name: 'Assessments',
      value: loading ? '...' : stats.completedAssessments,
      icon: Target,
      color: 'from-emerald-400 to-teal-500',
      change: 'Completed'
    }
  ]

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {user?.name}! 🌟
          </h1>
          <p className="text-xl opacity-90 mb-6">
            Let's continue making a difference in children's lives!
          </p>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm">Real-time updates active</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm capitalize">{user?.role?.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {dashboardCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                {stat.change && <p className="text-sm text-emerald-600 mt-1">{stat.change}</p>}
              </div>
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <Link key={action.title} href={action.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer group"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          <Link href="/sessions">
            <button className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, i) => (
              <div key={activity.id || i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  {activity.type === 'session' && <Calendar className="w-5 h-5 text-white" />}
                  {activity.type === 'assessment' && <Target className="w-5 h-5 text-white" />}
                  {activity.type === 'visit' && <Home className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}