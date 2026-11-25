// API Service Layer for University Placement Portal

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  // If body is FormData (e.g. file upload), remove Content-Type to let browser set boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const authApi = {
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  registerStudent: (payload) => request('/auth/register/student', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  registerRecruiter: (payload) => request('/auth/register/recruiter', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getMe: () => request('/auth/me')
};

export const studentApi = {
  getProfile: () => request('/students/profile'),
  updateProfile: (payload) => request('/students/profile', {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  uploadResume: (formData) => request('/students/resume', {
    method: 'POST',
    body: formData
  }),
  getSkills: () => request('/students/skills'),
  addSkill: (payload) => request('/students/skills', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  removeSkill: (skillId) => request(`/students/skills/${skillId}`, {
    method: 'DELETE'
  }),
  checkEligibility: (opportunityId) => request(`/students/eligibility/${opportunityId}`)
};

export const opportunityApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/opportunities?${query}`);
  },
  getById: (id) => request(`/opportunities/${id}`),
  create: (payload) => request('/opportunities', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  update: (id, payload) => request(`/opportunities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  delete: (id) => request(`/opportunities/${id}`, {
    method: 'DELETE'
  }),
  getMyPostings: () => request('/opportunities/recruiter/my-postings')
};

export const applicationApi = {
  apply: (payload) => request('/applications/apply', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getMyApplications: () => request('/applications/my-applications'),
  getById: (id) => request(`/applications/${id}`),
  getOpportunityApplicants: (opportunityId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/applications/opportunity/${opportunityId}?${query}`);
  },
  updateStatus: (id, payload) => request(`/applications/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
};

export const recruiterApi = {
  getProfile: () => request('/recruiters/profile'),
  updateProfile: (payload) => request('/recruiters/profile', {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  updateCompany: (payload) => request('/recruiters/company', {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
};

export const adminApi = {
  getStats: () => request('/admin/dashboard-stats'),
  getAnalytics: () => request('/admin/placement-analytics'),
  getPendingOpportunities: () => request('/admin/pending-opportunities'),
  updateOpportunityApproval: (id, status) => request(`/admin/opportunities/${id}/approval`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  getStudents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/students?${query}`);
  },
  updateStudentStatus: (userId, status) => request(`/admin/students/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  getRecruiters: () => request('/admin/recruiters'),
  updateRecruiterStatus: (userId, status) => request(`/admin/recruiters/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  getApplications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/applications?${query}`);
  },
  getShowcaseQuery: (queryKey) => request(`/admin/analytics-showcase/${queryKey}`)
};

export const notificationApi = {
  getMy: () => request('/notifications/my'),
  markRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => request('/notifications/mark-all-read', { method: 'PUT' })
};

export const skillApi = {
  getAll: () => request('/skills'),
  create: (payload) => request('/skills', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
};
