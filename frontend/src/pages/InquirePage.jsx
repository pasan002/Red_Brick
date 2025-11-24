import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const InquirePage = () => {
  const [selectedPackage, setSelectedPackage] = useState('Design & Build');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  const handlePackageChange = (e) => {
    setSelectedPackage(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    
    try {
      // Create the inquiry
      const response = await axios.post('http://localhost:4000/api/inquiries', {
        selectedPackage,
        name: formData.name,
        email: formData.email,
        message: formData.message
      });
      
      if (response.data.success) {
        // Create a notification for the admin
        try {
          await axios.post('http://localhost:4000/api/notifications', {
            message: `New inquiry from ${formData.name} about ${selectedPackage}`,
            type: 'inquiry_received',
            inquiryId: response.data.data._id
          });
        } catch (notificationError) {
          console.error('Error creating notification:', notificationError);
          // Continue with form submission even if notification fails
        }
        
        setStatus({
          type: 'success',
          message: 'Your inquiry has been submitted successfully! We will contact you soon.'
        });
        // Reset form after successful submission
        setFormData({ name: '', email: '', message: '' });
        setSelectedPackage('Design & Build');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to submit inquiry. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Inquiry Form Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left side - Form title and contact info */}
          <div>
            <h2 className="text-[#531914] text-3xl font-bold mb-6">Inquire Now</h2>
            <p className="text-[#531914] mb-6">
              Please submit your inquiry here. Our team will contact you soon.
            </p>
            
            <div className="flex items-start mb-4">
              <div className="mr-2 text-[#531914]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-[#531914]">No. 241/4b, Mahawela Road, Pahalabiyenvila, Kadawatha, 11850.</p>
            </div>
            
            <div className="flex items-center mb-4">
              <div className="mr-2 text-[#531914]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <p className="text-[#531914]">+ 94 777 211 295</p>
            </div>
            
            <div className="flex items-center">
              <div className="mr-2 text-[#531914]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-[#531914]">redbrickteam@gmail.com</p>
            </div>
          </div>
          
          {/* Right side - Form */}
          <div>
            {status.message && (
              <div className={`mb-4 p-3 rounded ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {status.message}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-[#531914] mb-2">Select the package</label>
                <div className="relative">
                  <select 
                    value={selectedPackage}
                    onChange={handlePackageChange}
                    className="w-full p-3 border border-gray-300 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    <option>Design & Build</option>
                    <option>Build Only</option>
                    <option>Renovation/Maintenance</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-[#531914] mb-2">Name</label>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-[#531914] mb-2">Email</label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-[#531914] mb-2">Message</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="5"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
                  required
                ></textarea>
              </div>
              
              <button 
                type="submit"
                className="w-full py-3 px-4 bg-red-500 text-white font-medium rounded hover:bg-red-600 transition duration-200"
                disabled={loading}
              >
                {loading ? 'SENDING...' : 'SEND'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default InquirePage; 