'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { motion } from 'framer-motion'
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
  Globe
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90" />
        <div className="absolute inset-0 bg-black opacity-20" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-8"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="block">Y-Ultimate</span>
              <span className="block gradient-text bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Management Platform
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Empowering communities through Ultimate Frisbee. Manage tournaments, 
              track coaching programs, and build life skills that last forever.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/platform-selection">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-hover bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-hover bg-white/20 backdrop-blur-lg text-white px-8 py-4 rounded-full font-semibold text-lg border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl animate-pulse-slow" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-pink-400/20 rounded-full blur-xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-400/20 rounded-full blur-xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to
              <span className="gradient-text bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From tournament management to life skills coaching, our platform provides 
              all the tools you need to make a lasting impact.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Trophy,
                title: "Tournament Management",
                description: "Complete tournament lifecycle from registration to live scoring and spirit evaluation.",
                color: "from-yellow-400 to-orange-500",
                features: ["Live Scoring", "Team Registration", "Spirit Scoring", "Real-time Updates"]
              },
              {
                icon: Users,
                title: "Coaching Programs",
                description: "Track child development, manage sessions, and measure life skills progress.",
                color: "from-green-400 to-blue-500",
                features: ["Child Profiles", "Session Management", "LSAS Assessments", "Home Visits"]
              },
              {
                icon: Target,
                title: "Analytics & Reports",
                description: "Comprehensive insights and automated reporting for data-driven decisions.",
                color: "from-purple-400 to-pink-500",
                features: ["Impact Analytics", "Automated Reports", "Progress Tracking", "Data Export"]
              },
              {
                icon: Heart,
                title: "Life Skills Focus",
                description: "Measure and develop essential life skills through Ultimate Frisbee.",
                color: "from-red-400 to-pink-500",
                features: ["8 Core Skills", "Progress Tracking", "Baseline to Endline", "Impact Measurement"]
              },
              {
                icon: Zap,
                title: "Real-time Updates",
                description: "Stay connected with live scoring, attendance, and instant notifications.",
                color: "from-blue-400 to-cyan-500",
                features: ["Live Scoring", "Push Notifications", "Real-time Sync", "Offline Support"]
              },
              {
                icon: Globe,
                title: "Community Impact",
                description: "Scale your programs and measure community-wide impact effectively.",
                color: "from-indigo-400 to-purple-500",
                features: ["Multi-location", "Scalable", "Community Reports", "Stakeholder Dashboards"]
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-hover bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:border-gray-200"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Making a Real Impact
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Join thousands of coaches, players, and communities using Y-Ultimate 
              to transform lives through Ultimate Frisbee.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "10,000+", label: "Children Impacted" },
              { number: "500+", label: "Tournaments Managed" },
              { number: "50+", label: "Communities Served" },
              { number: "95%", label: "Satisfaction Rate" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-white/80 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Award className="w-16 h-16 text-blue-600 mx-auto mb-8" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Community?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join the Y-Ultimate platform today and start making a lasting impact 
              through Ultimate Frisbee and life skills development.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/platform-selection">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-hover bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Start Free Trial
                </motion.button>
              </Link>
              
              <Link href="/platform-selection">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-hover bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
                >
                  Sign In
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}