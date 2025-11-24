import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:4000/api/projects';
const NOTIFICATIONS_API_URL = 'http://localhost:4000/api/notifications';

// Add these constants at the top of your file
const PROJECT_NAME_REGEX = /^[a-zA-Z0-9\s-]{3,50}$/;
const BUDGET_REGEX = /^\d+(\.\d{1,2})?$/;
const LOCATION_REGEX = /^[a-zA-Z0-9\s,.-]{3,100}$/;
const DESCRIPTION_REGEX = /^[\w\s.,!?-]{10,500}$/;

const ConstructionDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [startDateDisabled, setStartDateDisabled] = useState(false);
  const [endDateDisabled, setEndDateDisabled] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    type: 'Residential',
    location: '',
    startDate: '',
    endDate: '',
    status: 'Pending',
    budget: '',
    manager: '',
    description: ''
  });

  // Add state for projects data
  const [projects, setProjects] = useState([]);
  
  // Add state for loading and error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add state for the selected tab
  const [selectedTab, setSelectedTab] = useState('active');

  // Add state for notification panel
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // Add state for notifications
  const [notifications, setNotifications] = useState([]);
  
  // Add state for notification count
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Add loading state for notifications
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Add state for delete confirmation
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Add state for statistics
  const [statistics, setStatistics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalBudget: 0,
    upcomingDeadlines: 0
  });

  // Update the state declarations in your component
  const [validName, setValidName] = useState(false);
  const [validBudget, setValidBudget] = useState(false);
  const [validLocation, setValidLocation] = useState(false);
  const [validDescription, setValidDescription] = useState(false);

  const [nameFocus, setNameFocus] = useState(false);
  const [budgetFocus, setBudgetFocus] = useState(false);
  const [locationFocus, setLocationFocus] = useState(false);
  const [descriptionFocus, setDescriptionFocus] = useState(false);

  // Add these state variables near your other validation states
  const [startDateFocus, setStartDateFocus] = useState(false);
  const [endDateFocus, setEndDateFocus] = useState(false);
  const [dateError, setDateError] = useState('');

  // Add these state variables at the top with your other state declarations
  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');

  // Add this state near your other state declarations
  const [searchQuery, setSearchQuery] = useState('');

  // Check if user is authenticated and is an admin
  useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Add a function to fetch notifications
  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await axios.get(NOTIFICATIONS_API_URL);
      if (response.data && Array.isArray(response.data.notifications)) {
        setNotifications(response.data.notifications);
        
        // Count unread notifications
        const unreadCount = response.data.notifications.filter(
          notification => !notification.isRead
        ).length;
        setNotificationCount(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Call fetchNotifications when component mounts
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling to check for new notifications every 30 seconds
    const notificationInterval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    // Clear interval on component unmount
    return () => clearInterval(notificationInterval);
  }, []);

  const handleEdit = (project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingProject({
      ...editingProject,
      [name]: value
    });
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
  
    try {
      await axios.put(`${API_URL}/${editingProject._id}`, editingProject);
      addEditProjectNotification(editingProject.name, editingProject._id);
      fetchProjects(); // Refresh the project list after updating
      setIsEditModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project. Please try again later.');
    }
  };
  
  // Fetch projects from API
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setProjects(response.data);
      
      // Calculate statistics
      const totalProjects = response.data.length;
      const activeProjects = response.data.filter(project => project.status === 'In Progress').length;
      const totalBudget = response.data.reduce((sum, project) => sum + parseFloat(project.budget || 0), 0);
      
      // Calculate upcoming deadlines (projects due in the next 30 days)
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      const upcomingDeadlines = response.data.filter(project => {
        if (!project.endDate) return false;
        const endDate = new Date(project.endDate);
        return endDate >= today && endDate <= thirtyDaysFromNow;
      }).length;
      
      setStatistics({
        totalProjects,
        activeProjects,
        totalBudget,
        upcomingDeadlines
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Add validation effects
  useEffect(() => {
    setValidName(PROJECT_NAME_REGEX.test(newProject.name));
  }, [newProject.name]);

  useEffect(() => {
    setValidBudget(BUDGET_REGEX.test(newProject.budget));
  }, [newProject.budget]);

  useEffect(() => {
    setValidLocation(LOCATION_REGEX.test(newProject.location));
  }, [newProject.location]);

  useEffect(() => {
    setValidDescription(DESCRIPTION_REGEX.test(newProject.description));
  }, [newProject.description]);

  useEffect(() => {
    if (editingProject) {
      // Determine if dates should be disabled based on status
      const disableStartDate = ['In Progress', 'Completed', 'On Hold', 'Cancelled'].includes(editingProject.status);
      const disableEndDate = ['Completed', 'Cancelled'].includes(editingProject.status);
      
      // Set state for disabled fields (you'll need to add these state variables)
      setStartDateDisabled(disableStartDate);
      setEndDateDisabled(disableEndDate);
    }
  }, [editingProject?.status]);

  // Update the validateDates function
  const validateDates = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    if (startDate < today) {
      setStartDateError('Start date cannot be in the past');
      return false;
    }
  
    if (endDate < startDate) {
      setEndDateError('End date must be after start date');
      return false;
    }
  
    if (
      (!editingProject || editingProject.status === 'Pending') &&
      startDate < today
    ) {
      setStartDateError('Start date cannot be in the past');
      return false;
    }
  
    if (endDate < startDate) {
      setEndDateError('End date must be after start date');
      return false;
    }

    setStartDateError('');
    setEndDateError('');
    return true;

  };

  // Toggle notification panel
  const toggleNotificationPanel = () => setIsNotificationOpen(!isNotificationOpen);

  // Open confirmation dialog
  const confirmDelete = (project) => setProjectToDelete(project);

  // Close confirmation dialog
  const cancelDelete = () => setProjectToDelete(null);

  // Delete project
  const deleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      await axios.delete(`${API_URL}/${projectToDelete._id}`);
      addDeleteProjectNotification(projectToDelete.name);
      // Refresh projects list
      fetchProjects();
      // Close the confirmation dialog
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project. Please try again later.');
    }
  };

  // Update your handleInputChange function
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  
    if (name === 'startDate' || name === 'endDate') {
      const startDate = name === 'startDate' ? value : newProject.startDate;
      const endDate = name === 'endDate' ? value : newProject.endDate;
      
      if (startDate && endDate) {
        validateDates(startDate, endDate);
      }
    }
  };

  // Add these functions to handle different types of notifications
  const addNewProjectNotification = (projectName, projectId) => {
    const newNotification = {
      id: Date.now(),
      message: `New project created: ${projectName}`,
      timestamp: 'Just now',
      type: 'project_created',
      projectId: projectId,
      isRead: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    setNotificationCount(prev => prev + 1);
  };

  const addEditProjectNotification = (projectName, projectId) => {
    const newNotification = {
      id: Date.now(),
      message: `Project updated: ${projectName}`,
      timestamp: 'Just now',
      type: 'project_updated',
      projectId: projectId,
      isRead: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    setNotificationCount(prev => prev + 1);
  };

  const addDeleteProjectNotification = (projectName) => {
    const newNotification = {
      id: Date.now(),
      message: `Project deleted: ${projectName}`,
      timestamp: 'Just now',
      type: 'project_deleted'
    };
    setNotifications(prev => [newNotification, ...prev]);
  };
  
  // Add function for inquiry notifications
  const addInquiryNotification = (customerName, inquiryType, inquiryId) => {
    const newNotification = {
      id: Date.now(),
      message: `New inquiry from ${customerName} about ${inquiryType}`,
      timestamp: 'Just now',
      type: 'inquiry_received',
      inquiryId: inquiryId
    };
    setNotifications(prev => [newNotification, ...prev]);
    setNotificationCount(prev => prev + 1);
  };

  // Modify the handleSubmit function to include notification
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate dates first
    if (!validateDates(newProject.startDate, newProject.endDate)) {
      return;
    }
  
    if (!validName || !validBudget || !validLocation || !validDescription) {
      setError('Please fill all fields correctly.');
      return;
    }
  
    try {
      const response = await axios.post(API_URL, newProject);
      addNewProjectNotification(newProject.name, response.data._id);
      setIsCreateModalOpen(false);
      setNewProject({
        name: '',
        type: 'Residential',
        location: '',
        startDate: '',
        endDate: '',
        status: 'In Progress',
        budget: '',
        manager: '',
        description: ''
      });
      fetchProjects();
    } catch (error) {
      console.error("Error creating project:", error);
      setError('Failed to create project. Please try again later.');
    }
  };

  // Update the handleNotificationClick function
  const handleNotificationClick = async (notification) => {
    try {
      // Mark notification as read
      await axios.put(`${NOTIFICATIONS_API_URL}/${notification._id}`, {
        isRead: true
      });
      
      // Update notification in the local state
      setNotifications(prev => 
        prev.map(n => 
          n._id === notification._id ? { ...n, isRead: true } : n
        )
      );
      
      // Decrement unread count if this was unread
      if (!notification.isRead) {
        setNotificationCount(prev => Math.max(0, prev - 1));
      }
      
      // Close notification panel
      setIsNotificationOpen(false);
      
      // Navigate based on notification type
      switch (notification.type) {
        case 'project_created':
        case 'project_updated':
          if (notification.projectId) {
            navigate(`/projects/${notification.projectId}`);
          }
          break;
        case 'inquiry_received':
          if (notification.inquiryId) {
            navigate('/inquiries');
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Update the filteredProjects function
  const filteredProjects = projects.filter((project) => {
    // Convert search query to lowercase for case-insensitive search
    const searchLower = searchQuery.toLowerCase().trim();

    // Check if any of the fields match the search query
    const matchesSearch = 
      (project.name && project.name.toLowerCase().includes(searchLower)) ||      // Project ID
      (project.location && project.location.toLowerCase().includes(searchLower)) || // Location
      (project.status && project.status.toLowerCase().includes(searchLower));      // Status

    // If there's a search query, only return projects that match the search
    if (searchQuery.trim()) {
      return matchesSearch;
    }

    // If no search query, apply status tab filter
    switch (selectedTab) {
      case 'active':
        return project.status === 'In Progress';
      case 'completed':
        return project.status === 'Completed';
      case 'onHold':
        return project.status === 'On Hold';
      case 'pending':
        return project.status === 'Pending';
      case 'cancelled':
        return project.status === 'Cancelled';
      default:
        return true;
    }
  });

  // Calculate project status data for pie chart
  const calculateStatusData = () => {
    const statusCounts = projects.reduce((counts, project) => {
      counts[project.status] = (counts[project.status] || 0) + 1;
      return counts;
    }, {});
    
    const total = projects.length;
    
    return Object.entries(statusCounts).map(([status, count]) => {
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      
      // Define colors for different statuses
      let color = '#93c5fd'; // Default blue
      if (status === 'In Progress') color = '#3B82F6'; 
      if (status === 'Pending') color = '#F4A7B9'; 
      if (status === 'Completed') color = '#22C55E'; 
      if (status === 'On Hold') color = '#FACC15'; 
      if (status === 'Cancelled') color = '#EF4444'; 
      return { status, percentage, color };
    });
  };

  // Project status data for pie chart
  const statusData = calculateStatusData();

  // Calculate monthly data for timeline chart
  const calculateTimelineData = () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    
    const months = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(sixMonthsAgo);
      date.setMonth(date.getMonth() + i);
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        value: 0,
        date: new Date(date)
      });
    }
    
    // Count projects started in each month
    projects.forEach(project => {
      if (!project.startDate) return;
      
      const startDate = new Date(project.startDate);
      if (startDate >= sixMonthsAgo) {
        const monthIndex = months.findIndex(m => 
          m.date.getMonth() === startDate.getMonth() && 
          m.date.getFullYear() === startDate.getFullYear()
        );
        
        if (monthIndex !== -1) {
          months[monthIndex].value += 1;
        }
      }
    });
    
    return months.map(({ month, value }) => ({ month, value }));
  };

  // Monthly new projects data
  const timelineData = calculateTimelineData();

  // Get status color 
  const getStatusColor = (status) => {
    if (status === 'In Progress') return 'bg-blue-500';
    if (status === 'Cancelled') return 'bg-red-500';
    if (status === 'On Hold') return 'bg-orange-500';
    if (status === 'Completed') return 'bg-green-500';
    if (status === 'Pending') return 'bg-purple-500';
    return 'bg-gray-500';
  };

  // Function to handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-4">
         
         
          <div className="relative">
            <div
              className="h-8 w-8 bg-gray-200 rounded-full text-center flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-300"
              onClick={toggleNotificationPanel}
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </div>
          
          {/* Add User Management button */}
          <button
            onClick={() => navigate('/userdashboard')}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-red-600 transition duration-200"
          >
            Manage Users
          </button>
          
          <div className="relative group">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="h-8 w-8 bg-red-400 rounded-full flex items-center justify-center text-white">
                {user?.name?.charAt(0)}
              </div>
              <span className="text-gray-700">{user?.name || 'Admin'}</span>
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification panel */}
      {isNotificationOpen && (
        <div className="fixed right-0 top-0 w-80 h-full bg-white shadow-lg z-50 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
            <button
              onClick={toggleNotificationPanel}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          {loadingNotifications ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          ) : (
            <ul className="space-y-3">
              {notifications.length === 0 ? (
                <li className="p-3 text-center text-gray-500">
                  No notifications yet
                </li>
              ) : (
                notifications.map((notification) => (
                  <li 
                    key={notification._id} 
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 rounded-lg shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md ${
                      notification.isRead ? 'bg-gray-50' : 
                      notification.type === 'inquiry_received' ? 'bg-purple-50 border border-purple-100 hover:bg-purple-100' :
                      notification.type === 'project_created' ? 'bg-green-50 border border-green-100 hover:bg-green-100' :
                      notification.type === 'project_updated' ? 'bg-blue-50 border border-blue-100 hover:bg-blue-100' :
                      'bg-red-50 border border-red-100 hover:bg-red-100'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        {notification.type === 'inquiry_received' && (
                          <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        )}
                        {notification.type === 'project_created' && (
                          <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        )}
                        {notification.type === 'project_updated' && (
                          <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        )}
                        {notification.type === 'project_deleted' && (
                          <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-800'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto py-6 px-4">
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Total Projects</p>
                  <p className="text-3xl font-bold mt-1">
                    {projects.length} {/* Changed from statistics.totalProjects to projects.length */}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-red-100 text-red-500">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Active Projects</p>
                  <p className="text-3xl font-bold mt-1">{statistics.activeProjects}</p>
                </div>
                <div className="p-2 rounded-full bg-green-100 text-green-500">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Total Budget</p>
                  <p className="text-3xl font-bold mt-1">${statistics.totalBudget.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-full bg-blue-100 text-blue-500">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Upcoming Deadlines</p>
                  <p className="text-3xl font-bold mt-1">{statistics.upcomingDeadlines}</p>
                </div>
                <div className="p-2 rounded-full bg-yellow-100 text-yellow-500">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Project Timeline */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">New Projects Timeline</h2>
                <div className="h-64 flex items-end space-x-6">
                  {timelineData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full bg-red-400 rounded-t"
                        style={{ height: `${(item.value / Math.max(...timelineData.map(d => d.value) || 1)) * 180}px` }}
                      ></div>
                      <p className="mt-2 text-sm text-gray-600">{item.month}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Status Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Project Status Distribution</h2>
                <div className="flex justify-center">
                  <div className="relative h-64 w-64">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      {/* Create pie chart segments */}
                      {statusData.map((status, index) => {
                        // Calculate the segment's position
                        let cumulativePercentage = 0;
                        for (let i = 0; i < index; i++) {
                          cumulativePercentage += statusData[i].percentage;
                        }
                        
                        const startAngle = (cumulativePercentage / 100) * 360;
                        const endAngle = ((cumulativePercentage + status.percentage) / 100) * 360;
                        
                        // Convert to radians
                        const startRad = (startAngle - 90) * Math.PI / 180;
                        const endRad = (endAngle - 90) * Math.PI / 180;
                        
                        // Calculate coordinates
                        const x1 = 50 + 40 * Math.cos(startRad);
                        const y1 = 50 + 40 * Math.sin(startRad);
                        const x2 = 50 + 40 * Math.cos(endRad);
                        const y2 = 50 + 40 * Math.sin(endRad);
                        
                        // Determine if the arc is large (> 180 degrees)
                        const largeArcFlag = status.percentage > 50 ? 1 : 0;
                        
                        // Text positioning (middle of segment)
                        const labelRad = (startRad + endRad) / 2;
                        const labelX = 50 + 55 * Math.cos(labelRad);
                        const labelY = 50 + 55 * Math.sin(labelRad);
                        
                        return (
                          <g key={index}>
                            <path
                              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                              fill={status.color}
                            />
                            <text
                              x={labelX}
                              y={labelY}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="3"
                              fill="#ffffff"
                            >
                              {status.percentage}%
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  
                  <div className="ml-6 flex flex-col justify-center space-y-2">
                    {statusData.map((status, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: status.color }}
                        ></div>
                        <span className="text-sm text-gray-600">{status.status}: {status.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Projects Table */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Projects Details</h2>
                
                {/* Search bar */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search by ID, location or status" 
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-red-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                 
                  <button 
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create a Project
                  </button>
                </div>
              </div>
              
              {/* Add tabs in the Projects section */}
              <div className="flex space-x-4 mb-6">
                <button
                  className={`px-4 py-2 rounded-md ${selectedTab === 'active' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setSelectedTab('active')}
                >
                  In Progress Projects
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${selectedTab === 'completed' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setSelectedTab('completed')}
                >
                  Completed Projects
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${selectedTab === 'onHold' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setSelectedTab('onHold')}
                >
                  On Hold Projects
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${selectedTab === 'pending' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setSelectedTab('pending')}
                >
                  Pending Projects
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${selectedTab === 'cancelled' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setSelectedTab('cancelled')}
                >
                  Cancelled Projects
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${selectedTab === 'all' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setSelectedTab('all')}
                >
                  All Projects
                </button>
              </div>
              
              {/* Display error message if any */}
              {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p>{error}</p>
                </div>
              )}
              
              {/* Display loading indicator */}
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Project ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completion
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Budget
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deadline
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProjects.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                            No projects found
                          </td>
                        </tr>
                      ) : (
                        filteredProjects.map((project) => (
                          <tr 
                            key={project._id} 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/projects/${project._id}`)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{project.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)} text-white`}>
                                {project.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{project.location}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                                <div 
                                  className="bg-red-400 h-2.5 rounded-full" 
                                  style={{ width: `${project.completion || 0}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500">{project.completion || 0}%</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${parseFloat(project.budget || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/projects/${project._id}`);
                                }} 
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(project);
                                }}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDelete(project);
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {isEditModalOpen && editingProject && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Edit Project</h2>
        <button 
          onClick={() => setIsEditModalOpen(false)}
          className="text-gray-400 hover:text-gray-500"
        >
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleUpdate}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input
              type="text"
              name="name"
              value={editingProject.name}
              onChange={handleEditInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <input
              type="text"
              name="type"
              value={editingProject.type}
              onChange={handleEditInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={editingProject.location}
              onChange={handleEditInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
  <input
    type="date"
    name="startDate"
    value={editingProject.startDate}
    onChange={handleEditInputChange}
    disabled={startDateDisabled}
    className={`w-full border border-gray-300 rounded-md p-2 ${startDateDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
  />
  {startDateDisabled && (
    <p className="text-xs text-gray-500 mt-1">
      Start date cannot be changed for {editingProject.status} projects
    </p>
  )}
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
  <input
    type="date"
    name="endDate"
    value={editingProject.endDate}
    onChange={handleEditInputChange}
    disabled={endDateDisabled}
    className={`w-full border border-gray-300 rounded-md p-2 ${endDateDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
  />
  {endDateDisabled && (
    <p className="text-xs text-gray-500 mt-1">
      End date cannot be changed for {editingProject.status} projects
    </p>
  )}
</div>
          <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
  <select
    name="status"
    value={editingProject.status}
    onChange={handleEditInputChange}
    className="w-full border border-gray-300 rounded-md p-2"
  >
    <option value="Pending">Pending</option>
    <option value="In Progress">In Progress</option>
    <option value="On Hold">On Hold</option>
    <option value="Completed">Completed</option>
    <option value="Cancelled">Cancelled</option>
  </select>
</div>
        </div>

        <div className="flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={() => setIsEditModalOpen(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Create New Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Create New Project</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Project Name */}
                <div className="col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Project ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newProject.name}
                    onChange={handleInputChange}
                    onFocus={() => setNameFocus(true)}
                    onBlur={() => setNameFocus(false)}
                    aria-invalid={validName ? "false" : "true"}
                    className={`mt-1 block w-full border ${
                      nameFocus && !validName ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    placeholder="Enter Project ID"
                    required
                  />
                  {nameFocus && !validName && (
                    <p className="text-red-500 text-sm mt-1">
                      3-50 characters, letters, numbers, spaces and hyphens only
                    </p>
                  )}
                </div>
                
                {/* Project Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={newProject.type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Infrastructure">Infrastructure</option>
                  </select>
                </div>
                
                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={newProject.location}
                    onChange={handleInputChange}
                    onFocus={() => setLocationFocus(true)}
                    onBlur={() => setLocationFocus(false)}
                    aria-invalid={validLocation ? "false" : "true"}
                    className={`mt-1 block w-full border ${
                      locationFocus && !validLocation ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    placeholder="Enter project location"
                    required
                  />
                  {locationFocus && !validLocation && (
                    <p className="text-red-500 text-sm mt-1">
                      3-100 characters, letters, numbers, spaces and basic punctuation only
                    </p>
                  )}
                </div>
                
                {/* Start Date */}
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    min={new Date().toISOString().split('T')[0]}
                    value={newProject.startDate}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border ${
                      startDateError ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    required
                  />
                  {startDateError && (
                    <p className="text-red-500 text-sm mt-1">{startDateError}</p>
                  )}
                </div>
                
                {/* End Date */}
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    min={newProject.startDate || new Date().toISOString().split('T')[0]}
                    value={newProject.endDate}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border ${
                      endDateError ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    required
                  />
                  {endDateError && (
                    <p className="text-red-500 text-sm mt-1">{endDateError}</p>
                  )}
                </div>
                
                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={newProject.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                
                {/* Budget */}
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                    Budget (USD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    value={newProject.budget}
                    onChange={handleInputChange}
                    onFocus={() => setBudgetFocus(true)}
                    onBlur={() => setBudgetFocus(false)}
                    aria-invalid={validBudget ? "false" : "true"}
                    className={`mt-1 block w-full border ${
                      budgetFocus && !validBudget ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    placeholder="Enter budget"
                    required
                  />
                  {budgetFocus && !validBudget && (
                    <p className="text-red-500 text-sm mt-1">
                      Please enter a valid budget amount
                    </p>
                  )}
                </div>
                
                {/* Project Manager */}
                <div>
                  <label htmlFor="manager" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Manager <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="manager"
                    name="manager"
                    value={newProject.manager}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="">Select a Project Manager</option>
                    <option value="Pankaja Siriwardhana">Pankaja Siriwardhana Site Manager</option>
                    <option value="Lahiru Thilakarathne">Lahiru Thilakarathne Admin</option>
                  </select>
                </div>
                
                {/* Project Description */}
                <div className="col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={newProject.description}
                    onChange={handleInputChange}
                    onFocus={() => setDescriptionFocus(true)}
                    onBlur={() => setDescriptionFocus(false)}
                    aria-invalid={validDescription ? "false" : "true"}
                    className={`mt-1 block w-full border ${
                      descriptionFocus && !validDescription ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500`}
                    placeholder="Enter project description"
                    required
                  />
                  {descriptionFocus && !validDescription && (
                    <p className="text-red-500 text-sm mt-1">
                      10-500 characters, letters, numbers, spaces and basic punctuation only
                    </p>
                  )}
                </div>
              </div>
              
              {/* Form Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete the project "{projectToDelete.name}"?</p>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteProject}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstructionDashboard;