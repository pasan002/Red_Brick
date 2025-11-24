import React, { useState, useEffect, Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/images/logo.png";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Player } from '@lottiefiles/react-lottie-player';
import yourAnimation from '../assets/images/homemain.json';
import founderImage from '../assets/images/lahiru-founder.png';
import dushmanthaImage from '../assets/images/dushmantha.jpg';
import customerImage from '../assets/images/customer_avatar.png';
import sameeraImage from '../assets/images/sameera.jpg';
import Footer from '../components/Footer';
import Header from '../components/Header';


const Homepage = () => {
  // Create a ref for the features section
  const featuresRef = useRef(null);
  
  // Add navigate hook
  const navigate = useNavigate();
  
  // Add auth hook
  const { isAuthenticated } = useAuth();
  
  // Function to navigate to inquire page
  const goToInquirePage = () => {
    if (isAuthenticated) {
      navigate('/inquire');
    } else {
      navigate('/signin');
    }
  };
  
  // Scroll to features section function
  const scrollToFeatures = () => {
    featuresRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // Add fade-up animation variant
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  // Add stagger container variant
  const containerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // First, create an array of feature data before the return statement
  const features = [
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      ),
      title: "Design",
      description: "Discover stunning architecture with our skilled designers and architects, specializing in custom commercial and residential structures."
    },
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      ),
      title: "Building",
      description: "Your one-stop construction solution! Our expert team handles projects of any scale with pre-construction and construction management services."
    },
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      ),
      title: "Consulting",
      description: "Get expert building advice with our professional consulting services. We manage budget, timeline, risk, and coordination for your project."
    }
  ];

  return (
    <div className="font-sans">
      {/* Header - Now outside and above all sections */}
      <Header />
      
      {/* Dynamic Hero Section - Enhanced animations */}
      <section 
        className="relative min-h-screen flex flex-col"
        ref={node => window.heroRef && window.heroRef(node)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-700/90">
        </div>
        
        <div className="container mx-auto px-8 relative z-10 flex-grow flex items-center mt-[-100px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                type: "spring",
                stiffness: 100,
              }}
              className="max-w-2xl"
            >
              <motion.h1
                className="text-6xl font-bold mb-6 text-white leading-tight"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Transform Your Space With
                <motion.span
                  className="text-red-500"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {" "}
                  REDBRICK
                </motion.span>
              </motion.h1>
              <p className="text-xl text-gray-300 mb-8">
                Creating Homes , Achieving Dreams
              </p>
              <p className="text-xl text-gray-300 mb-8">
                Our collaboration will help you to have a complete oversight
                over your project in every growable phase. Don't wait to
                inquire.
              </p>
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-full hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300"
                  onClick={goToInquirePage}
                >
                  Inquire Now
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/10 backdrop-blur-md border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300"
                  onClick={scrollToFeatures}
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>

            <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 1 }}
  className="h-[700px] relative hidden md:block mt-[50px]" // Increased height and margin-top
>
  <motion.div
    animate={{
      y: [0, -20, 0],
    }}
    transition={{
      duration: 4,
      ease: "easeInOut",
      repeat: Infinity,
    }}
    className="w-full h-full flex items-center justify-center"
  >
    <Player
      src={yourAnimation}
      loop
      autoplay
      className="w-[110%] h-[110%] object-contain" // Increased size to 130%
    />
  </motion.div>
</motion.div>
          </div>
        </div>
      </section>

      {/* Modern Features Grid */}
      <motion.section
        ref={featuresRef}
        className="py-20 bg-gray-50"
        variants={containerVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeUpVariant}
                whileHover={{
                  scale: 1.05,
                  backdropFilter: "blur(20px)",
                }}
                className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/20"
              >
                <motion.div
                  className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {feature.icon}
                  </svg>
                </motion.div>
                <h3 className="text-xl font-bold mb-4 text-[#560C06]">{feature.title}</h3>
                <p className="text-[#560C06]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Why Trust Us Section */}
      <motion.section
        className="py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#560C06]">
            Why our clients trust us
          </h2>
          <p className="text-[#560C06] text-center max-w-4xl mx-auto mb-12">
          Welcome to Redbrick! Our mission is to deliver quality, trust, and convenience to clients who want more than just a structure. We don't just build structures; we build relationships. Our directors are involved in every project, and we limit the number of projects we take on each year to ensure we meet our exacting standards. With our focus on transparency, honesty, and integrity, you can trust us to deliver great results that will give you peace of mind. Let's work together to develop your property in any part of Sri Lanka. Contact us today to learn more about our services and how we can help you achieve your goals.
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="flex flex-col items-center">
              <div className="w-[400px] h-[500px] overflow-hidden rounded-2xl shadow-xl">
                <img
                  src={founderImage} // Replace with your founder's image path
                  alt="Founder"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center mt-4">
                <h3 className="text-2xl font-bold text-[#560C06]">Lahiru Thilakarathna</h3> {/* Replace with founder's name */}
                <p className="text-[#560C06]">(Doctoral Researcher - RMIT)</p>
              </div>
            </div>

            <div className="space-y-6 max-w-lg">
              {/* Quote section */}
              <div className="flex items-start space-x-4 relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#560C06] absolute -left-10 -top-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
                <div className="border-l-4 border-[#560C06] pl-4">
                  <p className="text-[#560C06] text-lg font-medium italic">
                    Over 15 years of experience in delivering high-quality construction projects across Sri Lanka with 100% client satisfaction.
                  </p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#560C06] absolute -right-10 bottom-0 transform rotate-180" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>

              {/* Regular points */}
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-green-100 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[#560C06]">Expert team of certified architects and engineers</p>
              </div>

              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-green-100 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[#560C06]">Transparent pricing and regular project updates</p>
              </div>

              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-green-100 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[#560C06]">Sustainable and eco-friendly building solutions</p>
              </div>

              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-green-100 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[#560C06]">Third-party quality control inspections</p>
              </div>

              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-green-100 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[#560C06]">Comprehensive warranty on all construction work</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Happy Clients Section */}
      <section className="py-16 bg-white">
  <div className="container mx-auto px-8">
  <h1 className="text-3xl font-bold text-center mb-30 text-[#560C06]">             Our happy clients           </h1>  
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* First Testimonial */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
            <img
              src={sameeraImage}
              alt="Sameera Deshan"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h3 className="text-xl font-bold text-[#6B1813] mb-2">Sameera Deshan</h3>
        <div className="mb-4">
          <p className="text-[#6B1813] italic">
            " I simply could not let my recently completed house go without properly acknowledging Red Brick Construction's tremendous contribution as the project's contractor. From the early stages of..."
          </p>
        </div>
        <div className="flex justify-center">
          <span className="text-yellow-400 text-xl">★★★★</span>
        </div>
      </div>

      {/* Second Testimonial */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
            <img
              src={dushmanthaImage}
              alt="Dushmantha"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h3 className="text-xl font-bold text-[#6B1813] mb-2">Dushmantha</h3>
        <div className="mb-4">
          <p className="text-[#6B1813] italic">
            " I had to say that before finalizing the housing contract with Redbrick I requested quotations from different Construction companies out there for a comparison. I found that there is only 1-2 lakh..."
          </p>
        </div>
        <div className="flex justify-center">
          <span className="text-yellow-400 text-xl">★★★★★</span>
          
        </div>
      </div>

      {/* Third Testimonial */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
            <img
              src={customerImage}
              alt="Kalpa"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h3 className="text-xl font-bold text-[#6B1813] mb-2">Kalpa</h3>
        <div className="mb-4">
          <p className="text-[#6B1813] italic">
            " I had to renovate my house which had small bedrooms and an old fashion layout. My wife always had this idea with her to have a huge living room space with dining space with access to the kitche..."
          </p>
        </div>
        <div className="flex justify-center">
          <span className="text-yellow-400 text-xl">★★★★★</span>
      
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Footer component */}
      <Footer />
    </div>
  );
};

export default Homepage;
