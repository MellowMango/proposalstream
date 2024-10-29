import React from "react";
import { Link } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import logoAndName from '../assets/images/logo-and-name.png';
import { motion } from "framer-motion";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import "./PricingPage.css";

const PricingPage = () => {
  // Animation variants (keep existing variants)
  
  const vendorFeatures = [
    "Unlimited proposal submissions",
    "Professional proposal templates",
    "Real-time collaboration tools",
    "Automated contract generation",
    "Document tracking & management"
  ];

  const pmFeatures = [
    "Dedicated account manager",
    "Custom workflow automation",
    "Advanced reporting & analytics",
    "Priority support",
    "Team training & onboarding"
  ];

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

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="pricing-page">
        {/* Navigation Bar */}
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

        {/* Main Content */}
        <main className="main-content">
          <motion.section 
            className="pricing-header"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <h1>Simple, Transparent Pricing</h1>
              <p>Choose the plan that's right for your business</p>
            </motion.div>
          </motion.section>

          <motion.section 
            className="pricing-cards"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Vendor Card - now featured */}
            <motion.div className="pricing-card featured" variants={fadeInUp}>
              <div className="card-header">
                <h2>Vendors</h2>
                <div className="price">
                  <span className="amount">$100</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="features-list">
                {vendorFeatures.map((feature, index) => (
                  <li key={index}>
                    <CheckCircleIcon className="check-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn btn-primary glow-effect">
                Start Free Trial
              </Link>
            </motion.div>

            {/* Property Manager Card - now enterprise */}
            <motion.div className="pricing-card enterprise" variants={fadeInUp}>
              <div className="card-header">
                <h2>Property Managers</h2>
                <div className="price">
                  <span className="amount">Enterprise</span>
                </div>
                <p className="enterprise-desc">
                  Pricing is based on your portfolio size and specific needs.
                </p>
              </div>
              <ul className="features-list">
                {pmFeatures.map((feature, index) => (
                  <li key={index}>
                    <CheckCircleIcon className="check-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.section>

          <motion.section 
            className="faq-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2>Need Assistance?</h2>
            <p>Our team is ready to help you get started</p>
            <div className="contact-buttons">
              <Link to="/contact/email" className="btn btn-primary glow-effect">
                Contact via Email
              </Link>
              <a 
                href="https://calendly.com/maxphelps/proposalstream-support-call" 
                className="btn btn-secondary glow-effect"
                target="_blank"
                rel="noopener noreferrer"
              >
                Schedule a Call
              </a>
            </div>
          </motion.section>
        </main>

        {/* Footer */}
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
    </ThemeProvider>
  );
};

export default PricingPage;