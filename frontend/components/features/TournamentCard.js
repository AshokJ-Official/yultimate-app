import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Calendar, MapPin, Users, Trophy, DollarSign } from 'lucide-react';

export function TournamentCard({ tournament, onView, onEdit, onDelete, canEdit = false }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'info';
      case 'ongoing': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {tournament.bannerImage && (
          <div className="h-48 bg-gradient-to-r from-primary-400 to-secondary-400 relative overflow-hidden">
            <img 
              src={tournament.bannerImage} 
              alt={tournament.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20" />
            <div className="absolute top-4 right-4">
              <Badge variant={getStatusColor(tournament.status)} animate>
                {tournament.status}
              </Badge>
            </div>
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
              {tournament.name}
            </h3>
            {!tournament.bannerImage && (
              <Badge variant={getStatusColor(tournament.status)} animate>
                {tournament.status}
              </Badge>
            )}
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-3">{tournament.description}</p>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(tournament.startDate).toLocaleDateString()} - {' '}
                {new Date(tournament.endDate).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>{tournament.location}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{tournament.registeredTeams || 0}/{tournament.maxTeams} teams</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <DollarSign className="w-4 h-4" />
              <span>${tournament.entryFee} entry fee</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onView(tournament)}
            >
              View Details
            </Button>
            {canEdit && (
              <>
                <Button 
                  size="sm"
                  onClick={() => onEdit(tournament)}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(tournament)}
                  className="border-error-300 text-error-600 hover:bg-error-50"
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}