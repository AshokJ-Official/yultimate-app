import { useState, useEffect } from 'react';
import { spiritAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AlertTriangle, Clock, Star } from 'lucide-react';
import Button from './ui/Button';
import Modal from './ui/Modal';

export default function SpiritScoreAlert({ teamId, onSpiritSubmitted }) {
  const { user } = useAuth();
  const [eligibility, setEligibility] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('SpiritScoreAlert - teamId:', teamId, 'user role:', user?.role);
    if (teamId && ['team_manager', 'player'].includes(user?.role)) {
      checkEligibility();
    } else {
      setLoading(false);
    }
  }, [teamId, user]);

  const checkEligibility = async () => {
    try {
      console.log('Checking eligibility for team:', teamId);
      const response = await spiritAPI.canTeamPlayNext(teamId);
      console.log('Eligibility response:', response.data);
      setEligibility(response.data);
    } catch (error) {
      console.error('Error checking team eligibility:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!eligibility || eligibility.canPlay) {
    console.log('No alert needed - eligibility:', eligibility);
    return null;
  }

  console.log('Showing spirit score alert for', eligibility.pendingCount, 'pending scores');

  return (
    <>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-1">
              Spirit Scores Required
            </h3>
            <p className="text-sm text-red-700 mb-3">
              Your team must submit {eligibility.pendingCount} spirit score(s) before playing the next match.
            </p>
            <Button
              size="sm"
              onClick={() => setShowModal(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              View Pending Scores
            </Button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="Pending Spirit Scores"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-600">
            <Clock className="w-5 h-5" />
            <span className="font-medium">
              {eligibility.pendingCount} spirit score(s) pending submission
            </span>
          </div>
          
          <p className="text-gray-600 text-sm">
            You must submit spirit scores for the following completed matches before your team can play again:
          </p>

          <div className="space-y-3">
            {eligibility.pendingScores.map((pending, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      vs {pending.opponent}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(pending.scheduledTime).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowModal(false);
                      // Navigate to spirit score submission
                      window.location.href = `/spirit-scores?matchId=${pending.matchId}`;
                    }}
                    className="flex items-center gap-1"
                  >
                    <Star className="w-4 h-4" />
                    Submit
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Spirit scores help maintain fair play and sportsmanship. 
              Each category is rated 0-4 (2 is default) covering rules knowledge, fouls & contact, 
              fair-mindedness, positive attitude, and communication.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}