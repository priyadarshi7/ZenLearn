import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./HeroSection.css";
import heroimage from "../../../assets/images/HomeSection1.png"

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <>
    <section className="hero-section">
      {/* Background elements */}
      <div className="background-elements">
        <div className="bg-blob bg-blob-1"></div>
        <div className="bg-blob bg-blob-2"></div>
      </div>

      {/* Main content */}
      <div className="hero-container">
        {/* Left content */}
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            <svg className="badge-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              <path d="M5 3v4"/>
              <path d="M19 17v4"/>
              <path d="M3 5h4"/>
              <path d="M17 19h4"/>
            </svg>
            <span>New learning approach</span>
          </motion.div>
          
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Learn Smarter, <br />
            <span className="highlight">Stay Balanced.</span>
          </motion.h1>
          
          <motion.p 
            className="hero-description"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            ZenLearn combines expert education with mindful learning techniques, 
            so you grow without the burnout.
          </motion.p>
          
          <motion.div 
            className="hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <a href="/signup" className="btn btn-primary">
              <span className="btn-content">
                Get Started
                <svg className="btn-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </span>
            </a>
            <a href="/explore" className="btn btn-secondary">
              <svg className="btn-icon-left" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              Explore Courses
            </a>
          </motion.div>
          
          <motion.div 
            className="social-proof"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="user-avatars">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="avatar">
                  <img 
                    src={`https://randomuser.me/api/portraits/men/${i + 10}.jpg`} 
                    alt={`User ${i}`} 
                  />
                </div>
              ))}
            </div>
            <span className="social-text">
              <span className="social-highlight">1,000+</span> students joined this week
            </span>
          </motion.div>
        </motion.div>
        
        {/* Right image */}
        <motion.div 
          className="hero-image-container"
          initial={{ opacity: 0, x: 20 }}
          animate={isVisible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.div 
            className="image-card"
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={isVisible ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ 
              duration: 0.8, 
              delay: 0.7,
              type: "spring",
              stiffness: 100
            }}
          >
            <div className="image-wrapper">
              <img 
                src={heroimage}
                alt="Zen Learning" 
                className="hero-image"
              />
            </div>
          </motion.div>
          
          {/* Decorative elements */}
          <motion.div 
            className="decorative-circle circle-1"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.9 }}
          ></motion.div>
          <motion.div 
            className="decorative-circle circle-2"
            initial={{ opacity: 0, y: -20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1 }}
          ></motion.div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5,
            ease: "easeInOut" 
          }}
          className="scroll-content"
        >
        </motion.div>
      </motion.div>
    </section>
    </>
  );
};

export default HeroSection;
