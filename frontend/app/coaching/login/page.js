'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, LogIn, Loader2, UserCheck, Users, Calendar, BookOpen, Home, Award, TrendingUp, Heart } from 'lucide-react'
import Link from 'next/link'

export default function CoachingLoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      router.push('/dashboard')
    }
  }, [router])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coaching/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('platform', 'coaching')
        router.push('/dashboard')
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
    
    setLoading(false)
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
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 via-cyan-800 via-blue-700 to-indigo-800" />
      
      {/* Floating Elements */}
      <FloatingElement delay={0}>
        <div className="top-20 left-20 w-4 h-4 bg-white/20 rounded-full" />
      </FloatingElement>
      <FloatingElement delay={1}>
        <UserCheck className="top-32 right-32 w-8 h-8 text-white/30" />
      </FloatingElement>
      <FloatingElement delay={2}>
        <Heart className="bottom-40 left-40 w-6 h-6 text-pink-300/40" />
      </FloatingElement>
      <FloatingElement delay={0.5}>
        <BookOpen className="top-1/2 right-20 w-10 h-10 text-white/25" />
      </FloatingElement>
      
      {/* Mouse Follower */}
      <motion.div
        className="fixed w-96 h-96 rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative z-10 min-h-screen flex">
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, type: "spring" }}
            className="max-w-md w-full space-y-8 backdrop-blur-xl bg-white/10 p-8 rounded-3xl border border-white/20 shadow-2xl"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full mb-6 shadow-lg"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <UserCheck className="w-10 h-10 text-white" />
                </motion.div>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent mb-2"
              >
                Welcome Coach!
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/80 text-lg"
              >
                Shape Lives Through Ultimate 🌟
              </motion.p>
            </div>

            <motion.form
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: 20 }}
                    className="bg-red-500/20 backdrop-blur border border-red-400/30 text-red-100 px-4 py-3 rounded-2xl flex items-center gap-3"
                  >
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="w-3 h-3 bg-red-400 rounded-full"
                    />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.div whileHover={{ scale: 1.02 }} whileFocus={{ scale: 1.02 }}>
                <label className="block text-sm font-medium text-white/90 mb-3">Email Address</label>
                <div className="relative group">
                  <motion.div 
                    className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Mail className="h-5 w-5 text-white/60 group-focus-within:text-white/90 transition-colors" />
                  </motion.div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent transition-all duration-300 text-white placeholder-white/50 hover:bg-white/15"
                    placeholder="your@email.com"
                  />
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileFocus={{ scale: 1.02 }}>
                <label className="block text-sm font-medium text-white/90 mb-3">Password</label>
                <div className="relative group">
                  <motion.div 
                    className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Lock className="h-5 w-5 text-white/60 group-focus-within:text-white/90 transition-colors" />
                  </motion.div>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-14 py-4 bg-white/10 backdrop-blur border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent transition-all duration-300 text-white placeholder-white/50 hover:bg-white/15"
                    placeholder="••••••••"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-white/60 hover:text-white/90" />
                    ) : (
                      <Eye className="h-5 w-5 text-white/60 hover:text-white/90" />
                    )}
                  </motion.button>
                </div>
              </motion.div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Entering Coaching Hub...
                  </>
                ) : (
                  <>
                    <LogIn className="w-6 h-6" />
                    Enter Coaching Hub
                    <UserCheck className="w-5 h-5" />
                  </>
                )}
              </button>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center"
              >
                <p className="text-white/70">
                  New to coaching platform?{' '}
                  <Link href="/coaching/register" className="font-bold text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text hover:from-emerald-300 hover:to-teal-300 transition-all">
                    Join the Mission! 🚀
                  </Link>
                </p>
                <p className="text-white/50 text-sm mt-2">
                  <Link href="/platform-selection" className="hover:text-white/70 transition-colors">
                    ← Back to Platform Selection
                  </Link>
                </p>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>

        <div className="hidden lg:flex flex-1 items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: 30 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-center text-white max-w-lg"
          >
            <motion.div 
              className="flex items-center justify-center gap-6 mb-8"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <UserCheck className="w-24 h-24 text-emerald-300" />
              <Heart className="w-16 h-16 text-pink-300" />
              <Award className="w-20 h-20 text-yellow-300" />
            </motion.div>
            
            <motion.h1 
              className="text-6xl font-black mb-6 bg-gradient-to-r from-white via-emerald-200 via-teal-200 to-cyan-200 bg-clip-text text-transparent"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Shape Tomorrow!
            </motion.h1>
            
            <motion.p 
              className="text-2xl mb-12 text-white/90"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Empower children, track progress, build life skills! 🌟
            </motion.p>
            
            <div className="grid grid-cols-3 gap-8">
              {[
                { num: "10K+", label: "Children", color: "text-emerald-300" },
                { num: "1K+", label: "Sessions", color: "text-teal-300" },
                { num: "50+", label: "Programs", color: "text-cyan-300" }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  className="text-center"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                >
                  <div className={`text-4xl font-bold ${stat.color}`}>{stat.num}</div>
                  <div className="text-white/80">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}