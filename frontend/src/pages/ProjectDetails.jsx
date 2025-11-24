import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/projects/${id}`);
        setProject(response.data);
      } catch (err) {
        setError('Failed to load project details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${project.name} - Project Details</title>
          <style>
            @media print {
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              .print-header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #dc2626;
                padding-bottom: 20px;
              }
              .print-title {
                font-size: 24px;
                color: #dc2626;
                margin-bottom: 10px;
              }
              .print-section {
                margin-bottom: 20px;
              }
              .print-section-title {
                font-size: 18px;
                color: #dc2626;
                margin-bottom: 10px;
                border-bottom: 1px solid #eee;
                padding-bottom: 5px;
              }
              .print-info {
                margin-bottom: 15px;
              }
              .print-label {
                font-weight: bold;
                color: #666;
              }
              .print-value {
                margin-left: 10px;
              }
              .print-status {
                display: inline-block;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .print-progress {
                width: 100%;
                height: 20px;
                background-color: #f3f4f6;
                border-radius: 10px;
                overflow: hidden;
                margin-top: 10px;
              }
              .print-progress-bar {
                height: 100%;
                background: linear-gradient(to right, #dc2626, #ef4444);
                border-radius: 10px;
              }
              @page {
                margin: 1cm;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1 class="print-title">${project.name}</h1>
            <div class="print-status" style="background-color: ${
              project.status === 'In Progress' ? '#fee2e2' : 
              project.status === 'Completed' ? '#dcfce7' : 
              '#fef3c7'
            }; color: ${
              project.status === 'In Progress' ? '#dc2626' : 
              project.status === 'Completed' ? '#166534' : 
              '#92400e'
            };">
              ${project.status}
            </div>
          </div>

          <div class="print-section">
            <h2 class="print-section-title">Project Information</h2>
            <div class="print-info">
              <span class="print-label">Type:</span>
              <span class="print-value">${project.type}</span>
            </div>
            <div class="print-info">
              <span class="print-label">Location:</span>
              <span class="print-value">${project.location}</span>
            </div>
            <div class="print-info">
              <span class="print-label">Timeline:</span>
              <span class="print-value">
                ${new Date(project.startDate).toLocaleDateString()} - ${new Date(project.endDate).toLocaleDateString()}
              </span>
            </div>
            <div class="print-info">
              <span class="print-label">Budget:</span>
              <span class="print-value">$${parseFloat(project.budget).toLocaleString()}</span>
            </div>
          </div>

          <div class="print-section">
            <h2 class="print-section-title">Description</h2>
            <p>${project.description}</p>
          </div>

          <div class="print-section">
            <h2 class="print-section-title">Progress</h2>
            <div class="print-info">
              <span class="print-label">Completion:</span>
              <span class="print-value">${project.completion || 0}%</span>
            </div>
            <div class="print-progress">
              <div class="print-progress-bar" style="width: ${project.completion || 0}%"></div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-gray-50 to-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 to-white flex items-center justify-center">
      <div className="text-red-500 font-medium text-lg">{error}</div>
    </div>
  );

  if (!project) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm">
        {/* Header with Back Button and Print */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Document
            </button>
          </div>

          {/* Project Title and Type */}
          <div className="mt-6">
            <h1 className="text-4xl font-bold text-gray-900">{project.name}</h1>
            <div className="flex items-center mt-3 space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium
                ${project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'}`}
              >
                {project.status}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{project.type}</span>
            </div>
          </div>
        </div>

        {/* Project Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* Location Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Location</h3>
            </div>
            <p className="text-gray-600">{project.location}</p>
          </div>

          {/* Timeline Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
            </div>
            <p className="text-gray-600">
              {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
            </p>
          </div>

          {/* Budget Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Budget</h3>
            </div>
            <p className="text-gray-600">${parseFloat(project.budget).toLocaleString()}</p>
          </div>
        </div>

        {/* Project Description */}
        <div className="p-6 border-t border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Description</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{project.description}</p>
        </div>

        {/* Project Progress */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
            <span className="text-2xl font-bold text-red-500">{project.completion || 0}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4">
            <div
              className="bg-red-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${project.completion || 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;