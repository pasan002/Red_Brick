import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the auth context
export const AuthContext = createContext();

// Create a hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const userRole = localStorage.getItem('userRole');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const userID = localStorage.getItem('userID');

      if (token) {
        setIsAuthenticated(true);
        setUser({
          id: userID,
          name: userName,
          email: userEmail,
          role: userRole
        });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = (userData) => {
    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('userID', userData.user._id);
    localStorage.setItem('userEmail', userData.user.email);
    localStorage.setItem('userName', userData.user.name);
    localStorage.setItem('userRole', userData.user.role);
    
    setIsAuthenticated(true);
    setUser({
      id: userData.user._id,
      name: userData.user.name,
      email: userData.user.email,
      role: userData.user.role
    });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userID');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    
    setIsAuthenticated(false);
    setUser(null);
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 