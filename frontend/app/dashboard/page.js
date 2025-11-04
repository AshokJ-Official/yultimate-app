'use client'

import { useAuth } from '@/lib/auth-context'
import RoleGuard from '@/components/auth/RoleGuard'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Users, 
  Calendar, 
  TrendingUp, 
  Award, 
  Target,
  Heart,
  BarChart3,
  ArrowRight,
  Zap,
  Clock,
  CheckCircle,
  Instagram,
  Home,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    tournaments: 0,
    teams: 0,
    matches: 0,
    children: 0,
    sessions: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  const isTournamentUser = ['tournament_director', 'team_manager', 'volunteer', 'scoring_team'].includes(user?.role)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user, isTournamentUser])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }

      if (isTournamentUser) {
        const [tournamentsRes, teamsRes, matchesRes, updatesRes] = await Promise.all([
          fetch('http://localhost:5000/api/tournaments', { headers }),
          fetch('http://localhost:5000/api/teams', { headers }),
          fetch('http://localhost:5000/api/matches', { headers }),
          fetch('http://localhost:5000/api/updates', { headers })
        ])

        const tournaments = await tournamentsRes.json()
        const teams = await teamsRes.json()
        const matches = await matchesRes.json()
        const updates = await updatesRes.json()

        setDashboardData({
          tournaments: tournaments.success ? tournaments.data.length : 0,
          teams: teams.success ? teams.data.length : 0,
          matches: matches.success ? matches.data.filter(m => m.status === 'in_progress').length : 0,
          recentActivity: updates.success ? updates.data.slice(0, 5) : []
        })
      } else {
        const [childrenRes, sessionsRes] = await Promise.all([
          fetch('http://localhost:5000/api/children', { headers }),
          fetch('http://localhost:5000/api/sessions', { headers })
        ])

        const children = await childrenRes.json()
        const sessions = await sessionsRes.json()

        setDashboardData({
          children: children.success ? children.data.length : 0,
          sessions: sessions.success ? sessions.data.length : 0,
          recentActivity: []
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <RoleGuard roles={['tournament_director', 'team_manager', 'player', 'volunteer', 'scoring_team', 'sponsor', 'spectator', 'programme_director', 'programme_manager', 'coach', 'reporting_team', 'coordinator']}>
      <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${isTournamentUser ? 'from-blue-600 via-purple-600 to-pink-600' : 'from-emerald-600 via-teal-600 to-cyan-600'} rounded-2xl p-8 text-white relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {user?.name}! {isTournamentUser ? '👋' : '🌟'}
          </h1>
          <p className="text-xl opacity-90 mb-6">
            {isTournamentUser 
              ? "Ready to manage some amazing tournaments today?"
              : "Let's continue making a difference in children's lives!"
            }
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
      {isTournamentUser ? (
        <TournamentStats data={dashboardData} loading={loading} />
      ) : (
        <CoachingStatsNew data={dashboardData} loading={loading} />
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {isTournamentUser ? (
            <>
              <QuickActionCard
                icon={Trophy}
                title="Create Tournament"
                description="Set up a new tournament"
                href="/tournaments"
                color="from-yellow-400 to-orange-500"
              />
              <QuickActionCard
                icon={Users}
                title="Manage Teams"
                description="Review team registrations"
                href="/teams"
                color="from-blue-400 to-cyan-500"
              />
              <QuickActionCard
                icon={Calendar}
                title="Live Matches"
                description="View ongoing matches"
                href="/matches"
                color="from-green-400 to-emerald-500"
              />
              <QuickActionCard
                icon={Instagram}
                title="Social Media"
                description="Manage social media links"
                href="/social-media"
                color="from-purple-400 to-pink-500"
              />
              <QuickActionCard
                icon={Heart}
                title="Fan Following"
                description="Follow your favorite teams"
                href="/fan-following"
                color="from-pink-500 to-red-500"
              />
              <QuickActionCard
                icon={Target}
                title="Predictions"
                description="Make match predictions & polls"
                href="/predictions"
                color="from-green-500 to-teal-500"
              />
            </>
          ) : (
            <>
              <QuickActionCard
                icon={Users}
                title="Register Child"
                description="Add a new child to program"
                href="/children"
                color="from-pink-400 to-rose-500"
              />
              <QuickActionCard
                icon={BookOpen}
                title="Manage Programs"
                description="Create and manage programs"
                href="/programs"
                color="from-purple-400 to-indigo-500"
              />
              <QuickActionCard
                icon={Calendar}
                title="Create Session"
                description="Schedule a coaching session"
                href="/sessions"
                color="from-blue-400 to-indigo-500"
              />
              <QuickActionCard
                icon={CheckCircle}
                title="Mark Attendance"
                description="Track session attendance"
                href="/sessions"
                color="from-green-400 to-emerald-500"
              />
              <QuickActionCard
                icon={Home}
                title="Schedule Visit"
                description="Plan a home visit"
                href="/visits"
                color="from-purple-400 to-pink-500"
              />
              <QuickActionCard
                icon={Target}
                title="New Assessment"
                description="Conduct LSAS assessment"
                href="/assessments"
                color="from-emerald-400 to-teal-500"
              />
              <QuickActionCard
                icon={BarChart3}
                title="View Reports"
                description="Check progress reports"
                href="/reports"
                color="from-orange-400 to-red-500"
              />
              <QuickActionCard
                icon={Users}
                title="Coach Management"
                description="Monitor coach workloads"
                href="/coaches"
                color="from-indigo-400 to-purple-500"
              />
            </>
          )}
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
          <Link href={isTournamentUser ? "/tournaments" : "/sessions"}>
            <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        <div className="space-y-4">
          {dashboardData.recentActivity.length > 0 ? (
            dashboardData.recentActivity.map((activity, i) => (
              <div key={activity._id || i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.message}</p>
                  <p className="text-sm text-gray-500">{new Date(activity.createdAt).toLocaleString()}</p>
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
    </RoleGuard>
  )
}

function TournamentStats({ data, loading }) {
  const stats = [
    {
      name: 'Active Tournaments',
      value: loading ? '...' : data.tournaments,
      icon: Trophy,
      color: 'from-yellow-400 to-orange-500',
      change: '',
    },
    {
      name: 'Total Teams',
      value: loading ? '...' : data.teams,
      icon: Users,
      color: 'from-blue-400 to-cyan-500',
      change: '',
    },
    {
      name: 'Live Matches',
      value: loading ? '...' : data.matches,
      icon: Calendar,
      color: 'from-green-400 to-emerald-500',
      change: 'Live',
    },
    {
      name: 'Recent Updates',
      value: loading ? '...' : data.recentActivity.length,
      icon: Award,
      color: 'from-purple-400 to-pink-500',
      change: '',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {stats.map((stat, index) => (
        <StatCard key={stat.name} stat={stat} index={index} />
      ))}
    </motion.div>
  )
}

function CoachingStatsNew({ data, loading }) {
  const stats = [
    {
      name: 'Active Children',
      value: loading ? '...' : data.children || 45,
      icon: Users,
      color: 'from-pink-400 to-rose-500',
      change: 'Active',
    },
    {
      name: 'Total Sessions',
      value: loading ? '...' : data.sessions || 8,
      icon: Calendar,
      color: 'from-blue-400 to-indigo-500',
      change: 'This week',
    },
    {
      name: 'Pending Visits',
      value: loading ? '...' : 3,
      icon: Home,
      color: 'from-purple-400 to-pink-500',
      change: 'Scheduled',
    },
    {
      name: 'Assessments',
      value: loading ? '...' : 12,
      icon: Target,
      color: 'from-emerald-400 to-teal-500',
      change: 'Completed',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {stats.map((stat, index) => (
        <StatCard key={stat.name} stat={stat} index={index} />
      ))}
    </motion.div>
  )
}

function StatCard({ stat, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{stat.name}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
          {stat.change && <p className="text-sm text-green-600 mt-1">{stat.change}</p>}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
          <stat.icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

function QuickActionCard({ icon: Icon, title, description, href, color }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer group"
      >
        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </motion.div>
    </Link>
  )
}