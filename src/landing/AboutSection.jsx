import React, { useEffect } from "react";
import "./AboutSection.css";
import aboutImage from "../assets/about-left.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMoneyBillWave, 
  faChartLine, 
  faEye, 
  faGlobe,
  faLightbulb,
  faHandshake
} from '@fortawesome/free-solid-svg-icons';
import { faCreativeCommons, faEmpire } from '@fortawesome/free-brands-svg-icons';
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

const AboutSection = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: false
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardData = [
    {
      icon: faMoneyBillWave,
      title: "Smart funding for SMEs",
      description: "Tailored funding solutions to empower small businesses",
      color: "#5b21b6"
    },
    {
      icon: faChartLine,
      title: "AI Risk prediction",
      description: "AI-powered financial risk assessment",
      color: "#1d4ed8"
    },
    {
      icon: faEye,
      title: "Transparent tracking",
      description: "Real-time investment performance tracking",
      color: "#047857"
    },
    {
      icon: faGlobe,
      title: "Local growth focus",
      description: "Supporting local economic development",
      color: "#b45309"
    },
    {
      icon: faLightbulb,
      title: "Innovative Solutions",
      description: "Cutting-edge approaches to financial inclusion",
      color: "#6d28d9"
    },
    {
      icon: faHandshake,
      title: "Partnership Network",
      description: "Strong local and international partnerships",
      color: "#0e7490"
    }
  ];

  return (
    <section className="about-section" id="about" ref={ref}>
      <div className="about-background-image"></div>
      <div className="about-overlay"></div>
      
      <div className="about-content-container">
        <motion.div 
          className="about-text-section"
          initial="hidden"
          animate={controls}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <span className="about-badge">Our Vision</span>
            <h1 className="about-main-heading">Empowering Somali Entrepreneurs</h1>
            <h2 className="about-sub-heading">Building a Brighter Economic Future</h2>
            <p className="about-description">
              We connect global investors with promising Somali small businesses using advanced machine learning for financial risk assessment. Our platform ensures reliable, secure, and impactful investment decisions while fostering sustainable economic growth.
            </p>
          </motion.div>

          <div className="stats-container">
            <motion.div className="stat-item" variants={itemVariants}>
              <div className="stat-value">85%</div>
              <div className="stat-label">Success Rate</div>
            </motion.div>
            <motion.div className="stat-item" variants={itemVariants}>
              <div className="stat-value">200+</div>
              <div className="stat-label">Businesses Funded</div>
            </motion.div>
            <motion.div className="stat-item" variants={itemVariants}>
              <div className="stat-value">$5M+</div>
              <div className="stat-label">Capital Deployed</div>
            </motion.div>
          </div>

          <motion.div className="card-container" variants={containerVariants}>
            {cardData.map((card, index) => (
              <motion.div 
                key={index}
                className="card"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <div className="icon-container" style={{ backgroundColor: `${card.color}20` }}>
                  <FontAwesomeIcon icon={card.icon} className="icon" style={{ color: card.color }} />
                </div>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;