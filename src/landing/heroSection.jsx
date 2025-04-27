import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";
import heroImage1 from "../assets/hero1.png";
import heroImage2 from "../assets/hero2.png";
import heroImage3 from "../assets/hero3.png";
import backgroundVideo from "../assets/background1.mp4";
import logo from "../assets/logo.png";

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
  },
  {
    title: "Predicting",
    subtitle: "Investment Risks Using Machine Learning",
    description: (
      <>
        Our <span>predictive model</span> analyzes real-time business data to assess financial <span>risk levels</span> — high, moderate, or low. This helps investors make <span>confident, data-driven decisions</span>, and supports sustainable investment in Somalia’s growing entrepreneurial sector.
      </>
    ),
    image: heroImage2,
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
  },
];

const HeroSection = ({ activeLink }) => {
  const [index, setIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => navigate("/auth?type=login");
  const handleSignup = () => navigate("/auth?type=signup");
  const handleGetStarted = () => navigate("/auth");

  useEffect(() => {
    document.body.classList.toggle("lock-scroll", menuOpen);
  }, [menuOpen]);

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

      const updateCounter = () => {
        if (current < end) {
          current += step;
          if (current > end) current = end;
          const suffix = id === "stat2" ? "" : id === "stat3" ? "%" : "+";
          if (element) {
            element.textContent = current.toLocaleString() + suffix;
          }
          requestAnimationFrame(updateCounter);
        }
      };

      updateCounter();
    });
  }, [index]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleSwipe = (direction) => {
    if (direction === "left") {
      setIndex((prev) => (prev + 1) % slides.length);
    } else if (direction === "right") {
      setIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const handleClick = (e) => {
    const screenWidth = window.innerWidth;
    const clickX = e.clientX;
    if (clickX < screenWidth / 2) {
      handleSwipe("right");
    } else {
      handleSwipe("left");
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="hero-container" onClick={handleClick}>
      <video
        src={backgroundVideo}
        autoPlay
        muted
        loop
        playsInline
        className="hero-background"
      ></video>

      <header className="navbar">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
          <span className="brand-name">SmartInvest</span>
        </div>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className="nav-links">
          <a href="#home" className={activeLink === "home" ? "active" : ""}>
            Home
          </a>
          <a href="#about" className={activeLink === "about" ? "active" : ""}>
            About
          </a>
          <a
            href="#features"
            className={activeLink === "features" ? "active" : ""}
          >
            Features
          </a>
        </nav>

        <div className="auth-buttons">
          <button className="login-btn" onClick={handleLogin}>
            LOG IN
          </button>
          <button className="signup-btn" onClick={handleSignup}>
            SIGN UP
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu-overlay">
          <nav className="mobile-nav-links">
            <a href="#home" onClick={closeMenu}>
              Home
            </a>
            <a href="#about" onClick={closeMenu}>
              About
            </a>
            <a href="#features" onClick={closeMenu}>
              Features
            </a>
          </nav>
          <div className="mobile-auth-buttons">
            <button className="mobile-login-btn" onClick={handleLogin}>
              LOG IN
            </button>
            <button className="mobile-signup-btn" onClick={handleSignup}>
              SIGN UP
            </button>
          </div>
        </div>
      )}

      <section className="hero-content animated-slide" id="home" key={index}>
        <div className="text-section slide-text">
          <h1 className="main-heading drop-in">{slides[index].title}</h1>
          <h2 className="sub-heading slide-in-left">{slides[index].subtitle}</h2>
          <p className="hero-description slide-in-left">{slides[index].description}</p>
          <button
            className="get-started-btn slide-in-left"
            onClick={handleGetStarted}
          >
            Get Started
          </button>

          <div className="stats slide-in-left">
            <div className="stat">
              <h3 id="stat1">0</h3>
              <p>
                years <br /> of experiences
              </p>
            </div>
            <div className="stat">
              <h3 id="stat2">0</h3>
              <p>
                Projects <br /> completed
              </p>
            </div>
            <div className="stat">
              <h3 id="stat3">0</h3>
              <p>
                Satisfied <br /> Customers
              </p>
            </div>
          </div>
        </div>

        <div className="image-section image-animate">
          <img
            src={slides[index].image}
            alt="Hero Slide"
            className="hero-image"
          />
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
