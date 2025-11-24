import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const InquiriesPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('InquiriesPage component mounted');
    
    const fetchInquiries = async () => {
      try {
        console.log('Attempting to fetch inquiries...');
        // Check if user is authenticated
        const authToken = localStorage.getItem('authToken');
        console.log('Auth token present:', !!authToken);
        
        // Attempt to fetch inquiries without authentication requirement first
        const response = await axios.get('http://localhost:4000/api/inquiries');
        
        console.log('Inquiry response:', response.data);
        
        if (response.data.success) {
          setInquiries(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching inquiries:', err);
        setError('Failed to load inquiries. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [navigate]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time for display
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // Open inquiry details modal
  const openInquiryDetails = (inquiry) => {
    setSelectedInquiry(inquiry);
  };

  // Close inquiry details modal
  const closeInquiryDetails = () => {
    setSelectedInquiry(null);
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="bg-[#FFF8F8] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-light text-[#531914]">Customer Inquiries</h2>
          <button 
            onClick={() => navigate(-1)}
            className="bg-white hover:bg-gray-50 text-[#531914] font-medium py-2 px-4 rounded-md shadow-sm flex items-center transition-all border border-[#FFEDED]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
        </div>
        
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-16 flex justify-center border border-[#FFEDED]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d56262]"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-8 border border-[#FFEDED]">
            <div className="bg-[#FFEDED] border-l-4 border-[#d56262] p-4 rounded">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#d56262] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[#531914]">{error}</p>
              </div>
            </div>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-16 text-center border border-[#FFEDED]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#FFCACA] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-[#531914] mb-2 text-lg">No customer inquiries found yet.</p>
            <p className="text-gray-600 max-w-md mx-auto">Once customers submit inquiries through the contact form, they will appear here.</p>
            <Link to="/inquire" className="inline-block mt-6 bg-[#d56262] text-white px-6 py-2 rounded-md hover:bg-[#c15858] transition-colors shadow-sm">
              Go to Inquiry Form
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inquiries.map((inquiry) => (
              <div 
                key={inquiry._id} 
                className="bg-white rounded-lg shadow-sm border border-[#FFEDED] overflow-hidden hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1 flex flex-col"
                onClick={() => openInquiryDetails(inquiry)}
              >
                <div className="p-1 bg-gradient-to-r from-[#d56262] to-[#f3a7a7]"></div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 rounded-full bg-[#FFEDED] flex items-center justify-center text-[#d56262] font-medium">
                        {getInitials(inquiry.name)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-[#531914] truncate">{inquiry.name}</h3>
                      <a 
                        href={`mailto:${inquiry.email}`} 
                        className="text-blue-600 hover:underline text-sm block truncate" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        {inquiry.email}
                      </a>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FFEDED] text-[#d56262]">
                      {inquiry.packageType}
                    </span>
                  </div>

                  <div className="relative flex-1 flex flex-col">
                    <div className="mb-2 flex items-center text-xs text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#d56262]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <span>Customer Inquiry</span>
                    </div>
                    <div className="absolute left-0 top-8 bottom-0 w-[2px] bg-[#FFEDED]"></div>
                    <div className="pl-4 mb-5 flex-1">
                      <p className="text-gray-600 text-sm line-clamp-4 mb-1">{inquiry.message}</p>
                      <button className="text-[#d56262] text-xs hover:underline mt-2 focus:outline-none" onClick={(e) => {e.stopPropagation(); openInquiryDetails(inquiry);}}>
                        Read more
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-[#FFEDED]">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#d56262]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(inquiry.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#d56262]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatTime(inquiry.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    
      {/* Inquiry Details Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#FFEDED]">
            <div className="p-1 bg-gradient-to-r from-[#d56262] to-[#f3a7a7]"></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#FFEDED] flex items-center justify-center text-[#d56262] font-medium mr-3">
                    {getInitials(selectedInquiry.name)}
                  </div>
                  <h3 className="text-xl font-medium text-[#531914]">Inquiry Details</h3>
                </div>
                <button 
                  onClick={closeInquiryDetails}
                  className="text-gray-500 hover:text-[#531914]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-5">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Customer Name</p>
                    <p className="font-medium text-[#531914] text-lg">{selectedInquiry.name}</p>
                  </div>
                  <span className="px-3 py-1 bg-[#FFEDED] text-[#d56262] rounded-full text-sm">
                    {selectedInquiry.packageType}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <a href={`mailto:${selectedInquiry.email}`} className="text-blue-600 hover:underline">
                    {selectedInquiry.email}
                  </a>
                </div>
                
                <div>
                  <div className="flex items-center space-x-1 text-[#d56262] mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-500">Submitted on</p>
                  </div>
                  <p className="text-[#531914]">{formatDate(selectedInquiry.createdAt)} at {formatTime(selectedInquiry.createdAt)}</p>
                </div>
                
                <div>
                  <div className="flex items-center space-x-1 text-[#d56262] mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p className="text-sm text-gray-500">Message</p>
                  </div>
                  <div className="bg-[#FFF8F8] p-5 rounded-md whitespace-pre-wrap border border-[#FFEDED] text-gray-700">
                    {selectedInquiry.message}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={closeInquiryDetails}
                  className="px-4 py-2 border border-[#FFEDED] rounded-md text-[#531914] hover:bg-[#FFF8F8] transition-colors"
                >
                  Close
                </button>
                <a
                  href={`mailto:${selectedInquiry.email}?subject=RE: Your Inquiry about ${selectedInquiry.packageType}`}
                  className="px-4 py-2 bg-[#d56262] text-white rounded-md hover:bg-[#c15858] transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Reply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiriesPage; 