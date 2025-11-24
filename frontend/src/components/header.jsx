import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const location = useLocation();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();

  // Create callback ref for intersection observer
  const heroRef = useCallback(node => {
    if (node !== null) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          // When hero is less than 20% visible, consider it not visible
          setIsHeroVisible(entry.isIntersecting && entry.intersectionRatio > 0.2);
        },
        {
          root: null,
          rootMargin: '0px',
          threshold: [0.2, 0.3, 0.4, 0.5, 0.6]
        }
      );
      
      observer.observe(node);
      
      // Clean up observer on component unmount
      return () => observer.disconnect();
    }
  }, []);

  // Add scroll event listener to track scrolling within the hero section
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Add hero ref to the global window object so it can be accessed from the home component
  useEffect(() => {
    window.heroRef = heroRef;
    
    return () => {
      delete window.heroRef;
    };
  }, [heroRef]);

  // Function to determine if a link is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    // Redirect to home page
    window.location.href = '/';
  };

  return (
    <header className={`sticky top-0 z-[999] transition-all duration-300 ${
      !isHeroVisible 
        ? 'bg-[#560C06]/80 backdrop-blur-md shadow-lg' 
        : isScrolled 
          ? 'bg-gradient-to-r from-gray-900/70 to-gray-700/70 backdrop-blur-sm' 
          : 'bg-gradient-to-r from-gray-900/90 to-gray-700/90'
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center py-2">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="REDBRICK" className="h-12" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className={`${isActive('/') ? 'text-red-500' : 'text-white'} hover:text-red-400 font-medium`}>
            Home
          </Link>
          
          <Link to="/building-page" className={`${isActive('/building-page') ? 'text-red-500' : 'text-white'} hover:text-red-400 font-medium`}>
            Services
          </Link>
          
          <Link to="/team" className={`${isActive('/team') ? 'text-red-500' : 'text-white'} hover:text-red-400 font-medium`}>
            Our Team
          </Link>
          
          <Link to="/contact" className={`${isActive('/contact') ? 'text-red-500' : 'text-white'} hover:text-red-400 font-medium`}>
            Contact Us
          </Link>
          
          {!isAuthenticated ? (
            // Show Login/Signup when not authenticated
            <Link to="/signin" className={`${isActive('/signin') ? 'text-red-500' : 'text-white'} hover:text-red-400 font-medium`}>
              Login/Signup
            </Link>
          ) : isAdmin() ? (
            // Show Dashboard when authenticated as admin
            <Link to="/admin-dashboard" className={`${isActive('/admin-dashboard') ? 'text-red-500' : 'text-white'} hover:text-red-400 font-medium`}>
              Dashboard
            </Link>
          ) : (
            // Show user dropdown when authenticated as regular user
            <div className="relative group">
              <button className="text-white hover:text-red-400 font-medium flex items-center">
                {user?.name?.split(' ')[0]} 
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#560C06]/90 backdrop-blur-sm py-3 px-4 shadow-inner">
          <Link to="/" className={`block py-2 ${isActive('/') ? 'text-red-500' : 'text-white'} hover:text-red-400 font-medium`}>
            Home
          </Link>
          
          <Link to="/building-page" className={`block py-2 ${isActive('/building-page') ? 'text-red-500' : 'text-white'} hover:text-red-400 font-medium`}>
            Services
          </Link>
          
          <Link to="/team" className={`block py-2 ${isActive('/team') ? 'text-red-500' : 'text-white'} hover:text-red-400 font-medium`}>
            Our Team
          </Link>
          
          <Link to="/contact" className={`block py-2 ${isActive('/contact') ? 'text-red-500' : 'text-white'} hover:text-red-400 font-medium`}>
            Contact Us
          </Link>
          
          {!isAuthenticated ? (
            // Show Login/Signup when not authenticated
            <Link to="/signin" className={`block py-2 ${isActive('/signin') ? 'text-red-500' : 'text-white'} hover:text-red-400 font-medium`}>
              Login/Signup
            </Link>
          ) : isAdmin() ? (
            // Show Dashboard when authenticated as admin
            <Link to="/admin-dashboard" className={`block py-2 ${isActive('/admin-dashboard') ? 'text-red-500' : 'text-white'} hover:text-red-400 font-medium`}>
              Dashboard
            </Link>
          ) : (
            // Show logout option for regular users
            <button 
              onClick={handleLogout}
              className="block py-2 w-full text-left text-white hover:text-red-400 font-medium"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header; 