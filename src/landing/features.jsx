import React, { useEffect } from "react";
import "./features.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, 
  faChartPie, 
  faBell, 
  faMobileAlt, 
  faCheckCircle, 
  faChartLine 
} from '@fortawesome/free-solid-svg-icons';
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

const featureItems = [
  {
    icon: faRobot,
    title: "AI Recommendations",
    description: "Tailored business matches for your investment profile",
    color: "#5b21b6"
  },
  {
    icon: faChartPie,
    title: "Smart Analytics",
    description: "Real-time tracking of investments and performance",
    color: "#3b82f6"
  },
  {
    icon: faBell,
    title: "Funding Alerts",
    description: "Instant notifications for new opportunities",
    color: "#ef4444"
  },
  {
    icon: faMobileAlt,
    title: "Mobile Ready",
    description: "Seamless experience on all devices",
    color: "#10b981"
  },
  {
    icon: faCheckCircle,
    title: "Verified Profiles",
    description: "Trusted network of businesses and investors",
    color: "#f59e0b"
  },
  {
    icon: faChartLine,
    title: "Growth Insights",
    description: "Actionable reports to accelerate growth",
    color: "#8b5cf6"
  }
];

const FeatureCard = ({ icon, title, description, color, index }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const hoverVariants = {
    hover: {
      y: -10,
      scale: 1.03,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      ref={ref}
      className="feature-card"
      initial="hidden"
      animate={controls}
      variants={cardVariants}
      whileHover="hover"
    >
      <motion.div variants={hoverVariants}>
        <div className="feature-icon-container" style={{ backgroundColor: `${color}20` }}>
          <FontAwesomeIcon 
            icon={icon} 
            className="feature-icon" 
            style={{ color }} 
          />
        </div>
        <h3 className="feature-title">{title}</h3>
        <p className="feature-description">{description}</p>
        <div className="feature-hover-indicator" style={{ backgroundColor: color }} />
      </motion.div>
    </motion.div>
  );
};

const Features = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const headerVariants = {
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

  return (
    <section className="features-section" id="features" ref={ref}>
      <div className="features-background" />
      
      <motion.div 
        className="features-header"
        initial="hidden"
        animate={controls}
        variants={headerVariants}
      >
        <h2 className="features-heading">Key Features</h2>
        <p className="features-subheading">Powerful tools for investors and businesses</p>
      </motion.div>

      <motion.div 
        className="features-container"
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        {featureItems.map((feature, index) => (
          <FeatureCard 
            key={index}
            index={index}
            {...feature}
          />
        ))}
      </motion.div>
    </section>
  );
};

export default Features;