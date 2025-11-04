import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/changepassword', data),
}

// Tournament API
export const tournamentAPI = {
  getAll: (params) => api.get('/tournaments', { params }),
  getById: (id) => api.get(`/tournaments/${id}`),
  create: (data) => api.post('/tournaments', data),
  update: (id, data) => api.put(`/tournaments/${id}`, data),
  delete: (id) => api.delete(`/tournaments/${id}`),
  registerVisitor: (id, data) => api.post(`/tournaments/${id}/visitors`, data),
  getDashboard: (id) => api.get(`/tournaments/${id}/dashboard`),
  uploadBanner: (id, formData) => api.post(`/tournaments/${id}/banner`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  sendUpdate: (id, data) => api.post(`/tournaments/${id}/updates`, data),
  getHistory: (params) => api.get('/tournaments/history', { params }),
  exportData: (id) => api.get(`/tournaments/${id}/export`),
  updateFields: (id, data) => api.put(`/tournaments/${id}/fields`, data),
  getLeaderboard: (id) => api.get(`/tournaments/${id}/leaderboard`),
  exportMatches: (id) => api.get(`/tournaments/${id}/export/matches`, { responseType: 'blob' }),
  exportPlayers: (id) => api.get(`/tournaments/${id}/export/players`, { responseType: 'blob' }),
  exportTeams: (id) => api.get(`/tournaments/${id}/export/teams`, { responseType: 'blob' }),
  updateStatus: (id, status) => api.put(`/tournaments/${id}/status`, { status }),
  generateSchedule: (id, data) => api.post(`/tournaments/${id}/generate-schedule`, data),
  saveSchedule: (id, data) => api.post(`/tournaments/${id}/save-schedule`, data),
  getFieldSchedule: (id, params) => api.get(`/tournaments/${id}/field-schedule`, { params }),
}

// Team API
export const teamAPI = {
  create: (data) => api.post('/teams', data),
  getAll: (params) => api.get('/teams', { params }),
  getByTournament: (tournamentId, params) => api.get(`/teams/tournament/${tournamentId}`, { params }),
  getById: (id) => api.get(`/teams/${id}`),
  update: (id, data) => api.put(`/teams/${id}`, data),
  updateStatus: (id, status) => api.put(`/teams/${id}/status`, { status }),
  addPlayer: (id, data) => api.post(`/teams/${id}/players`, data),
  removePlayer: (id, playerId) => api.delete(`/teams/${id}/players/${playerId}`),
}

// Match API
export const matchAPI = {
  getAll: (params) => api.get('/matches', { params }),
  create: (data) => api.post('/matches', data),
  getByTournament: (tournamentId, params) => api.get(`/matches/tournament/${tournamentId}`, { params }),
  getById: (id) => api.get(`/matches/${id}`),
  updateScore: (id, data) => api.put(`/matches/${id}/score`, data),
  complete: (id) => api.put(`/matches/${id}/complete`),
  markAttendance: (id, data) => api.put(`/matches/${id}/attendance`, data),
  uploadPhotos: (id, formData) => api.post(`/matches/${id}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  complete: (id) => api.put(`/matches/${id}/complete`),
  getLive: () => api.get('/matches/live'),
}

// Spirit Score API
export const spiritAPI = {
  getAll: (params) => api.get('/spirit-scores', { params }),
  submit: (data) => api.post('/spirit-scores', data),
  getByMatch: (matchId) => api.get(`/spirit-scores/matches/${matchId}`),
  getByTeam: (teamId, params) => api.get(`/spirit-scores/teams/${teamId}`, { params }),
  getLeaderboard: (tournamentId) => api.get(`/spirit-scores/tournaments/${tournamentId}/leaderboard`),
  getPending: (teamId) => api.get(`/spirit-scores/teams/${teamId}/pending`),
  canTeamPlayNext: (teamId) => api.get(`/spirit-scores/teams/${teamId}/can-play-next`),
  getTeamSummary: (teamId) => api.get(`/spirit-scores/teams/${teamId}/spirit-summary`),
}

// Child API
export const childAPI = {
  getAll: (params) => api.get('/children', { params }),
  getById: (id) => api.get(`/children/${id}`),
  create: (data) => api.post('/children', data),
  update: (id, data) => api.put(`/children/${id}`, data),
  transfer: (id, data) => api.post(`/children/${id}/transfer`, data),
  bulkUpload: (data) => api.post('/children/bulk-upload', data),
  getAttendance: (id, params) => api.get(`/children/${id}/attendance`, { params }),
  updateStats: (id) => api.put(`/children/${id}/update-stats`),
}

// Session API
export const sessionAPI = {
  getAll: (params) => api.get('/sessions', { params }),
  getById: (id) => api.get(`/sessions/${id}`),
  create: (data) => api.post('/sessions', data),
  update: (id, data) => api.put(`/sessions/${id}`, data),
  start: (id) => api.put(`/sessions/${id}/start`),
  complete: (id) => api.put(`/sessions/${id}/complete`),
  markAttendance: (id, data) => api.put(`/sessions/${id}/attendance`, data),
  bulkMarkAttendance: (id, data) => api.put(`/sessions/${id}/bulk-attendance`, data),
  uploadPhotos: (id, formData) => api.post(`/sessions/${id}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getCoachWorkload: (coachId, params) => api.get(`/sessions/coach-workload/${coachId}`, { params }),
  getSessionChildren: (id) => api.get(`/sessions/${id}/children`),
  registerChildToSession: (id, data) => api.post(`/sessions/${id}/register-child`, data),
}

// Home Visit API
export const homeVisitAPI = {
  getAll: (params) => api.get('/home-visits', { params }),
  getById: (id) => api.get(`/home-visits/${id}`),
  create: (data) => api.post('/home-visits', data),
  update: (id, data) => api.put(`/home-visits/${id}`, data),
  complete: (id) => api.put(`/home-visits/${id}/complete`),
  getByChild: (childId) => api.get(`/home-visits/children/${childId}`),
  getByCoach: (coachId, params) => api.get(`/home-visits/coaches/${coachId}`, { params }),
  getUpcoming: (params) => api.get('/home-visits/upcoming', { params }),
  updateActionItem: (id, actionItemId, data) => api.put(`/home-visits/${id}/action-items/${actionItemId}`, data),
  uploadPhotos: (id, formData) => api.post(`/home-visits/${id}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// Assessment API
export const assessmentAPI = {
  getAll: (params) => api.get('/assessments', { params }),
  getById: (id) => api.get(`/assessments/${id}`),
  create: (data) => api.post('/assessments', data),
  update: (id, data) => api.put(`/assessments/${id}`, data),
  complete: (id) => api.put(`/assessments/${id}/complete`),
  getByChild: (childId) => api.get(`/assessments/children/${childId}`),
  getAnalytics: (params) => api.get('/assessments/analytics', { params }),
  getDue: (params) => api.get('/assessments/due', { params }),
}

// Program API
export const programAPI = {
  getAll: (params) => api.get('/programs', { params }),
  getById: (id) => api.get(`/programs/${id}`),
  create: (data) => api.post('/programs', data),
  update: (id, data) => api.put(`/programs/${id}`, data),
  delete: (id) => api.delete(`/programs/${id}`),
};

// Coach API
export const coachAPI = {
  getAll: () => api.get('/coaches'),
  getWorkload: (id, params) => api.get(`/coaches/${id}/workload`, { params }),
  updateSessionTime: (data) => api.put('/coaches/session-time', data),
  assignWork: (id, data) => api.post(`/coaches/${id}/assign`, data),
};

// Report API
export const reportAPI = {
  getTournament: (tournamentId) => api.get(`/reports/tournament/${tournamentId}`),
  exportTournament: (tournamentId, params) => api.get(`/reports/tournament/${tournamentId}/export`, { params }),
  getCoaching: (params) => api.get('/reports/coaching', { params }),
  exportCoaching: (params) => api.get('/reports/coaching/export', { params }),
  exportChildren: (params) => api.get('/reports/children/export', { params, responseType: 'blob' }),
  exportSessions: (params) => api.get('/reports/sessions/export', { params, responseType: 'blob' }),
}

// Notification API
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
}

export default api