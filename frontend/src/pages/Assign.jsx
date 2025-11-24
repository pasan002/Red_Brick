import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/images/logo.png';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const inputClassName = "w-full px-4 py-2 rounded-lg border-2 border-red-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all";

const LabourAssignment = () => {
  const [formData, setFormData] = useState({
    projectCode: '',
    taskCode: '',
    labourType: '',
    numberOfLabourers: '',
    assignmentDate: '',
    siteName: '',
    supervisor: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:4000/api/labour-assignments');
      setAssignments(response.data);
      setFilteredAssignments(response.data);
    } catch (error) {
      setError('Error fetching assignments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/tasks');
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, []);

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      projectCode: assignment.projectCode,
      taskCode: assignment.taskCode,
      labourType: assignment.labourType,
      numberOfLabourers: assignment.numberOfLabourers,
      assignmentDate: new Date(assignment.assignmentDate).toISOString().split('T')[0],
      siteName: assignment.siteName,
      supervisor: assignment.supervisor
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await axios.delete(`http://localhost:4000/api/labour-assignments/${id}`);
        setSuccess('Assignment deleted successfully');
        await fetchAssignments();
      } catch (error) {
        setError(error.response?.data?.message || 'Error deleting assignment');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isEditing) {
        await axios.put(`http://localhost:4000/api/labour-assignments/${editingAssignment._id}`, formData);
        setSuccess('Labour assignment updated successfully!');
      } else {
        await axios.post('http://localhost:4000/api/labour-assignments', formData);
        setSuccess('Labour assignment created successfully!');
      }
      
      setFormData({
        projectCode: '',
        taskCode: '',
        labourType: '',
        numberOfLabourers: '',
        assignmentDate: '',
        siteName: '',
        supervisor: ''
      });
      setIsEditing(false);
      setEditingAssignment(null);
      await fetchAssignments();
    } catch (error) {
      setError(error.response?.data?.message || 'Error processing assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      projectCode: '',
      taskCode: '',
      labourType: '',
      numberOfLabourers: '',
      assignmentDate: '',
      siteName: '',
      supervisor: ''
    });
    setIsEditing(false);
    setEditingAssignment(null);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = assignments.filter(assignment => 
      assignment.projectCode.toLowerCase().includes(term) ||
      assignment.taskCode.toLowerCase().includes(term)
    );
    setFilteredAssignments(filtered);
  };

  const downloadPDF = () => {
    if (!filteredAssignments || filteredAssignments.length === 0) {
      setError('No data available to download');
      return;
    }

    try {
      // Create PDF document in landscape orientation
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      // Define colors
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
        const textY = headerHeight / 2 + 2; // Center the text
        
        doc.addImage(logoBase64, 'PNG', 35, logoY, logoWidth, logoHeight);
        
        // Add company name in header
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text('Red Brick Constructions', 35 + logoWidth + 10, textY);
        
        // Add generated date - top right
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - 15, 16, { align: 'right' });
        
        // Add title section
        doc.setTextColor(...textGray);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Labour Assignment Report', 35, 45);
        
        // Add total count
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total assignments: ${filteredAssignments.length}`, pageWidth - 35, 45, { align: 'right' });
        
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
          { header: 'Labour Type', dataKey: 'labourType' },
          { header: 'Number', dataKey: 'numberOfLabourers' },
          { header: 'Assignment Date', dataKey: 'assignmentDate' },
          { header: 'Site Name', dataKey: 'siteName' },
          { header: 'Supervisor', dataKey: 'supervisor' },
        ];
        
        // Prepare rows
        const rows = filteredAssignments.map(assignment => {
          return {
            projectCode: assignment.projectCode,
            taskCode: assignment.taskCode,
            labourType: assignment.labourType,
            numberOfLabourers: assignment.numberOfLabourers,
            assignmentDate: new Date(assignment.assignmentDate).toLocaleDateString(),
            siteName: assignment.siteName,
            supervisor: assignment.supervisor
          };
        });
        
        // Create table with styling
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
            overflow: 'linebreak',
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
        const fileName = `labour-assignments-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        setSuccess('PDF downloaded successfully!');
        setTimeout(() => setSuccess(''), 3000);
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
        doc.text('Labour Assignment Report', 35, 45);
        
        // Add total count
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total assignments: ${filteredAssignments.length}`, pageWidth - 35, 45, { align: 'right' });
        
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
          { header: 'Labour Type', dataKey: 'labourType' },
          { header: 'Number', dataKey: 'numberOfLabourers' },
          { header: 'Assignment Date', dataKey: 'assignmentDate' },
          { header: 'Site Name', dataKey: 'siteName' },
          { header: 'Supervisor', dataKey: 'supervisor' },
        ];
        
        // Prepare rows
        const rows = filteredAssignments.map(assignment => {
          return {
            projectCode: assignment.projectCode,
            taskCode: assignment.taskCode,
            labourType: assignment.labourType,
            numberOfLabourers: assignment.numberOfLabourers,
            assignmentDate: new Date(assignment.assignmentDate).toLocaleDateString(),
            siteName: assignment.siteName,
            supervisor: assignment.supervisor
          };
        });
        
        // Create table with styling
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
            overflow: 'linebreak',
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
        const fileName = `labour-assignments-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        setSuccess('PDF downloaded successfully!');
        setTimeout(() => setSuccess(''), 3000);
      };
      
    } catch (error) {
      console.error('PDF generation error:', error);
      setError(`Failed to generate PDF: ${error.message}`);
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Labour Assignment</h1>

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
                {/* Project Code */}
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
                </div>

                {/* Task Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Code</label>
                  <select 
                    name="taskCode"
                    value={formData.taskCode}
                    onChange={handleInputChange}
                    className={inputClassName}
                    required
                  >
                    <option value="">Select task...</option>
                    {tasks.map((task) => (
                      <option key={task._id} value={task.taskCode}>
                        {task.taskCode} - {task.taskName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Labour Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Labour Type</label>
                  <select 
                    name="labourType"
                    value={formData.labourType}
                    onChange={handleInputChange}
                    className={inputClassName}
                    required
                  >
                    <option value="">Select type...</option>
                    <option value="Mason">Mason</option>
                    <option value="Helper">Helper</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Steel Fixer">Steel Fixer</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Painter">Painter</option>
                  </select>
                </div>

                {/* Number of Labourers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Labourers</label>
                  <input 
                    type="number"
                    name="numberOfLabourers"
                    value={formData.numberOfLabourers}
                    onChange={handleInputChange}
                    className={inputClassName}
                    placeholder="Enter number of labourers"
                    min="1"
                    required
                  />
                </div>

                {/* Assignment Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Date</label>
                  <input 
                    type="date"
                    name="assignmentDate"
                    value={formData.assignmentDate}
                    onChange={handleInputChange}
                    className={inputClassName}
                    required
                  />
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
                    placeholder="Enter site name"
                    required
                  />
                </div>

                {/* Supervisor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor</label>
                  <input 
                    type="text"
                    name="supervisor"
                    value={formData.supervisor}
                    onChange={handleInputChange}
                    className={inputClassName}
                    placeholder="Enter supervisor name"
                    required
                  />
                </div>

                {/* Submit Button */}
                <div className="col-span-full flex justify-end gap-4 mt-4">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg font-medium transition-all shadow-sm hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-2 bg-red-600 text-white rounded-lg font-medium transition-all shadow-sm ${
                      loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                    }`}
                  >
                    {loading ? 'Processing...' : isEditing ? 'Update Assignment' : 'Assign Labour'}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Labour Assignments</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={downloadPDF}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all shadow-sm flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
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
              </div>

              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                </div>
              ) : (searchTerm ? filteredAssignments : assignments).length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {searchTerm ? "No matching assignments found" : "No assignments found"}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Labour Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number of Labourers</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(searchTerm ? filteredAssignments : assignments).map((assignment) => (
                        <tr key={assignment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assignment.projectCode}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assignment.taskCode}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assignment.labourType}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assignment.numberOfLabourers}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(assignment.assignmentDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assignment.siteName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assignment.supervisor}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                            <button
                              onClick={() => handleEdit(assignment)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(assignment._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
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
    </div>
  );
};

export default LabourAssignment;