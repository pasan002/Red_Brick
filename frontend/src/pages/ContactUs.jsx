import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import Footer from '../components/Footer';
import Header from '../components/Header';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
    // Reset form after submission
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-4xl font-bold text-[#6b1d1d] mb-6">Contact Us</h1>
        
        <p className="text-gray-700 mb-10">
          Please feel free to contact us for any clarifications or additional information. Our team will contact you soon.
        </p>
        
        <div className="flex flex-col md:flex-row gap-10">
          {/* Contact Information */}
          <div className="w-full md:w-1/2">
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-[#6b1d1d] uppercase mb-4">REDBRICK STUDIO (HEAD OFFICE AND DESIGN STUDIO)</h2>
              <div className="flex items-start mb-2">
                <FaMapMarkerAlt className="text-[#6b1d1d] mt-1 mr-2 flex-shrink-0" />
                <p>No. 241/4b, Mahawela Road, Pahalabiyanvila, Kadawatha, 11850.</p>
              </div>
              <div className="flex items-center mb-2">
                <FaPhone className="text-[#6b1d1d] mr-2 flex-shrink-0" />
                <p>+94 11 292 2372</p>
              </div>
              <div className="flex items-center">
                <FaPhone className="text-[#6b1d1d] mr-2 flex-shrink-0" />
                <p>+94 77 721 1295</p>
              </div>
            </div>
            
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-[#6b1d1d] uppercase mb-4">CORPORATE OFFICE</h2>
              <div className="flex items-start mb-2">
                <FaMapMarkerAlt className="text-[#6b1d1d] mt-1 mr-2 flex-shrink-0" />
                <p>No. 42, 6th lane, Araliya Uyana, Depanama, Pannipitiya</p>
              </div>
              <div className="flex items-center mb-2">
                <FaPhone className="text-[#6b1d1d] mr-2 flex-shrink-0" />
                <p>+94 71 333 1905</p>
              </div>
              <div className="flex items-center">
                <FaPhone className="text-[#6b1d1d] mr-2 flex-shrink-0" />
                <p>+94 77 721 1295</p>
              </div>
            </div>
            
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-[#6b1d1d] uppercase mb-4">OVERSEAS OFFICE</h2>
              <div className="flex items-start mb-2">
                <FaMapMarkerAlt className="text-[#6b1d1d] mt-1 mr-2 flex-shrink-0" />
                <p>No. 6, Aldridge court, Hampton Park, VIC 3976, Australia</p>
              </div>
              <div className="flex items-center mb-6">
                <FaPhone className="text-[#6b1d1d] mr-2 flex-shrink-0" />
                <p>+61 44 734 8875</p>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-[#6b1d1d] mr-2 flex-shrink-0" />
                <p>redbrickteam@gmail.com</p>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="w-full md:w-1/2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6b1d1d]"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6b1d1d]"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-gray-700 mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6b1d1d]"
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#e97c7c] hover:bg-[#d06b6b] text-white font-medium rounded-md transition duration-300 ease-in-out uppercase"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactUs; 