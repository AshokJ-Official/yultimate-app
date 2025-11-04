export const USER_ROLES = {
  // Tournament roles
  TOURNAMENT_DIRECTOR: 'tournament_director',
  TEAM_MANAGER: 'team_manager',
  PLAYER: 'player',
  VOLUNTEER: 'volunteer',
  SCORING_TEAM: 'scoring_team',
  
  // Coaching roles
  PROGRAMME_DIRECTOR: 'programme_director',
  PROGRAMME_MANAGER: 'programme_manager',
  COACH: 'coach',
  COORDINATOR: 'coordinator',
  
  // General roles
  SPONSOR: 'sponsor',
  SPECTATOR: 'spectator',
  REPORTING_TEAM: 'reporting_team'
};

export const TOURNAMENT_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const TEAM_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const SESSION_STATUS = {
  SCHEDULED: 'scheduled',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused'
};

export const SPIRIT_CATEGORIES = [
  { key: 'rules_knowledge', label: 'Rules Knowledge & Use' },
  { key: 'fouls_body_contact', label: 'Fouls & Body Contact' },
  { key: 'fair_mindedness', label: 'Fair-Mindedness' },
  { key: 'positive_attitude', label: 'Positive Attitude & Self-Control' },
  { key: 'communication', label: 'Communication' }
];

export const NAVIGATION_ITEMS = {
  TOURNAMENT: [
    { label: 'Dashboard', href: '/dashboard', icon: 'Home' },
    { label: 'Tournaments', href: '/tournaments', icon: 'Trophy' },
    { label: 'Teams', href: '/teams', icon: 'Users' },
    { label: 'Matches', href: '/matches', icon: 'Calendar' },
    { label: 'Reports', href: '/reports', icon: 'FileText' }
  ],
  COACHING: [
    { label: 'Dashboard', href: '/dashboard', icon: 'Home' },
    { label: 'Children', href: '/children', icon: 'Target' },
    { label: 'Sessions', href: '/sessions', icon: 'Calendar' },
    { label: 'Reports', href: '/reports', icon: 'FileText' }
  ]
};

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  TOURNAMENTS: '/api/tournaments',
  TEAMS: '/api/teams',
  MATCHES: '/api/matches',
  CHILDREN: '/api/children',
  SESSIONS: '/api/sessions',
  REPORTS: '/api/reports'
};

export const SOCKET_EVENTS = {
  // Tournament events
  JOIN_TOURNAMENT: 'join-tournament',
  JOIN_MATCH: 'join-match',
  SCORE_UPDATE: 'score-update',
  MATCH_SCORE_UPDATED: 'match-score-updated',
  SPIRIT_SCORE_SUBMITTED: 'spirit-score-submitted',
  SPIRIT_SCORE_UPDATED: 'spirit-score-updated',
  
  // Coaching events
  JOIN_SESSION: 'join-session',
  ATTENDANCE_UPDATE: 'attendance-update',
  ATTENDANCE_UPDATED: 'attendance-updated'
};