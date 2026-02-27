const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper for authenticated requests
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const fetchData = async () => {
  try {
    const response = await fetch(`${API_URL}/profiles/me`, {
      headers: getAuthHeaders()
    });

    const result = await response.json();
    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const fetchAllProfiles = async () => {
  try {
    const response = await fetch(`${API_URL}/profiles`, {
      headers: getAuthHeaders()
    });
    const result = await response.json();
    if (result.success) return { success: true, data: result.data };
    return { success: false, error: result.error };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchJobs = async () => {
  try {
    const response = await fetch(`${API_URL}/jobs`, {
      headers: getAuthHeaders()
    });
    const result = await response.json();
    if (result.success) return { success: true, data: result.data };
    return { success: false, error: result.error };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateProfile = async (profilePayload) => {
  try {
    const response = await fetch(`${API_URL}/profiles/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profilePayload)
    });
    const result = await response.json();
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateJob = async (jobId, jobPayload) => {
  try {
    const response = await fetch(`${API_URL}/jobs/${jobId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobPayload)
    });
    const result = await response.json();
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchRecentActivity = async () => {
  try {
    const response = await fetch(`${API_URL}/applications/recent`, {
      headers: getAuthHeaders()
    });
    const result = await response.json();
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};
export const fetchNotifications = async () => {
  try {
    const response = await fetch(`${API_URL}/notifications`, {
      headers: getAuthHeaders()
    });
    const result = await response.json();
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const markNotificationRead = async (id) => {
  try {
    const response = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const markAllNotificationsRead = async () => {
  try {
    const response = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};
export const applyForJob = async (jobId) => {
  try {
    const response = await fetch(`${API_URL}/applications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ jobId })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchApplications = async () => {
  try {
    const response = await fetch(`${API_URL}/applications/me`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchJobApplicants = async (jobId) => {
  try {
    const response = await fetch(`${API_URL}/applications/job/${jobId}`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateApplicationStatus = async (applicationId, status) => {
  try {
    const response = await fetch(`${API_URL}/applications/${applicationId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};
export const fetchProfileStats = async () => {
  try {
    const response = await fetch(`${API_URL}/profiles/stats`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchAppStats = async () => {
  try {
    const response = await fetch(`${API_URL}/applications/stats`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchPopularSkills = async () => {
  try {
    const response = await fetch(`${API_URL}/jobs/popular-skills`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};
