import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logoAndName from '../assets/images/logo-and-name.png';
import "./HomePage.css";
import "./ContactPage.css";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    contractVolume: '',
    userType: '',
    message: ''  // Added message field for contact form
  });
  const [submitStatus, setSubmitStatus] = useState('');

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
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
        userType: '',
        message: ''
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

  return (
    <div className="home-page">
      <nav className="nav-bar">
        <Link to="/">
          <img className="logo-and-name" alt="ProposalStream Logo" src={logoAndName} />
        </Link>
        <ul className="menu">
          <li className="menu-item"><Link to="/features">Features</Link></li>
          <li className="menu-item"><Link to="/pricing">Pricing</Link></li>
          <li className="menu-item"><Link to="/contact">Contact</Link></li>
        </ul>
        <div className="auth-buttons">
          <Link to="/login" className="btn btn-secondary">Login</Link>
          <Link to="/register" className="btn btn-primary">Sign Up</Link>
        </div>
      </nav>

      <main className="main-content">
        <motion.section 
          className="hero-section"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          style={{ minHeight: '40vh' }}
        >
          <div className="hero-content">
            <h1 className="hero-title">Contact Us</h1>
            <p className="hero-subtitle">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </motion.section>

        <motion.section 
          className="demo-form-section"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <div className="demo-form-content">
            <form className="demo-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="company">Company Name *</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">City/State *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="userType">I am a: *</label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select type</option>
                  <option value="vendor">Vendor</option>
                  <option value="property-manager">Property Manager</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                />
              </div>

              <button type="submit" className="btn btn-primary glow-effect">
                Send Message
              </button>
            </form>

            {submitStatus === 'success' && (
              <div className="success-message">
                Thank you for your message! We'll get back to you soon.
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="error-message">
                Something went wrong. Please try again later.
              </div>
            )}
          </div>
        </motion.section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <img src={logoAndName} alt="ProposalStream Logo" className="footer-logo" />
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

export default ContactPage;