'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Users, 
  Target, 
  Heart, 
  Zap, 
  ArrowRight,
  Play,
  Star,
  Award,
  Globe,
  Sparkles,
  CheckCircle,
  UserCheck,
  Calendar,
  BarChart3,
  Home,
  BookOpen,
  Activity,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

export default function PlatformSelectionPage() {
  const [selectedPlatform, setSelectedPlatform] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const router = useRouter()

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const platforms = [
    {
      id: 'tournament',
      name: 'Tournament Platform',
      description: 'Manage Ultimate Frisbee tournaments, teams, and matches with real-time scoring and comprehensive analytics.',
      icon: Trophy,
      color: 'from-orange-400 via-red-500 to-pink-600',
      bgColor: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200 hover:border-orange-400',
      features: [
        { icon: Target, text: 'Tournament Management' },
        { icon: Users, text: 'Team Registration' },
        { icon: Activity, text: 'Live Scoring' },
        { icon: Heart, text: 'Spirit Scoring' },
        { icon: BarChart3, text: 'Real-time Analytics' },
        { icon: Globe, text: 'Multi-tournament Support' }
      ],
      stats: [
        { number: '500+', label: 'Tournaments' },
        { number: '10K+', label: 'Players' },
        { number: '200+', label: 'Communities' }
      ],
      loginPath: '/login'
    },
    {
      id: 'coaching',
      name: 'Coaching Platform',
      description: 'Manage coaching programs, track child development, and measure life skills progress through structured sessions.',
      icon: UserCheck,
      color: 'from-emerald-400 via-teal-500 to-cyan-600',
      bgColor: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200 hover:border-emerald-400',
      features: [
        { icon: Calendar, text: 'Session Management' },
        { icon: Users, text: 'Child Profiles' },
        { icon: Home, text: 'Home Visits' },
        { icon: BookOpen, text: 'LSAS Assessments' },
        { icon: TrendingUp, text: 'Progress Tracking' },
        { icon: Award, text: 'Impact Measurement' }
      ],
      stats: [
        { number: '10K+', label: 'Children' },
        { number: '1K+', label: 'Sessions' },
        { number: '50+', label: 'Programs' }
      ],
      loginPath: '/coaching/login'
    }
  ]

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform.id)
    // Store platform selection
    localStorage.setItem('selectedPlatform', platform.id)
    // Navigate to appropriate login page immediately
    router.push(platform.loginPath)
  }

  const FloatingElement = ({ children, delay = 0, duration = 3 }) => (
    <motion.div
      animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
      transition={{ repeat: Infinity, duration, delay }}
      className="absolute"
    >
      {children}
    </motion.div>
  )

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 via-violet-800 via-indigo-700 to-blue-800" />
      
      {/* Floating Elements */}
      <FloatingElement delay={0}>
        <div className="top-20 left-20 w-4 h-4 bg-white/20 rounded-full" />
      </FloatingElement>
      <FloatingElement delay={1}>
        <Trophy className="top-32 right-32 w-8 h-8 text-white/30" />
      </FloatingElement>
      <FloatingElement delay={2}>
        <Star className="bottom-40 left-40 w-6 h-6 text-yellow-300/40" />
      </FloatingElement>
      <FloatingElement delay={0.5}>
        <Target className="top-1/2 right-20 w-10 h-10 text-white/25" />
      </FloatingElement>
      
      {/* Mouse Follower */}
      <motion.div
        className="fixed w-96 h-96 rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center pt-12 pb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full mb-6 shadow-lg"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent mb-4"
          >
            Choose Your Platform
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/80 text-xl max-w-2xl mx-auto px-4"
          >
            Select the platform that best fits your needs and start making an impact! ✨
          </motion.p>
        </div>

        {/* Platform Cards */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-7xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {platforms.map((platform, index) => (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, x: index === 0 ? -50 : 50, rotateY: index === 0 ? -15 : 15 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  transition={{ delay: 0.5 + index * 0.2, duration: 0.8, type: "spring" }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`relative backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 ${
                    selectedPlatform === platform.id ? 'ring-4 ring-white/50 bg-white/20' : ''
                  }`}
                  onClick={() => handlePlatformSelect(platform)}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-10`} />
                  
                  {/* Content */}
                  <div className="relative p-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${platform.color} rounded-2xl shadow-lg`}>
                        <platform.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{platform.name}</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-green-300 text-sm font-medium">Active Platform</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-white/80 text-lg mb-8 leading-relaxed">
                      {platform.description}
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {platform.features.map((feature, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + idx * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur rounded-xl border border-white/20"
                        >
                          <feature.icon className="w-5 h-5 text-white/80" />
                          <span className="text-white/90 text-sm font-medium">{feature.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {platform.stats.map((stat, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1 + idx * 0.1 }}
                          className="text-center"
                        >
                          <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                          <div className="text-white/70 text-sm">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-full flex justify-center items-center gap-3 py-4 px-6 bg-gradient-to-r ${platform.color} text-white font-bold rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl`}
                    >
                      <span>Enter {platform.name}</span>
                      <ArrowRight className="w-5 h-5" />
                      <Sparkles className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Selection Indicator */}
                  <AnimatePresence>
                    {selectedPlatform === platform.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <CheckCircle className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center pb-8"
        >
          <p className="text-white/60 text-sm">
            Need help choosing? Contact our support team for guidance
          </p>
        </motion.div>
      </div>
    </div>
  )
}