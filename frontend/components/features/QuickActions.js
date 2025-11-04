import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Plus, Users, Calendar, FileText, Trophy, Target } from 'lucide-react';

export function QuickActions({ userRole, onAction }) {
  const tournamentActions = [
    { id: 'create-tournament', label: 'Create Tournament', icon: Trophy, color: 'primary' },
    { id: 'register-team', label: 'Register Team', icon: Users, color: 'secondary' },
    { id: 'schedule-match', label: 'Schedule Match', icon: Calendar, color: 'success' },
    { id: 'view-reports', label: 'View Reports', icon: FileText, color: 'warning' }
  ];

  const coachingActions = [
    { id: 'register-child', label: 'Register Child', icon: Target, color: 'primary' },
    { id: 'create-session', label: 'Create Session', icon: Calendar, color: 'secondary' },
    { id: 'mark-attendance', label: 'Mark Attendance', icon: Users, color: 'success' },
    { id: 'generate-report', label: 'Generate Report', icon: FileText, color: 'warning' }
  ];

  const getActionsForRole = () => {
    const tournamentRoles = ['tournament_director', 'team_manager', 'volunteer', 'scoring_team'];
    const coachingRoles = ['programme_director', 'programme_manager', 'coach', 'coordinator'];

    if (tournamentRoles.includes(userRole)) {
      return tournamentActions;
    } else if (coachingRoles.includes(userRole)) {
      return coachingActions;
    }
    return [];
  };

  const actions = getActionsForRole();

  if (actions.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
              onClick={() => onAction(action.id)}
            >
              <action.icon className={`w-6 h-6 text-${action.color}-600`} />
              <span className="text-sm font-medium text-center">{action.label}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}