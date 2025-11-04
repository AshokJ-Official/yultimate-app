'use client';

import { useState } from 'react';
import { spiritAPI, matchAPI, teamAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function TestSpiritPage() {
  const { user } = useAuth();
  const [results, setResults] = useState({});
  const [teamId, setTeamId] = useState('');

  const testEligibility = async () => {
    if (!teamId) {
      alert('Please enter a team ID');
      return;
    }

    try {
      const response = await spiritAPI.canTeamPlayNext(teamId);
      setResults(prev => ({
        ...prev,
        eligibility: response.data
      }));
    } catch (error) {
      console.error('Error:', error);
      setResults(prev => ({
        ...prev,
        eligibility: { error: error.message }
      }));
    }
  };

  const getAllMatches = async () => {
    try {
      const response = await matchAPI.getAll();
      setResults(prev => ({
        ...prev,
        matches: response.data?.data || response.data || []
      }));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getAllTeams = async () => {
    try {
      const response = await teamAPI.getAll();
      setResults(prev => ({
        ...prev,
        teams: response.data?.data || response.data || []
      }));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Spirit Score Workflow Test</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Test Team Eligibility</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Enter Team ID"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="px-3 py-2 border rounded flex-1"
          />
          <Button onClick={testEligibility}>Check Eligibility</Button>
        </div>
        
        {results.eligibility && (
          <div>
            <h3 className="font-medium mb-2">Eligibility Result:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(results.eligibility, null, 2)}
            </pre>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Debug Data</h2>
          <div className="space-y-2">
            <Button onClick={getAllMatches} variant="outline" className="w-full">
              Get All Matches
            </Button>
            <Button onClick={getAllTeams} variant="outline" className="w-full">
              Get All Teams
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Results</h2>
          <div className="space-y-4">
            {results.matches && (
              <div>
                <h3 className="font-medium">Matches ({results.matches.length}):</h3>
                <div className="max-h-40 overflow-auto">
                  {results.matches.map(match => (
                    <div key={match._id} className="text-sm p-2 border-b">
                      {match.teamA?.name} vs {match.teamB?.name} - {match.status}
                      <br />
                      <span className="text-gray-500">ID: {match._id}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.teams && (
              <div>
                <h3 className="font-medium">Teams ({results.teams.length}):</h3>
                <div className="max-h-40 overflow-auto">
                  {results.teams.map(team => (
                    <div key={team._id} className="text-sm p-2 border-b">
                      {team.name}
                      <br />
                      <span className="text-gray-500">ID: {team._id}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}