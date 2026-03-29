// Centraliza todas as chamadas à API
const API_URL = 'http://localhost:8000';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: authHeaders(),
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erro desconhecido' }));
    throw new Error(err.detail || 'Erro na requisição');
  }
  if (res.status === 204) return null;
  return res.json();
}

const API = {
  // Auth
  register: (data) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    return fetch(`${API_URL}/auth/login`, { method: 'POST', body: form }).then(r => r.json());
  },
  me: () => apiFetch('/auth/me'),

  // Groups
  createGroup: (name) => apiFetch('/groups/', { method: 'POST', body: JSON.stringify({ group_name: name }) }),
  myGroups: () => apiFetch('/groups/mine'),
  joinGroup: (id) => apiFetch(`/groups/${id}/join`, { method: 'POST' }),
  getMembers: (id) => apiFetch(`/groups/${id}/members`),
  getRanking: (id) => apiFetch(`/groups/${id}/ranking`),

  // Sessions
  saveSession: (duration, group_id = null) => apiFetch('/sessions/', {
    method: 'POST', body: JSON.stringify({ duration, group_id })
  }),
  myStats: () => apiFetch('/sessions/my-stats'),

  // Summaries
  getSummaries: (groupId) => apiFetch(`/summaries/group/${groupId}`),
  createSummary: (data) => apiFetch('/summaries/', { method: 'POST', body: JSON.stringify(data) }),
  addComment: (summaryId, text) => apiFetch(`/summaries/${summaryId}/comments`, {
    method: 'POST', body: JSON.stringify({ text })
  }),

  // Reminders
  getReminders: (groupId) => apiFetch(`/reminders/group/${groupId}`),
  createReminder: (data) => apiFetch('/reminders/', { method: 'POST', body: JSON.stringify(data) }),
  deleteReminder: (id) => apiFetch(`/reminders/${id}`, { method: 'DELETE' }),
};