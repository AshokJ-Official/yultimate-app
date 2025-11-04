'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { matchAPI, spiritAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ArrowLeft, Download, FileText, Calendar } from 'lucide-react';

export default function MatchReportPage() {
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
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    const teamAName = match.teamA?.name || match.team1?.name;
    const teamBName = match.teamB?.name || match.team2?.name;
    const teamAScore = match.score?.teamA || match.team1Score || 0;
    const teamBScore = match.score?.teamB || match.team2Score || 0;
    
    const reportContent = `
MATCH REPORT
============

Tournament: ${match.tournament?.title || match.tournament?.name}
Date: ${new Date(match.scheduledTime).toLocaleDateString()}
Time: ${new Date(match.scheduledTime).toLocaleTimeString()}
Field: ${match.field}

TEAMS
-----
${teamAName}: ${teamAScore}
${teamBName}: ${teamBScore}

RESULT
------
Winner: ${teamAScore > teamBScore ? teamAName : teamBScore > teamAScore ? teamBName : 'Draw'}
Status: ${match.status}

SPIRIT SCORES
-------------
${spiritScores.length > 0 ? spiritScores.map(score => 
  `Rules Knowledge: ${score.rulesKnowledge}/4
Fair-Mindedness: ${score.fairMindedness}/4
Body Contact: ${score.foulsAndBodyContact}/4
Communication: ${score.communication}/4
Total: ${score.rulesKnowledge + score.fairMindedness + score.foulsAndBodyContact + score.communication}/16
${score.comments ? 'Comments: ' + score.comments : ''}
`).join('\n') : 'No spirit scores submitted'}

Generated on: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `match-report-${teamAName}-vs-${teamBName}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Match Report</h1>
          <p className="text-gray-600">{teamAName} vs {teamBName}</p>
        </div>
        <Button onClick={generateReport} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Report
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Match Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Final Score</h3>
              <div className="text-2xl font-bold">
                {teamAName} {teamAScore} - {teamBScore} {teamBName}
              </div>
              <p className="text-gray-600 mt-1">
                Winner: {teamAScore > teamBScore ? teamAName : teamBScore > teamAScore ? teamBName : 'Draw'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Match Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {new Date(match.scheduledTime).toLocaleString()}
                </div>
                <div>Field: {match.field}</div>
                <div>Status: {match.status}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Spirit Scores Summary</h2>
          {spiritScores.length > 0 ? (
            <div className="space-y-4">
              {spiritScores.map((score, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">{score.scores?.rulesKnowledge || 0}</div>
                      <div className="text-xs text-gray-600">Rules Knowledge</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">{score.scores?.fairMindedness || 0}</div>
                      <div className="text-xs text-gray-600">Fair-Mindedness</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">{score.scores?.foulsAndContact || 0}</div>
                      <div className="text-xs text-gray-600">Body Contact</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">{score.scores?.communication || 0}</div>
                      <div className="text-xs text-gray-600">Communication</div>
                    </div>
                  </div>
                  <div className="text-center pt-3 border-t">
                    <div className="text-3xl font-bold text-primary-600">
                      {score.totalScore || 0}/16
                    </div>
                    <div className="text-sm text-gray-600">Total Spirit Score</div>
                  </div>
                  {score.comments && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-sm font-medium text-gray-900">Comments:</div>
                      <div className="text-sm text-gray-600 mt-1">{score.comments}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No spirit scores have been submitted for this match.</p>
          )}
        </Card>
      </div>
    </div>
  );
}