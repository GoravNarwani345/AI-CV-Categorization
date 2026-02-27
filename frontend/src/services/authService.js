const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const AUTH_URL = `${API_URL}/auth`;

// Password validation (keeping the same logic)
export const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push("Password must be at least 8 characters long");
  if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("Password must contain at least one number");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("Password must contain at least one special character");

  return { isValid: errors.length === 0, errors };
};

export const signUp = async (email, password, name, role) => {
  try {
    const validation = validatePassword(password);
    if (!validation.isValid) throw new Error(validation.errors.join("\n"));

    const response = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role })
    });

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signIn = async (email, password) => {
  try {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    if (result.success) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('uid', result.user.uid);
    }
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logOut = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('uid');
  return { success: true };
};

export const onAuthChange = (callback) => {
  const token = localStorage.getItem('token');
  if (token) {
    fetch(`${AUTH_URL}/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          callback(result.user);
        } else {
          localStorage.removeItem('token');
          callback(null);
        }
      })
      .catch(() => callback(null));
  } else {
    callback(null);
  }
  return () => { }; // No-op unsubscribe for now
};

export const resendVerificationEmail = async (email) => {
  try {
    const response = await fetch(`${AUTH_URL}/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const sendPasswordReset = async (email) => {
  try {
    const response = await fetch(`${AUTH_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await fetch(`${AUTH_URL}/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};
