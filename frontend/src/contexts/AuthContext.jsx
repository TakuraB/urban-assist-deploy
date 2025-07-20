import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  // Initialize token from localStorage. This token will be used for initial profile fetch.
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // API Configuration - Use environment variable or fallback
  // Ensure VITE_API_URL is set correctly in your .env file for production
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  // Memoize logout function to prevent unnecessary re-renders/issues with useEffect dependencies
  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    // Optionally, clear refresh token if you implement it separately
    // localStorage.removeItem('refresh_token');
    console.log("User logged out due to invalid/expired token or explicit logout.");
  }, []);

  // Centralized function for making authenticated API calls
  // This helps ensure the Authorization header is always attached and errors are handled consistently.
  const authFetch = useCallback(async (url, options = {}) => {
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
    };

    // Only add Authorization header if a token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('DEBUG: Adding Authorization header with token:', token.substring(0, 20) + '...');
    } else {
      console.log('DEBUG: No token available for request to:', url);
    }

    console.log('DEBUG: Making request to:', url);
    console.log('DEBUG: Headers:', headers);

    const response = await fetch(url, { ...options, headers });

    console.log('DEBUG: Response status:', response.status);
    console.log('DEBUG: Response headers:', Object.fromEntries(response.headers.entries()));

    // Handle 401 Unauthorized globally for all authenticated fetches
    if (response.status === 401 || response.status === 403) {
      console.warn(`Auth fetch to ${url} received ${response.status}. Attempting logout.`);
      logout(); // Log out if token is unauthorized or forbidden
      // Re-throw or return a specific error to allow component-level handling if needed
      throw new Error('Unauthorized or Forbidden'); 
    }

    return response;
  }, [token, logout]); // Depend on token and logout

  const fetchUserProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      // Use the new authFetch for consistency
      const response = await authFetch(`${API_BASE_URL}/users/profile`);

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // If response is not OK but not 401/403 (e.g., 404, 500), log error but don't necessarily logout
        const errorData = await response.json().catch(() => ({})); // Try to parse error, fallback to empty object
        console.error(`Error fetching user profile (${response.status}):`, errorData.error || response.statusText);
        // The authFetch already handles 401/403 by calling logout.
        // For other errors, we don't force a logout here, as it might be a temporary server issue.
      }
    } catch (error) {
      // Catch network errors or errors thrown by authFetch (like 'Unauthorized or Forbidden')
      console.error('Error fetching user profile:', error);
      // If the error was 'Unauthorized or Forbidden', logout was already called by authFetch.
      // For other network errors, we might still want to logout if the app state is inconsistent.
      // For now, let authFetch handle the 401/403.
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE_URL, authFetch]); // Depend on token, API_BASE_URL, and authFetch

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]); // Depend on the memoized fetchUserProfile

  const login = async (email, password) => {
    try {
      console.log('DEBUG: Attempting login for email:', email);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      console.log('DEBUG: Login response status:', response.status);
      console.log('DEBUG: Login response data:', data);

      if (response.ok) {
        console.log('DEBUG: Login successful, setting token:', data.access_token.substring(0, 20) + '...');
        setToken(data.access_token)
        setUser(data.user)
        localStorage.setItem('token', data.access_token)
        // You might also want to store refresh token if you plan to use it for silent refresh
        // localStorage.setItem('refresh_token', data.refresh_token);
        return { success: true }
      } else {
        console.log('DEBUG: Login failed:', data.error);
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Login network error:', error);
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (response.ok) {
        setToken(data.access_token)
        setUser(data.user)
        localStorage.setItem('token', data.access_token)
        // localStorage.setItem('refresh_token', data.refresh_token);
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Registration failed' }
      }
    } catch (error) {
      console.error('Registration network error:', error);
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const updateProfile = async (profileData) => {
    try {
      // Use authFetch for authenticated requests
      const response = await authFetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to update profile' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      // authFetch would have handled 401/403. This catches other errors.
      return { success: false, error: 'Network error or unauthorized. Please try again.' };
    }
  };

  // You will need similar functions for other authenticated API calls, e.g.:
  const getRunners = useCallback(async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/runners${queryString ? `?${queryString}` : ''}`;
      const response = await authFetch(url);
      const data = await response.json();
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Failed to fetch runners' };
      }
    } catch (error) {
      console.error('Get runners error:', error);
      return { success: false, error: 'Network error or unauthorized.' };
    }
  }, [API_BASE_URL, authFetch]);


  const getBookings = useCallback(async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/bookings${queryString ? `?${queryString}` : ''}`;
      const response = await authFetch(url);
      const data = await response.json();
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Failed to fetch bookings' };
      }
    } catch (error) {
      console.error('Get bookings error:', error);
      return { success: false, error: 'Network error or unauthorized.' };
    }
  }, [API_BASE_URL, authFetch]);


  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    getRunners, // Expose new functions
    getBookings, // Expose new functions
    API_BASE_URL // Still useful for other components
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
