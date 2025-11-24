import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import buildingGraphic from '../assets/images/building_graphic.png';
import Footer from '../components/Footer';
import Header from '../components/Header';

const BuildingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const handleInquireClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/inquire');
    } else {
      navigate('/signin');
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-16">
          {/* Left side - Image */}
          <div className="md:w-1/2">
            <img src={buildingGraphic} alt="Modern house design" className="w-full" />
          </div>
          
          {/* Right side - Text content */}
          <div className="md:w-1/2">
            <div className="relative h-32 mb-2">
              <div 
                className="absolute top-0 left-0 text-[#F5F0E4] text-9xl font-semibold uppercase" 
                style={{ 
                  opacity: '0.2', 
                  zIndex: 0,
                  letterSpacing: '0.05em',
                  transform: 'scale(1.2)',
                  transformOrigin: 'left top'
                }}
              >
                BUILDING
              </div>
              <div 
                className="absolute top-0 left-0 text-[#C9B7A2] text-8xl font-semibold uppercase z-10"
              >
                BUILDING
              </div>
            </div>
            <h1 className="text-[#531914] text-3xl font-bold mb-6">Constructing Dreams, Brick by Brick</h1>
            
            <p className="text-[#531914] mb-6">
              Every construction project is unique and requires a specialized team that can deliver
              outstanding results with unwavering trust. We proudly provide a 25-year structural
              warranty for your project, a testament to our use of industry-standard materials
              endorsed by numerous engineers.
            </p>
            
            <p className="text-[#531914] mb-6">
              Building requires a one-of-a-kind approach and a team with the expertise to execute it
              flawlessly. With a 25-year structural warranty as a standard feature in our practice, we
              demonstrate our commitment to using industry-approved materials, trusted by
              engineers in all our construction work.
            </p>
            
            <p className="text-[#531914] mb-6">
              Our dedicated team works tirelessly to provide the best value for your project.
            </p>
            
            <p className="text-[#531914]">
              Choose your desired construction strategy, and <a href="#" onClick={handleInquireClick} className="text-red-500 hover:underline">request a quote today</a>.
            </p>
          </div>
        </div>

        {/* Services Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Design & Build */}
          <div className="border border-gray-200 rounded-lg p-8">
            <h3 className="text-[#531914] text-xl font-bold mb-6">DESIGN & BUILD</h3>
            
            <div className="mb-3 flex items-center">
              <span className="inline-block h-5 w-5 rounded-full bg-yellow-300 mr-3"></span>
              <span className="text-[#531914]">ECO & Sustainable Houses</span>
            </div>
            
            <div className="mb-3 flex items-center">
              <span className="inline-block h-5 w-5 rounded-full bg-yellow-300 mr-3"></span>
              <span className="text-[#531914]">Brick Houses</span>
            </div>
            
            <div className="flex items-center">
              <span className="inline-block h-5 w-5 rounded-full bg-yellow-300 mr-3"></span>
              <span className="text-[#531914]">Modern & Luxury Houses</span>
            </div>
          </div>

          {/* Build Only */}
          <div className="border border-gray-200 rounded-lg p-8">
            <h3 className="text-[#531914] text-xl font-bold mb-6">BUILD ONLY</h3>
            
            <div className="mb-3 flex items-center">
              <span className="inline-block h-5 w-5 rounded-full bg-yellow-300 mr-3"></span>
              <span className="text-[#531914]">With Material</span>
            </div>
            
            <div className="flex items-center">
              <span className="inline-block h-5 w-5 rounded-full bg-yellow-300 mr-3"></span>
              <span className="text-[#531914]">Without Material</span>
            </div>
          </div>

          {/* Renovation/Maintenance */}
          <div className="border border-gray-200 rounded-lg p-8">
            <h3 className="text-[#531914] text-xl font-bold mb-6">RENOVATION/MAINTAINANCE</h3>
            
            <div className="mb-3 flex items-center">
              <span className="inline-block h-5 w-5 rounded-full bg-yellow-300 mr-3"></span>
              <span className="text-[#531914]">Design & Build with Material</span>
            </div>
            
            <div className="flex items-center">
              <span className="inline-block h-5 w-5 rounded-full bg-yellow-300 mr-3"></span>
              <span className="text-[#531914]">Without Material</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mb-16">
          <p className="text-[#531914] mb-4 text-lg">Ready to start your project with us?</p>
          <button 
            onClick={handleInquireClick}
            className="inline-block py-3 px-8 bg-red-500 text-white font-medium rounded hover:bg-red-600 transition duration-200"
          >
            Get a Quote
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BuildingPage; 