import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/images/logo.png';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const inputClassName = "w-full px-4 py-2 rounded-lg border-2 border-red-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all";

const TaskManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectCode: '',
    taskCode: '',
    taskType: '',
    floor: '',
    startDate: '',
    endDate: '',
    siteName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [validationErrors, setValidationErrors] = useState({
    projectCode: '',
    endDate: '',
    siteName: '',
    taskCode: ''
  });

  const validateProjectCode = (value) => {
    const projectCodeRegex = /^[A-Za-z0-9-/]{3,20}$/;
    if (!projectCodeRegex.test(value)) {
      return 'Project code must be 3-20 characters and can only contain letters, numbers, dashes, and slashes';
    }
    return '';
  };

  const validateTaskCode = (value) => {
    const taskCodeRegex = /^[A-Za-z0-9-/]{3,20}$/;
    if (!taskCodeRegex.test(value)) {
      return 'Task code must be 3-20 characters and can only contain letters, numbers, dashes, and slashes';
    }
    return '';
  };

  const validateEndDate = (endDate, startDate) => {
    if (!endDate || !startDate) return '';
    if (new Date(endDate) < new Date(startDate)) {
      return 'End date cannot be before start date';
    }
    return '';
  };

  const validateSiteName = (value) => {
    const siteNameRegex = /^[A-Za-z0-9\s]+$/;
    if (!siteNameRegex.test(value)) {
      return 'Site name can only contain letters, numbers, and spaces';
    }
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Live validation
    let error = '';
    switch (name) {
      case 'projectCode':
        error = validateProjectCode(value);
        setValidationErrors(prev => ({ ...prev, projectCode: error }));
        break;
      case 'taskCode':
        error = validateTaskCode(value);
        setValidationErrors(prev => ({ ...prev, taskCode: error }));
        break;
      case 'endDate':
        error = validateEndDate(value, formData.startDate);
        setValidationErrors(prev => ({ ...prev, endDate: error }));
        break;
      case 'startDate':
        error = validateEndDate(formData.endDate, value);
        setValidationErrors(prev => ({ ...prev, endDate: error }));
        break;
      case 'siteName':
        error = validateSiteName(value);
        setValidationErrors(prev => ({ ...prev, siteName: error }));
        break;
      default:
        break;
    }
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching tasks...');
      const response = await axios.get('http://localhost:4000/api/tasks');
      console.log('Tasks received:', response.data);
      setTasks(response.data);
      setFilteredTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Error fetching tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Component mounted, fetching tasks...');
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check all validations
    const projectCodeError = validateProjectCode(formData.projectCode);
    const taskCodeError = validateTaskCode(formData.taskCode);
    const endDateError = validateEndDate(formData.endDate, formData.startDate);
    const siteNameError = validateSiteName(formData.siteName);

    setValidationErrors({
      projectCode: projectCodeError,
      taskCode: taskCodeError,
      endDate: endDateError,
      siteName: siteNameError
    });

    // If there are any validation errors, don't submit
    if (projectCodeError || taskCodeError || endDateError || siteNameError) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Submitting form data:', formData); // Add this for debugging
      const response = await axios.post('http://localhost:4000/api/tasks', formData);
      console.log('Server response:', response.data); // Add this for debugging
      setSuccess('Task created successfully!');
      setFormData({
        projectCode: '',
        taskCode: '',
        taskType: '',
        floor: '',
        startDate: '',
        endDate: '',
        siteName: ''
      });
      await fetchTasks(); // Add await here
    } catch (error) {
      console.error('Error details:', error); // Add this for debugging
      setError(error.response?.data?.message || 'Error creating task');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      projectCode: task.projectCode,
      taskCode: task.taskCode,
      taskType: task.taskType,
      floor: task.floor,
      startDate: new Date(task.startDate).toISOString().split('T')[0],
      endDate: new Date(task.endDate).toISOString().split('T')[0],
      siteName: task.siteName
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.put(`http://localhost:4000/api/tasks/${editingTask._id}`, formData);
      setSuccess('Task updated successfully!');
      setIsEditModalOpen(false);
      setEditingTask(null);
      fetchTasks();
      // Reset form
      setFormData({
        projectCode: '',
        taskCode: '',
        taskType: '',
        floor: '',
        startDate: '',
        endDate: '',
        siteName: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    setLoading(true);
    setError('');
    try {
      await axios.delete(`http://localhost:4000/api/tasks/${taskId}`);
      setSuccess('Task deleted successfully!');
      fetchTasks();
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting task');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = tasks.filter(task => 
      task.projectCode.toLowerCase().includes(term) ||
      task.taskCode.toLowerCase().includes(term)
    );
    setFilteredTasks(filtered);
  };

  const downloadPDF = () => {
    try {
      // Create PDF document in landscape orientation
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      // Define colors - Match the image exactly
      const primaryColor = [99, 0, 0]; // Dark red for header background
      const textGray = [50, 50, 50]; // Dark gray for text
      const lightBeige = [252, 234, 187]; // Light beige for table headers
      const lightCream = [255, 248, 235]; // Light cream for table rows
      
      // Get page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Add header background - dark red
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      // Add logo to the header - convert the imported logo to base64
      const logoImg = new Image();
      logoImg.src = logo;
      
      logoImg.onload = function() {
        // Once the image is loaded, continue with PDF generation
        // Create a canvas to draw the image and convert it to base64
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = logoImg.width;
        canvas.height = logoImg.height;
        ctx.drawImage(logoImg, 0, 0);
        
        // Get base64 representation
        const logoBase64 = canvas.toDataURL('image/png');
        
        // Add the logo - match the position in the image
        const logoHeight = 16; // Smaller logo
        const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
        
        // Calculate vertical positions to center-align logo and text
        const headerHeight = 25; // Total header height
        const logoY = (headerHeight - logoHeight) / 2; // Center the logo vertically
        const textY = headerHeight / 2 + 2; // Center the text (with slight adjustment for visual alignment)
        
        doc.addImage(logoBase64, 'PNG', 35, logoY, logoWidth, logoHeight);
        
        // Add company name in header - position to match image
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text('Red Brick Constructions', 35 + logoWidth + 10, textY);
        
        // Add generated date - match position in top right
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - 15, 16, { align: 'right' });
        
        // Add title section with white background - match the positioning
        doc.setTextColor(...textGray);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Task Management Report', 35, 45);
        
        // Add total count of tasks - match position
        const tasksToExport = searchTerm ? filteredTasks : tasks;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total tasks: ${tasksToExport.length}`, pageWidth - 35, 45, { align: 'right' });
        
        // If search is active, add search criteria
        if (searchTerm) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(`Filtered by: "${searchTerm}"`, 35, 50);
        }
        
        // Prepare columns with custom widths
        const columns = [
          { header: 'Project Code', dataKey: 'projectCode' },
          { header: 'Task Code', dataKey: 'taskCode' },
          { header: 'Task Type', dataKey: 'taskType' },
          { header: 'Floor', dataKey: 'floor' },
          { header: 'Start Date', dataKey: 'startDate' },
          { header: 'End Date', dataKey: 'endDate' },
          { header: 'Site Name', dataKey: 'siteName' },
        ];
        
        // Prepare rows
        const rows = tasksToExport.map(task => ({
          projectCode: task.projectCode,
          taskCode: task.taskCode,
          taskType: task.taskType,
          floor: task.floor,
          startDate: new Date(task.startDate).toLocaleDateString(),
          endDate: new Date(task.endDate).toLocaleDateString(),
          siteName: task.siteName
        }));
        
        // Create table with styling to match the image
        autoTable(doc, {
          head: [columns.map(col => col.header)],
          body: rows.map(row => columns.map(col => row[col.dataKey])),
          startY: 60, // Match the position in image
          theme: 'grid',
          tableWidth: 'auto',
          margin: { left: 35, right: 35 }, // Match the margins in image
          styles: {
            fontSize: 10,
            cellPadding: { top: 8, right: 5, bottom: 8, left: 5 },
            lineColor: [220, 220, 220],
            lineWidth: 0.1,
          },
          headStyles: {
            fillColor: [...lightBeige], // Match the beige color from image
            textColor: [...textGray],
            fontStyle: 'bold',
            halign: 'left',
          },
          bodyStyles: {
            fillColor: [...lightCream], // Match the cream color from image
          },
          alternateRowStyles: {
            fillColor: [...lightCream], // Keep all rows the same color like in image
          },
        });
        
        // Save the PDF
        const fileName = `task-list-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        setSuccess('PDF downloaded successfully!');
      };
      
      // Add error handler for logo loading
      logoImg.onerror = function() {
        console.error('Error loading logo image');
        generatePDFWithoutLogo();
      };
      
      // Fallback function to generate PDF without logo
      const generatePDFWithoutLogo = () => {
        // Add company name in header
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text('Red Brick Constructions', 35, 16);
        
        // Add generated date
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - 15, 16, { align: 'right' });
        
        // Add title
        doc.setTextColor(...textGray);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Task Management Report', 35, 45);
        
        // Add total count of tasks
        const tasksToExport = searchTerm ? filteredTasks : tasks;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total tasks: ${tasksToExport.length}`, pageWidth - 35, 45, { align: 'right' });
        
        // If search is active, add search criteria
        if (searchTerm) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(`Filtered by: "${searchTerm}"`, 35, 50);
        }
        
        // Prepare columns
        const columns = [
          { header: 'Project Code', dataKey: 'projectCode' },
          { header: 'Task Code', dataKey: 'taskCode' },
          { header: 'Task Type', dataKey: 'taskType' },
          { header: 'Floor', dataKey: 'floor' },
          { header: 'Start Date', dataKey: 'startDate' },
          { header: 'End Date', dataKey: 'endDate' },
          { header: 'Site Name', dataKey: 'siteName' },
        ];
        
        // Prepare rows
        const rows = tasksToExport.map(task => ({
          projectCode: task.projectCode,
          taskCode: task.taskCode,
          taskType: task.taskType,
          floor: task.floor,
          startDate: new Date(task.startDate).toLocaleDateString(),
          endDate: new Date(task.endDate).toLocaleDateString(),
          siteName: task.siteName
        }));
        
        // Create table with styling to match the image
        autoTable(doc, {
          head: [columns.map(col => col.header)],
          body: rows.map(row => columns.map(col => row[col.dataKey])),
          startY: 60,
          theme: 'grid',
          tableWidth: 'auto',
          margin: { left: 35, right: 35 },
          styles: {
            fontSize: 10,
            cellPadding: { top: 8, right: 5, bottom: 8, left: 5 },
            lineColor: [220, 220, 220],
            lineWidth: 0.1,
          },
          headStyles: {
            fillColor: [...lightBeige],
            textColor: [...textGray],
            fontStyle: 'bold',
            halign: 'left',
          },
          bodyStyles: {
            fillColor: [...lightCream],
          },
          alternateRowStyles: {
            fillColor: [...lightCream],
          },
        });
        
        // Save the PDF
        const fileName = `task-list-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        setSuccess('PDF downloaded successfully!');
      };
      
    } catch (error) {
      console.error('PDF generation error:', error);
      setError(`Failed to generate PDF: ${error.message}`);
    }
  };

  const EditModal = () => (
    <AnimatePresence>
      {isEditModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl"
          >
            <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Code</label>
                <input 
                  type="text"
                  name="projectCode"
                  value={formData.projectCode}
                  onChange={handleInputChange}
                  className={inputClassName}
                  placeholder="Enter project code"
                  required
                />
                {validationErrors.projectCode && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.projectCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Code</label>
                <input 
                  type="text"
                  name="taskCode"
                  value={formData.taskCode}
                  onChange={handleInputChange}
                  className={inputClassName}
                  placeholder="Enter task code"
                  required
                />
                {validationErrors.taskCode && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.taskCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
                <select 
                  name="taskType"
                  value={formData.taskType}
                  onChange={handleInputChange}
                  className={inputClassName}
                  required
                >
                  <option value="">Select type...</option>
                  <option value="Excavation">Excavation</option>
                  <option value="Footing concrete">Footing concrete</option>
                  <option value="Column">Column</option>
                  <option value="Beam">Beam</option>
                  <option value="Slab">Slab</option>
                  <option value="Masonary">Masonary</option>
                  <option value="Plastering">Plastering</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
                <select 
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  className={inputClassName}
                  required
                >
                  <option value="">Select floor...</option>
                  <option value="Foundation">Foundation Level</option>
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="First Floor">First Floor</option>
                  <option value="Second Floor">Second Floor</option>
                  <option value="Third Floor">Third Floor</option>
                  <option value="Fourth Floor">Fourth Floor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input 
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input 
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={inputClassName}
                  required
                />
                {validationErrors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.endDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                <input 
                  type="text"
                  name="siteName"
                  value={formData.siteName}
                  onChange={handleInputChange}
                  className={inputClassName}
                  placeholder="Enter location"
                  required
                />
                {validationErrors.siteName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.siteName}</p>
                )}
              </div>

              <div className="col-span-full flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {loading ? 'Updating...' : 'Update Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Task Manager</h1>
              <div className="flex gap-3">
                <button
                  onClick={downloadPDF}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  <svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                  Download PDF
                </button>
                <Link 
                  to="/assign" 
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                >
                  <svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                    />
                  </svg>
                  Assign Labour
                </Link>
              </div>
            </div>

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6">
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                {error}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Project Code - New Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Code</label>
                  <input 
                    type="text"
                    name="projectCode"
                    value={formData.projectCode}
                    onChange={handleInputChange}
                    className={inputClassName}
                    placeholder="Enter project code"
                    required
                  />
                  {validationErrors.projectCode && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.projectCode}</p>
                  )}
                </div>

                {/* Task Code - Renamed Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Code</label>
                  <input 
                    type="text"
                    name="taskCode"
                    value={formData.taskCode}
                    onChange={handleInputChange}
                    className={`${inputClassName} ${validationErrors.taskCode ? 'border-red-500' : ''}`}
                    placeholder="Enter task code"
                    required
                  />
                  {validationErrors.taskCode && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.taskCode}</p>
                  )}
                </div>

                {/* Task Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
                  <select 
                    name="taskType"
                    value={formData.taskType}
                    onChange={handleInputChange}
                    className={inputClassName}
                    required
                  >
                    <option value="">Select type...</option>
                    <option value="Excavation">Excavation</option>
                    <option value="Footing concrete">Footing concrete</option>
                    <option value="Column">Column</option>
                    <option value="Beam">Beam</option>
                    <option value="Slab">Slab</option>
                    <option value="Masonary">Masonary</option>
                    <option value="Plastering">Plastering</option>
                  </select>
                </div>

                {/* Floor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
                  <select 
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    className={inputClassName}
                    required
                  >
                    <option value="">Select floor...</option>
                    <option value="Foundation">Foundation Level</option>
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="First Floor">First Floor</option>
                    <option value="Second Floor">Second Floor</option>
                    <option value="Third Floor">Third Floor</option>
                    <option value="Fourth Floor">Fourth Floor</option>
                  </select>
                </div>

                {/* Dates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input 
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={inputClassName}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input 
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={inputClassName}
                    required
                  />
                  {validationErrors.endDate && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.endDate}</p>
                  )}
                </div>

                {/* Site Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                  <input 
                    type="text"
                    name="siteName"
                    value={formData.siteName}
                    onChange={handleInputChange}
                    className={inputClassName}
                    placeholder="Enter location"
                    required
                  />
                  {validationErrors.siteName && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.siteName}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="col-span-full flex justify-end mt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-2 bg-red-600 text-white rounded-lg font-medium transition-all shadow-sm ${
                      loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                    }`}
                  >
                    {loading ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Task List</h2>
                <div className="relative w-72">
                  <input
                    type="text"
                    placeholder="Search by project or task code..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full px-4 py-2 pr-10 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  />
                  <svg
                    className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                </div>
              ) : (searchTerm ? filteredTasks : tasks).length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {searchTerm ? "No matching tasks found" : "No tasks found"}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site Name</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(searchTerm ? filteredTasks : tasks).map((task) => (
                        <tr key={task._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.projectCode}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.taskCode}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.taskType}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.floor}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(task.startDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(task.endDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.siteName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEdit(task)}
                              className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all duration-200"
                            >
                              <svg 
                                className="w-4 h-4 mr-1.5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth="2" 
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                                />
                              </svg>
                              Edit
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(task._id)}
                              className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200"
                            >
                              <svg 
                                className="w-4 h-4 mr-1.5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth="2" 
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                                />
                              </svg>
                              Delete
                            </motion.button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <EditModal />
    </div>
  );
};

export default TaskManager;