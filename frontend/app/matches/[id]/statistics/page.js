'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { matchAPI, spiritAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ArrowLeft, TrendingUp, Users, Star } from 'lucide-react';

export default function MatchStatisticsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [match, setMatch] = useState(null);
  const [spiritScores, setSpiritScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [matchRes, spiritRes] = await Promise.all([
        matchAPI.getById(id),
        spiritAPI.getByMatch(id)
      ]);
      
      setMatch(matchRes.data?.data || matchRes.data);
      setSpiritScores(spiritRes.data?.data || spiritRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty arrays on error
      setSpiritScores([]);
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

  if (!match) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Match Not Found</h2>
          <Button onClick={() => router.push('/matches')}>Back to Matches</Button>
        </div>
      </div>
    );
  }

  const teamAName = match.teamA?.name || match.team1?.name;
  const teamBName = match.teamB?.name || match.team2?.name;
  const teamAScore = match.score?.teamA || match.team1Score || 0;
  const teamBScore = match.score?.teamB || match.team2Score || 0;

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.push(`/matches/${id}`)} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Match
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Match Statistics</h1>
          <p className="text-gray-600">{teamAName} vs {teamBName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Score Summary
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">{teamAName}</span>
              <span className="text-2xl font-bold text-primary-600">{teamAScore}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">{teamBName}</span>
              <span className="text-2xl font-bold text-primary-600">{teamBScore}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Spirit Scores
          </h2>
          {spiritScores.length > 0 ? (
            <div className="space-y-4">
              {spiritScores.map((score, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Rules: {score.scores?.rulesKnowledge || 0}/4</div>
                    <div>Fair-Mindedness: {score.scores?.fairMindedness || 0}/4</div>
                    <div>Body Contact: {score.scores?.foulsAndContact || 0}/4</div>
                    <div>Communication: {score.scores?.communication || 0}/4</div>
                  </div>
                  <div className="mt-2 text-center">
                    <span className="font-bold text-primary-600">
                      Total: {score.totalScore || 0}/16
                    </span>
                  </div>
                  {score.comments && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Comments:</strong> {score.comments}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No spirit scores submitted yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}