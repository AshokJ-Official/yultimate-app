import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Clock, Users, Trophy, Play, Pause, CheckCircle } from 'lucide-react';

export function MatchCard({ match, onScore, onView, canScore = false }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'live': return 'error';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'live': return <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-success-600" />;
      default: return null;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(match.status)}
              <Badge variant={getStatusColor(match.status)} animate>
                {match.status}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {match.team1Score || 0} - {match.team2Score || 0}
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {match.team1?.name?.substring(0, 2).toUpperCase()}
                </div>
                <span className="font-semibold text-gray-900">{match.team1?.name}</span>
              </div>
              <span className="text-sm text-gray-500 font-medium">VS</span>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">{match.team2?.name}</span>
                <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {match.team2?.name?.substring(0, 2).toUpperCase()}
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>{match.tournament?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{new Date(match.scheduledTime).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Field {match.field}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onView(match)}
            >
              View Details
            </Button>
            {canScore && match.status !== 'completed' && (
              <Button 
                size="sm" 
                onClick={() => onScore(match)}
                className="flex items-center gap-1"
              >
                {match.status === 'live' ? (
                  <>
                    <Pause className="w-3 h-3" />
                    Update Score
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    Start Match
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}