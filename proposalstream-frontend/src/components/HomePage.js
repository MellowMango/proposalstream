import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logoAndName from '../assets/images/logo-and-name.png';
import heroBackground from '../assets/images/hero-background.jpg';
import iconClearer from '../assets/icons/icon-clearer.svg';
import iconFaster from '../assets/icons/icon-faster.svg';
import iconFriendlier from '../assets/icons/icon-friendlier.svg';
import iconAccurate from '../assets/icons/icon-accurate.svg';
import iconSimpler from '../assets/icons/icon-simpler.svg';
import iconCollaborative from '../assets/icons/icon-collaborative.svg';
import iconTrackable from '../assets/icons/icon-trackable.svg';
import "./HomePage.css";
import { motion } from "framer-motion";

const HomePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    contractVolume: '',
    userType: ''
  });
  const [submitStatus, setSubmitStatus] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector(".nav-bar");
      if (window.scrollY > 50) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1]
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('https://formsubmit.co/guy@proposal-stream.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        location: '',
        contractVolume: '',
        userType: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Enhanced hover effect for attributes
  const attributeHover = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: [0.34, 1.56, 0.64, 1]
      }
    }
  };

  return (
    <div className="home-page">
      {/* Navigation Bar with Gradient Background */}
      <nav className="nav-bar">
        <Link to="/">
          <img 
            className="logo-and-name" 
            alt="ProposalStream Logo" 
            src={logoAndName} 
          />
        </Link>
        <ul className="menu">
          <li className="menu-item">
            <Link to="/features">Features</Link>
          </li>
          <li className="menu-item">
            <Link to="/pricing">Pricing</Link>
          </li>
          <li className="menu-item">
            <Link to="/contact">Contact</Link>
          </li>
        </ul>
        {/* Login and Sign Up Buttons */}
        <div className="auth-buttons">
          <Link to="/login" className="btn btn-secondary" aria-label="Login">
            Login
          </Link>
          <Link to="/register" className="btn btn-primary" aria-label="Sign Up">
            Sign Up
          </Link>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section with Animations */}
        <motion.section 
          className="hero-section"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          style={{ backgroundImage: `url(${heroBackground})` }}
        >
          <motion.div 
            className="hero-content"
            variants={fadeInUp}
          >
            <h1 className="hero-title">Transform Your Property Management Workflow</h1>
            <p className="hero-subtitle">
              Revolutionizing how property managers and vendors connect, collaborate, and succeed together.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary" aria-label="Get Started">
                Get Started
              </Link>
              <Link to="/features" className="btn btn-secondary" aria-label="Learn More">
                Learn More
              </Link>
            </div>
          </motion.div>
        </motion.section>
        
        {/* Features Section */}
        <motion.section 
          className="features-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <motion.div 
            className="section-header"
            variants={fadeInUp}
          >
            <h2 className="section-title">Why Choose ProposalStream?</h2>
            <p className="section-subtitle">
              Experience a faster, clearer, and more collaborative way to manage proposals and contracts.
            </p>
          </motion.div>

          <div className="features-container">
            {/* Features for Vendors */}
            <motion.div 
              className="features-column"
              variants={fadeInUp}
            >
              <h3 className="column-title">For Vendors</h3>
              <div className="attributes">
                {/* Attribute 1 */}
                <div className="attribute">
                  <img 
                    className="attribute-icon" 
                    alt="Clearer Icon" 
                    src={iconClearer} 
                  />
                  <div className="attribute-content">
                    <h4>Clearer</h4>
                    <p>
                      Stand out to property managers with standardized, professional proposals tailored to their processes.
                    </p>
                  </div>
                </div>
                {/* Attribute 2 */}
                <div className="attribute">
                  <img 
                    className="attribute-icon" 
                    alt="Faster Icon" 
                    src={iconFaster} 
                  />
                  <div className="attribute-content">
                    <h4>Faster</h4>
                    <p>
                      Automate everything but the scope, letting you focus on delivering high-quality proposals.
                    </p>
                  </div>
                </div>
                {/* Attribute 3 */}
                <div className="attribute">
                  <img 
                    className="attribute-icon" 
                    alt="Friendlier Icon" 
                    src={iconFriendlier} 
                  />
                  <div className="attribute-content">
                    <h4>Friendlier</h4>
                    <p>
                      Enjoy real-time updates and improved collaboration for transparent communication with clients.
                    </p>
                  </div>
                </div>
                {/* Attribute 4 */}
                <div className="attribute">
                  <img 
                    className="attribute-icon" 
                    alt="Accurate Icon" 
                    src={iconAccurate} 
                  />
                  <div className="attribute-content">
                    <h4>Accurate</h4>
                    <p>
                      Reduce errors with automated data entry and validation features ensuring consistency.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Features for Property Managers */}
            <motion.div 
              className="features-column"
              variants={fadeInUp}
            >
              <h3 className="column-title">For Property Managers</h3>
              <div className="attributes">
                {/* Attribute 1 */}
                <div className="attribute">
                  <img 
                    className="attribute-icon" 
                    alt="Simpler Icon" 
                    src={iconSimpler} 
                  />
                  <div className="attribute-content">
                    <h4>Simpler</h4>
                    <p>
                      Focus on the proposal's scope without getting bogged down by legal jargon until necessary.
                    </p>
                  </div>
                </div>
                {/* Attribute 2 */}
                <div className="attribute">
                  <img 
                    className="attribute-icon" 
                    alt="Faster Icon" 
                    src={iconFaster} 
                  />
                  <div className="attribute-content">
                    <h4>Faster</h4>
                    <p>
                      Quickly generate contracts and streamline the entire proposal process.
                    </p>
                  </div>
                </div>
                {/* Attribute 3 */}
                <div className="attribute">
                  <img 
                    className="attribute-icon" 
                    alt="Collaborative Icon" 
                    src={iconCollaborative} 
                  />
                  <div className="attribute-content">
                    <h4>Collaborative</h4>
                    <p>
                      Enhance collaboration with vendors for transparent and efficient scope creation.
                    </p>
                  </div>
                </div>
                {/* Attribute 4 */}
                <div className="attribute">
                  <img 
                    className="attribute-icon" 
                    alt="Trackable Icon" 
                    src={iconTrackable} 
                  />
                  <div className="attribute-content">
                    <h4>Trackable</h4>
                    <p>
                      Comprehensive tracking of contracts and change orders to prevent errors.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
        
        {/* Call to Action Section */}
        <motion.section 
          className="cta-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <div className="cta-content">
            <h2 className="cta-title">Ready to Elevate Your Business?</h2>
            <p className="cta-text">
              Join the future of property management and vendor collaboration.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary glow-effect" aria-label="Get Started">
                Get Started
              </Link>
              <Link to="/pricing" className="btn btn-outline" aria-label="Learn More">
                Learn More
              </Link>
            </div>
          </div>
        </motion.section>

        <motion.section 
          className="demo-form-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <div className="demo-form-content">
            <div className="form-header">
              <h2 className="section-title">Schedule a Demo</h2>
              <p className="section-subtitle">
                See how ProposalStream can transform your workflow with a personalized demo
              </p>
            </div>
            
            <form className="demo-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Smith"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Work Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@company.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="company">Company Name</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Company Inc."
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="userType">Role</label>
                  <select
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your role</option>
                    <option value="property-manager">Property Manager</option>
                    <option value="vendor">Service Provider/Vendor</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contractVolume">Monthly Contract Volume</label>
                  <select
                    id="contractVolume"
                    name="contractVolume"
                    value={formData.contractVolume}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select volume</option>
                    <option value="1-10">1-10 contracts</option>
                    <option value="11-50">11-50 contracts</option>
                    <option value="51-100">51-100 contracts</option>
                    <option value="100+">100+ contracts</option>
                  </select>
                </div>
              </div>

              <div className="demo-benefits">
                <h4>What to Expect from Your Demo</h4>
                <ul>
                  <li>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="benefit-icon">
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z"/>
                    </svg>
                    <div>
                      <strong>Personalized Demo</strong>
                      <p>30-minute tailored presentation of features relevant to your needs</p>
                    </div>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="benefit-icon">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                    <div>
                      <strong>Workflow Analysis</strong>
                      <p>Custom evaluation of your current process and potential improvements</p>
                    </div>
                  </li>
                  <li>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="benefit-icon">
                      <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    </svg>
                    <div>
                      <strong>ROI Calculator</strong>
                      <p>Detailed analysis of potential savings and efficiency gains</p>
                    </div>
                  </li>
                </ul>
              </div>

              <button type="submit" className="btn btn-primary demo-submit-button">
                Schedule Your Demo
              </button>
            </form>

            {submitStatus === 'success' && (
              <motion.div 
                className="success-message"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <svg viewBox="0 0 24 24" className="success-icon">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
                <p>Thank you! Our team will contact you within one business day to schedule your demo.</p>
              </motion.div>
            )}
            
            {submitStatus === 'error' && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <svg viewBox="0 0 24 24" className="error-icon">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <p>Oops! Something went wrong. Please try again.</p>
              </motion.div>
            )}
          </div>
        </motion.section>
      </main>
      
      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <img 
            src={logoAndName} 
            alt="ProposalStream Logo" 
            className="footer-logo"
          />
          <p className="footer-text">
            &copy; {new Date().getFullYear()} ProposalStream. All rights reserved.
          </p>
          <ul className="footer-menu">
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
