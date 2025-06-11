import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";
import heroImage1 from "../assets/hero1.png";
import heroImage2 from "../assets/hero2.png";
import heroImage3 from "../assets/hero3.png";
import logo from "../assets/logo.png";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

const slides = [
  {
    title: "Empowering",
    subtitle: "Somali Businesses through Smart Investment Decisions",
    description: (
      <>
        We empower <span>Somali entrepreneurs</span> by providing a <span>smart platform</span> that connects them with potential investors. With detailed tracking of <span>revenue, expenses, and milestones</span>, small businesses gain the tools they need to grow <span>sustainably</span> and <span>transparently</span>.
      </>
    ),
    image: heroImage1,
    bgGradient: "linear-gradient(135deg, #6e48aa 0%, #9d50bb 100%)",
  },
  {
    title: "Predicting",
    subtitle: "Investment Risks Using Machine Learning",
    description: (
      <>
        Our <span>predictive model</span> analyzes real-time business data to assess financial <span>risk levels</span> — high, moderate, or low. This helps investors make <span>confident, data-driven decisions</span>, and supports sustainable investment in Somalia's growing entrepreneurial sector.
      </>
    ),
    image: heroImage2,
    bgGradient: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
  },
  {
    title: "Connecting",
    subtitle: "Entrepreneurs and Investors for a Better Future",
    description: (
      <>
        We create a <span>trusted bridge</span> between business owners and investors. Our platform allows entrepreneurs to <span>showcase their progress</span> and goals, while giving investors a <span>transparent view</span> into performance, risk, and growth potential.
      </>
    ),
    image: heroImage3,
    bgGradient: "linear-gradient(135deg, #614385 0%, #516395 100%)",
  },
];

const HeroSection = ({ activeLink, setActiveLink }) => {
  const [index, setIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  const navigate = useNavigate();

  const handleLogin = () => navigate("/auth?type=login");
  const handleSignup = () => navigate("/auth?type=signup");
  const handleGetStarted = () => navigate("/auth");

  // Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.classList.toggle("lock-scroll", menuOpen);
    return () => document.body.classList.remove("lock-scroll");
  }, [menuOpen]);

  // Animate counters
  useEffect(() => {
    const counters = [
      { id: "stat1", end: 4 },
      { id: "stat2", end: 10000 },
      { id: "stat3", end: 98 },
    ];

    counters.forEach(({ id, end }) => {
      let current = 0;
      const element = document.getElementById(id);
      const step = id === "stat2" ? 1000 : end > 100 ? 5 : 1;
      const duration = 2000; // 2 seconds
      const increment = end / (duration / 16); // 60fps

      const updateCounter = () => {
        if (current < end) {
          current += increment;
          if (current > end) current = end;
          const suffix = id === "stat2" ? "" : id === "stat3" ? "%" : "+";
          if (element) {
            element.textContent = Math.floor(current).toLocaleString() + suffix;
          }
          requestAnimationFrame(updateCounter);
        }
      };

      updateCounter();
    });
  }, [index]);

  // Auto-rotate slides
  useEffect(() => {
    if (isHovering) return; // Pause when user is interacting
    
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isHovering]);

  // Handle swipe navigation
  const handleSwipe = (direction) => {
    if (direction === "left") {
      setIndex((prev) => (prev + 1) % slides.length);
    } else if (direction === "right") {
      setIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  // Click handler for swipe navigation
  const handleClick = (e) => {
    const screenWidth = window.innerWidth;
    const clickX = e.clientX;
    if (clickX < screenWidth / 3) {
      handleSwipe("right");
    } else if (clickX > (screenWidth / 3) * 2) {
      handleSwipe("left");
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) handleSwipe("left"); // Swipe left
    if (distance < -50) handleSwipe("right"); // Swipe right
    setTouchStart(null);
    setTouchEnd(null);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div 
      className="hero-container" 
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{ background: slides[index].bgGradient }}
    >
      <header className="navbar">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
          <span className="brand-name">SmartInvest</span>
        </div>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? (
            <span className="close-icon">✕</span>
          ) : (
            <span className="hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          )}
        </button>

        <nav className="nav-links">
          <a 
            href="#home" 
            className={activeLink === "home" ? "active" : ""}
            onClick={() => setActiveLink("home")}
          >
            Home
          </a>
          <a 
            href="#about" 
            className={activeLink === "about" ? "active" : ""}
            onClick={() => setActiveLink("about")}
          >
            About
          </a>
          <a 
            href="#features" 
            className={activeLink === "features" ? "active" : ""}
            onClick={() => setActiveLink("features")}
          >
            Features
          </a>
          <a 
            href="#contact" 
            className={activeLink === "contact" ? "active" : ""}
            onClick={() => setActiveLink("contact")}
          >
            Contact
          </a>
        </nav>

        <div className="auth-buttons">
          <button className="login-btn" onClick={handleLogin}>LOG IN</button>
          <button className="signup-btn" onClick={handleSignup}>SIGN UP</button>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu-overlay">
          <nav className="mobile-nav-links">
            <a href="#home" onClick={() => { setActiveLink("home"); closeMenu(); }}>Home</a>
            <a href="#about" onClick={() => { setActiveLink("about"); closeMenu(); }}>About</a>
            <a href="#features" onClick={() => { setActiveLink("features"); closeMenu(); }}>Features</a>
            <a href="#contact" onClick={() => { setActiveLink("contact"); closeMenu(); }}>Contact</a>
          </nav>
          <div className="mobile-auth-buttons">
            <button className="mobile-login-btn" onClick={handleLogin}>LOG IN</button>
            <button className="mobile-signup-btn" onClick={handleSignup}>SIGN UP</button>
          </div>
        </div>
      )}

      <section className="hero-content animated-slide" id="home" key={index}>
        <div className="slide-indicators">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`indicator ${i === index ? "active" : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="text-section-wrapper">
          <div className="text-section slide-text">
            <h1 className="main-heading drop-in">{slides[index].title}</h1>
            <h2 className="sub-heading slide-in-left">{slides[index].subtitle}</h2>
            <p className="hero-description slide-in-left">{slides[index].description}</p>
            <div className="button-group">
              <button className="get-started-btn slide-in-left" onClick={handleGetStarted}>
                Get Started
                <span className="btn-arrow">→</span>
              </button>
              <button className="learn-more-btn slide-in-left" onClick={() => navigate("/about")}>
                Learn More
              </button>
            </div>

            <div className="stats slide-in-left">
              <div className="stat">
                <h3 id="stat1">0+</h3>
                <p>Years Experience</p>
              </div>
              <div className="stat">
                <h3 id="stat2">0</h3>
                <p>Projects Completed</p>
              </div>
              <div className="stat">
                <h3 id="stat3">0%</h3>
                <p>Client Satisfaction</p>
              </div>
            </div>
          </div>
        </div>

        <div className="image-section image-animate">
          <img
            src={slides[index].image}
            alt="Hero Slide"
            className="hero-image"
          />
          <div className="image-overlay"></div>
        </div>

        <button className="nav-arrow left-arrow" onClick={() => handleSwipe("right")}>
          <FaArrowLeft />
        </button>
        <button className="nav-arrow right-arrow" onClick={() => handleSwipe("left")}>
          <FaArrowRight />
        </button>
      </section>
    </div>
  );
};

export default HeroSection;