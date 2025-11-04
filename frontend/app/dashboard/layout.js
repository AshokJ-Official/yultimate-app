'use client'

import { useAuth } from '@/lib/auth-context'
import { useSocket } from '@/lib/socket-context'
import { motion } from 'framer-motion'
import Notifications from '@/components/Notifications'
import { 
  Trophy, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Menu,
  X,
  Home,
  Calendar,
  BarChart3,
  UserCheck,
  Award,
  Target,
  Heart,
  BookOpen,
  Camera,
  Instagram,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function DashboardLayout({ children }) {
  const { user, logout, loading } = useAuth()
  const { connected } = useSocket()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Only redirect if user is definitely not authenticated (not loading and no user)
    if (!loading && !user) {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/platform-selection')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    )
  }

  if (!user) {
    return null // Let useEffect handle the redirect
  }

  const tournamentNavigation = [
    { name: 'Overview', href: '/dashboard', icon: Home },
    { name: 'Tournaments', href: '/tournaments', icon: Trophy },
    { name: 'Teams', href: '/teams', icon: Users },
    { name: 'Matches', href: '/matches', icon: Calendar },
    { name: 'Leaderboard', href: '/leaderboard', icon: BarChart3 },
    { name: 'Spirit Scores', href: '/spirit-scores', icon: Award },
    { name: 'Spirit Dashboard', href: '/spirit-dashboard', icon: BarChart3 },
    { name: 'Spirit Leaderboard', href: '/spirit-leaderboard', icon: Trophy },
    { name: 'Live Updates', href: '/live-updates', icon: Bell },
    { name: 'Social Media', href: '/social-media', icon: Instagram },
    { name: 'Fan Following', href: '/fan-following', icon: Heart },
    { name: 'Predictions', href: '/predictions', icon: Target },
    { name: 'Media Gallery', href: '/media-gallery', icon: Camera },
    { name: 'Export Data', href: '/export', icon: Target },
    { name: 'Reports', href: '/reports', icon: BookOpen },
  ]

  const coachingNavigation = [
    { name: 'Overview', href: '/dashboard', icon: Home },
    { name: 'Children', href: '/children', icon: Users },
    { name: 'Programs', href: '/programs', icon: BookOpen },
    { name: 'Sessions', href: '/sessions', icon: Calendar },
    { name: 'Coaches', href: '/coaches', icon: UserCheck },
    { name: 'Home Visits', href: '/visits', icon: Heart },
    { name: 'Fan Following', href: '/fan-following', icon: Heart },
    { name: 'Assessments', href: '/assessments', icon: Target },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Programme Insights', href: '/insights', icon: TrendingUp },
    { name: 'Export Data', href: '/export', icon: Target },
  ]

  const navigation = ['tournament_director', 'team_manager', 'volunteer', 'scoring_team'].includes(user.role) 
    ? tournamentNavigation 
    : coachingNavigation

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="relative flex-1 flex flex-col max-w-xs w-full bg-white"
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={navigation} user={user} connected={connected} logout={logout} pathname={pathname} />
        </motion.div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <SidebarContent navigation={navigation} user={user} connected={connected} logout={logout} pathname={pathname} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent"
                    placeholder="Search..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              {/* Connection status */}
              <div className="flex items-center gap-2 mr-4">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm text-gray-500">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Notifications */}
              <Notifications />

              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 bg-gradient-to-r ${['tournament_director', 'team_manager', 'volunteer', 'scoring_team'].includes(user.role) ? 'from-blue-600 to-purple-600' : 'from-emerald-600 to-teal-600'} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ navigation, user, connected, logout, pathname }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${['tournament_director', 'team_manager', 'volunteer', 'scoring_team'].includes(user.role) ? 'from-blue-600 to-purple-600' : 'from-emerald-600 to-teal-600'} rounded-xl flex items-center justify-center`}>
              {['tournament_director', 'team_manager', 'volunteer', 'scoring_team'].includes(user.role) ? (
                <Trophy className="w-6 h-6 text-white" />
              ) : (
                <UserCheck className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Y-Ultimate</h1>
              <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${['tournament_director', 'team_manager', 'volunteer', 'scoring_team'].includes(user.role) ? 'from-blue-600 to-purple-600' : 'from-emerald-600 to-teal-600'} text-white shadow-lg`
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User section */}
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center w-full">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${['tournament_director', 'team_manager', 'volunteer', 'scoring_team'].includes(user.role) ? 'from-blue-600 to-purple-600' : 'from-emerald-600 to-teal-600'} rounded-full flex items-center justify-center`}>
                <span className="text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/profile">
              <button className="p-2 text-gray-400 hover:text-gray-500 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </Link>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}