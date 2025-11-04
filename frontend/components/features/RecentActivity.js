import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Target, 
  CheckCircle, 
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react';

export function RecentActivity({ activities = [], userRole }) {
  const getActivityIcon = (type) => {
    const icons = {
      tournament_created: Trophy,
      team_registered: Users,
      match_scheduled: Calendar,
      match_completed: CheckCircle,
      child_registered: Target,
      session_created: Calendar,
      attendance_marked: CheckCircle,
      report_generated: FileText,
      assessment_completed: CheckCircle
    };
    return icons[type] || AlertCircle;
  };

  const getActivityColor = (type) => {
    const colors = {
      tournament_created: 'primary',
      team_registered: 'secondary',
      match_scheduled: 'info',
      match_completed: 'success',
      child_registered: 'primary',
      session_created: 'secondary',
      attendance_marked: 'success',
      report_generated: 'warning',
      assessment_completed: 'success'
    };
    return colors[type] || 'default';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Mock data if no activities provided
  const mockActivities = [
    {
      id: 1,
      type: 'tournament_created',
      title: 'New tournament created',
      description: 'Summer Ultimate Championship 2024',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      user: 'John Doe'
    },
    {
      id: 2,
      type: 'team_registered',
      title: 'Team registered',
      description: 'Thunder Bolts joined Summer Championship',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      user: 'Jane Smith'
    },
    {
      id: 3,
      type: 'session_created',
      title: 'Training session scheduled',
      description: 'Youth Development Program - Week 5',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      user: 'Mike Johnson'
    },
    {
      id: 4,
      type: 'attendance_marked',
      title: 'Attendance recorded',
      description: '18 children attended morning session',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      user: 'Sarah Wilson'
    }
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {displayActivities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const color = getActivityColor(activity.type);
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`p-2 rounded-full bg-${color}-100`}>
                <Icon className={`w-4 h-4 text-${color}-600`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate mb-1">
                  {activity.description}
                </p>
                {activity.user && (
                  <p className="text-xs text-gray-500">
                    by {activity.user}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {displayActivities.length === 0 && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recent activity</p>
        </div>
      )}
    </Card>
  );
}