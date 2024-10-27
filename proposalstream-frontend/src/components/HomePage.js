import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import logoAndName from '../assets/images/logo-and-name.png';
import heroBackground from '../assets/images/hero-background.jpg';
import arrowDownIcon from '../assets/icons/arrow-down-icon.svg';
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
        ease: "easeOut"
      }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  return (
    <div className="home-page">
      {/* Navigation Bar */}
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
          variants={fadeIn}
          style={{ backgroundImage: `url(${heroBackground})` }}
        >
          <motion.div 
            className="hero-content"
            variants={fadeInUp}
          >
            <h1 className="hero-title">
              Streamline Your <br />Proposal Process
            </h1>
            <p className="hero-subtitle">
              Connecting Property Managers and Vendors in a More Efficient Way.
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
          {/* Scroll Down Icon */}
          <motion.div 
            className="scroll-down-icon"
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <a href="#features">
              <img src={arrowDownIcon} alt="Scroll Down" />
            </a>
          </motion.div>
        </motion.section>
        
        {/* Features Section */}
        <motion.section 
          id="features"
          className="features-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
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
                {/* Attribute Items */}
                {[{
                  icon: iconClearer,
                  title: "Clearer",
                  description: "Stand out to property managers with standardized, professional proposals tailored to their processes."
                }, {
                  icon: iconFaster,
                  title: "Faster",
                  description: "Automate everything but the scope, letting you focus on delivering high-quality proposals."
                }, {
                  icon: iconFriendlier,
                  title: "Friendlier",
                  description: "Enjoy real-time updates and improved collaboration for transparent communication with clients."
                }, {
                  icon: iconAccurate,
                  title: "Accurate",
                  description: "Reduce errors with automated data entry and validation features ensuring consistency."
                }].map((item, index) => (
                  <motion.div 
                    className="attribute" 
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    variants={fadeInUp}
                  >
                    <img 
                      className="attribute-icon" 
                      alt={`${item.title} Icon`} 
                      src={item.icon} 
                    />
                    <div className="attribute-content">
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Features for Property Managers */}
            <motion.div 
              className="features-column"
              variants={fadeInUp}
            >
              <h3 className="column-title">For Property Managers</h3>
              <div className="attributes">
                {/* Attribute Items */}
                {[{
                  icon: iconSimpler,
                  title: "Simpler",
                  description: "Focus on the proposal's scope without getting bogged down by legal jargon until necessary."
                }, {
                  icon: iconFaster,
                  title: "Faster",
                  description: "Quickly generate contracts and streamline the entire proposal process."
                }, {
                  icon: iconCollaborative,
                  title: "Collaborative",
                  description: "Enhance collaboration with vendors for transparent and efficient scope creation."
                }, {
                  icon: iconTrackable,
                  title: "Trackable",
                  description: "Comprehensive tracking of contracts and change orders to prevent errors."
                }].map((item, index) => (
                  <motion.div 
                    className="attribute" 
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    variants={fadeInUp}
                  >
                    <img 
                      className="attribute-icon" 
                      alt={`${item.title} Icon`} 
                      src={item.icon} 
                    />
                    <div className="attribute-content">
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  </motion.div>
                ))}
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
            <h2 className="cta-title">Ready to Transform Your Proposal Process?</h2>
            <p className="cta-text">
              Sign up for a demo today and discover how ProposalStream can revolutionize your business.
            </p>
            <Link to="#demo-form" className="btn btn-primary" aria-label="Apply for a Demo">
              Apply for a Demo
            </Link>
          </div>
        </motion.section>

        {/* Demo Application Form */}
        <motion.section 
          id="demo-form"
          className="demo-form-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <div className="demo-form-content">
            <h2 className="section-title">Apply for a Demo</h2>
            <p className="section-subtitle">
              Fill out the form below, and we'll get back to you shortly.
            </p>
            <form className="demo-form" action="/apply-demo" method="post">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input type="text" id="name" name="name" required aria-required="true" />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input type="email" id="email" name="email" required aria-required="true" />
              </div>
              <div className="form-group">
                <label htmlFor="company">Company</label>
                <input type="text" id="company" name="company" />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea id="message" name="message" rows="5" required aria-required="true"></textarea>
              </div>
              <button type="submit" className="btn btn-primary" aria-label="Submit Application">
                Submit
              </button>
            </form>
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
