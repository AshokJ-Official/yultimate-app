'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { tournamentAPI, teamAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Trophy, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export default function TournamentDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [teamData, setTeamData] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    homeCity: ''
  });
  const [visitorData, setVisitorData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    purpose: ''
  });

  useEffect(() => {
    if (id) {
      fetchTournament();
    }
  }, [id]);

  const fetchTournament = async () => {
    try {
      const [tournamentRes, teamsRes] = await Promise.all([
        tournamentAPI.getById(id),
        teamAPI.getByTournament(id)
      ]);
      
      const tournamentData = tournamentRes.data?.data || tournamentRes.data;
      const teamsData = teamsRes.data?.data || teamsRes.data || [];
      
      setTournament({
        ...tournamentData,
        registeredTeams: teamsData.length,
        teams: teamsData
      });
    } catch (error) {
      console.error('Error fetching tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamRegistration = async (e) => {
    e.preventDefault();
    try {
      await teamAPI.create({
        ...teamData,
        tournament: id
      });
      setShowRegisterModal(false);
      setTeamData({ name: '', contactEmail: '', contactPhone: '', homeCity: '' });
      fetchTournament(); // Refresh tournament data
      alert('Team registered successfully!');
    } catch (error) {
      console.error('Error registering team:', error);
      alert('Error registering team: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tournament Not Found</h2>
          <p className="text-gray-600 mb-4">The tournament you're looking for doesn't exist.</p>
          <Link href="/tournaments">
            <Button>Back to Tournaments</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 mb-4"
          onClick={() => {
            window.location.href = '/tournaments';
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tournaments
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl relative mb-8">
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-xl" />
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
              tournament.status === 'upcoming' ? 'bg-blue-500 text-white' :
              tournament.status === 'ongoing' ? 'bg-green-500 text-white' :
              'bg-gray-500 text-white'
            }`}>
              {tournament.status?.toUpperCase() || 'DRAFT'}
            </span>
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              {tournament.title || tournament.name}
            </h1>
            <p className="text-blue-100">{tournament.location}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed">
                {tournament.description || 'No description available'}
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tournament Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">
                      {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'TBD'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">
                      {tournament.endDate ? new Date(tournament.endDate).toLocaleDateString() : 'TBD'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Max Teams</p>
                    <p className="font-medium">{tournament.maxTeams || 'Unlimited'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Format</p>
                    <p className="font-medium capitalize">{tournament.format || 'Round Robin'}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Registered Teams</span>
                  <span className="font-semibold">{tournament.registeredTeams || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Matches</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fields</span>
                  <span className="font-semibold">{tournament.fields?.length || 0}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                {user?.role === 'volunteer' ? (
                  <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Access Restricted</h3>
                    <p className="text-red-700 mb-4">Tournament management features are only available to Tournament Directors.</p>
                    <p className="text-sm text-red-600">As a Volunteer, you can input live match scores and mark attendance during matches.</p>
                  </div>
                ) : (
                  <>
                    {user?.role === 'team_manager' ? (
                      <Button className="w-full" onClick={() => setShowRegisterModal(true)}>Register Team</Button>
                    ) : (
                      <Button className="w-full" disabled>Register Team (Team Manager Only)</Button>
                    )}
                    <Button variant="outline" className="w-full" onClick={() => setShowVisitorModal(true)}>Register as Visitor</Button>
                    {(user?.role === 'tournament_director' || user?.role === 'team_manager') && (
                      <Link href={`/tournaments/${id}/schedule-builder`}>
                        <Button variant="outline" className="w-full">Schedule Builder</Button>
                      </Link>
                    )}
                    <Link href={`/tournaments/${id}/schedule`}>
                      <Button variant="outline" className="w-full">View Schedule</Button>
                    </Link>
                    <Link href={`/tournaments/${id}/scores`}>
                      <Button variant="outline" className="w-full">View Scores</Button>
                    </Link>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Team Registration Modal */}
      <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="Register Team">
        <form onSubmit={handleTeamRegistration} className="space-y-4">
          <Input
            label="Team Name"
            value={teamData.name}
            onChange={(e) => setTeamData({...teamData, name: e.target.value})}
            required
          />
          <Input
            label="Contact Email"
            type="email"
            value={teamData.contactEmail}
            onChange={(e) => setTeamData({...teamData, contactEmail: e.target.value})}
            required
          />
          <Input
            label="Contact Phone"
            value={teamData.contactPhone}
            onChange={(e) => setTeamData({...teamData, contactPhone: e.target.value})}
            required
          />
          <Input
            label="Home City"
            value={teamData.homeCity}
            onChange={(e) => setTeamData({...teamData, homeCity: e.target.value})}
            required
          />
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowRegisterModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Register Team</Button>
          </div>
        </form>
      </Modal>

      {/* Visitor Registration Modal */}
      <Modal isOpen={showVisitorModal} onClose={() => setShowVisitorModal(false)} title="Register as Visitor">
        <form onSubmit={(e) => {
          e.preventDefault();
          alert('Visitor registration submitted successfully!');
          setShowVisitorModal(false);
          setVisitorData({ name: '', email: '', phone: '', organization: '', purpose: '' });
        }} className="space-y-4">
          <Input
            label="Full Name"
            value={visitorData.name}
            onChange={(e) => setVisitorData({...visitorData, name: e.target.value})}
            required
          />
          <Input
            label="Email"
            type="email"
            value={visitorData.email}
            onChange={(e) => setVisitorData({...visitorData, email: e.target.value})}
            required
          />
          <Input
            label="Phone"
            value={visitorData.phone}
            onChange={(e) => setVisitorData({...visitorData, phone: e.target.value})}
            required
          />
          <Input
            label="Organization"
            value={visitorData.organization}
            onChange={(e) => setVisitorData({...visitorData, organization: e.target.value})}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Visit</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={visitorData.purpose}
              onChange={(e) => setVisitorData({...visitorData, purpose: e.target.value})}
              required
            >
              <option value="">Select Purpose</option>
              <option value="spectator">Spectator</option>
              <option value="media">Media Coverage</option>
              <option value="sponsor">Sponsor Representative</option>
              <option value="official">Tournament Official</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowVisitorModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Register Visitor</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}