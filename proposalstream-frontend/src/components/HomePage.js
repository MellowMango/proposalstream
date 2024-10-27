import React from "react";
import { Link } from "react-router-dom";
import logoAndName from '../assets/text/logo-and-name.png';
import icon01 from '../assets/svg/icon-01.svg';
import icon02 from '../assets/svg/icon-02.png';
import icon03 from '../assets/svg/icon-03.png';
import icon04 from '../assets/svg/icon-04.png';
import iconsCheckmarkCircle from '../assets/svg/icons-checkmark-circle.png';
import rectangle59 from '../assets/images/rectangle-59.png';
import rectangle from '../assets/images/rectangle.png';
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Navigation Bar */}
      <nav className="nav-bar">
        <img className="logo-and-name" alt="Logo and Company Name" src={logoAndName} />
        <ul className="menu">
          <li className="menu-item">
            <Link to="/features">Features</Link>
          </li>
          <li className="menu-item">
            <Link to="/onboarding">Onboarding</Link>
          </li>
          <li className="menu-item">
            <Link to="/pricing">Pricing</Link>
          </li>
          <li className="menu-item">
            <Link to="/contact">Contact</Link>
          </li>
          {/* Added Login Button to Navbar */}
          <li className="menu-item">
            <Link to="/login" className="nav-login-button">Login</Link>
          </li>
          <li className="menu-item">
            <Link to="/register" className="nav-signup-button">Sign Up</Link>
          </li>
        </ul>
      </nav>
      
      {/* Main Content */}
      <main className="main-content">
        {/* Landing Section */}
        <section className="landing-section">
          {/* Property Management Frame */}
          <div className="frame property-management">
            <h1 className="title">Property<br />Management</h1>
            <button className="cta-button">
              <span>Learn More</span>
            </button>
            <img className="decorative-image small-image" alt="Decorative Rectangle" src={rectangle59} />
          </div>

          {/* Vendors Frame */}
          <div className="frame vendors">
            <h1 className="title">Vendors</h1>
            <button className="cta-button">
              <span>Learn More</span>
            </button>
            <img className="decorative-image small-image" alt="Decorative Rectangle" src={rectangle} />
          </div>
        </section>
        
        {/* Content Section */}
        <section className="content-section">
          <div className="heading-logo">
            <div className="heading-content">
              <h2 className="heading-text">
                400% Faster Proposal to Contract Conversion.<br />
                Property Management and Vendors, More Connected Than Ever.
              </h2>
              <div className="cta-group">
                <Link to="/register" className="cta-button">Sign Up</Link>
                <Link to="/login" className="login-link">Login</Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features for Vendors */}
        <section className="blueprint-section">
          <div className="heading-sub-heading">
            <p className="sub-heading">Streamline Your Vendor-Property Manager Proposal To Contract Process Flow</p>
            <h3 className="section-title">ProposalStream for Vendors</h3>
          </div>
          <div className="attributes">
            {/* Attribute 1 */}
            <div className="attribute">
              <img className="attribute-icon" alt="Clearer Icon" src={icon02} />
              <div className="attribute-content">
                <h4>Clearer</h4>
                <p>
                  Increases the chances of being noticed by property managers through a standardized format consistent
                  with your client's process.
                </p>
              </div>
            </div>
            {/* Attribute 2 */}
            <div className="attribute">
              <img className="attribute-icon" alt="Faster Icon" src={icon03} />
              <div className="attribute-content">
                <h4>Faster</h4>
                <p>
                  ProposalStream automates everything but the scope, allowing your team to focus on crafting
                  high-quality proposals, stress-free.
                </p>
              </div>
            </div>
            {/* Attribute 3 */}
            <div className="attribute">
              <img className="attribute-icon" alt="Friendlier Icon" src={icon04} />
              <div className="attribute-content">
                <h4>Friendlier</h4>
                <p>
                  Provides real-time updates on proposal status and enhances collaboration on scopes of work, ensuring
                  clear communication and transparency for both vendors and clients.
                </p>
              </div>
            </div>
            {/* Attribute 4 */}
            <div className="attribute">
              <img className="attribute-icon" alt="Accurate Icon" src={iconsCheckmarkCircle} />
              <div className="attribute-content">
                <h4>Accurate</h4>
                <p>
                  Minimizes errors with automated data entry and validation features.
                  <br />
                  Built-in checks reduce the risk of missing information and ensure data consistency.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features for Property Managers */}
        <section className="blueprint-section">
          <div className="heading-sub-heading">
            <h3 className="section-title">ProposalStream for Property Managers</h3>
          </div>
          <div className="attributes">
            {/* Attribute 1 */}
            <div className="attribute">
              <img className="attribute-icon" alt="Simpler Icon" src={icon02} />
              <div className="attribute-content">
                <h4>Simpler</h4>
                <p>
                  Lets property managers focus on the proposal's scope, avoiding legal jargon until contract review.
                </p>
              </div>
            </div>
            {/* Attribute 2 */}
            <div className="attribute">
              <img className="attribute-icon" alt="Faster Icon" src={icon03} />
              <div className="attribute-content">
                <h4>Faster</h4>
                <p>
                  Streamlines the contract creation process, allowing property managers to quickly generate contracts
                  with just a few clicks.
                </p>
              </div>
            </div>
            {/* Attribute 3 */}
            <div className="attribute">
              <img className="attribute-icon" alt="Collaborative Icon" src={icon04} />
              <div className="attribute-content">
                <h4>Collaborative</h4>
                <p>
                  Enhances collaboration with vendors, making it easier for property managers to coordinate scope
                  creation and ensuring changes to scope are fully transparent.
                </p>
              </div>
            </div>
            {/* Attribute 4 */}
            <div className="attribute">
              <img className="attribute-icon" alt="Trackable Icon" src={iconsCheckmarkCircle} />
              <div className="attribute-content">
                <h4>Trackable</h4>
                <p>
                  Offers comprehensive tracking of contracts and change orders, making it easy to view modifications
                  alongside their corresponding standard agreements, thus preventing contractual errors.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Demo Section */}
        <section className="demo-section">
          <div className="content-2">
            <div className="details">
              <div className="heading-details">
                <h2 className="get-in-touch">Sign up for a demo</h2>
                <p className="description">
                  Want to learn more about ProposalStream for your business? <br />
                  Book a consultation with our team today!
                </p>
                <p className="latest-features">Want to learn about our latest features first?</p>
              </div>
              <Link to="/explore" className="explore-link">Explore Here</Link>
            </div>
            <form className="sub-heading-CTA">
              <div className="form-group">
                <label htmlFor="first-name">First Name</label>
                <input className="input-field" id="first-name" placeholder="First Name" type="text" />
              </div>
              <div className="form-group">
                <label htmlFor="last-name">Last Name</label>
                <input className="input-field" id="last-name" placeholder="Last Name" type="text" />
              </div>
              <div className="form-group">
                <label htmlFor="company">Company</label>
                <input className="input-field" id="company" placeholder="Company" type="text" />
              </div>
              <div className="form-group">
                <label htmlFor="interest">What made you interested in ProposalStream?</label>
                <textarea className="input-field" id="interest" placeholder="Your interest..." />
              </div>
              <button className="button">Book Consultation</button>
            </form>
          </div>
        </section>
      </main>
      
      {/* Removed Footer from here */}
    </div>
  );
};

export default HomePage;
