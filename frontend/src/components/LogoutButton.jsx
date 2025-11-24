import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LogoutButton = ({ className }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <button 
      onClick={handleLogout}
      className={className || "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"}
    >
      Logout
    </button>
  );
};

export default LogoutButton; 