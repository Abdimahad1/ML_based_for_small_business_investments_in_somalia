import React from "react";
import "./footer.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { motion } from "framer-motion";

const Footer = () => {
  return (
      <motion.footer
        id="contact"  // ✅ anchor target for scroll
        className="footer"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >

      <h2 className="footer-heading">CONTACT US</h2>

      <motion.div
        className="footer-links"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {[
          {
            heading: "Quick Links",
            links: ["Home", "About Us", "Features"],
            ids: ["#home", "#about", "#features"]
          },
          {
            heading: "Resources",
            links: ["Developer API", "Blog", "Tools"],
            ids: ["#developer-api", "#blog", "#tools"]
          },
          {
            heading: "Info",
            links: ["FAQ", "Status", "Contact Us"],
            ids: ["#faq", "#status", "#contact"]
          }
        ].map((col, idx) => (
          <motion.div className="footer-column" key={idx} whileHover={{ scale: 1.02 }}>
            <h3>{col.heading}</h3>
            <ul>
              {col.links.map((link, i) => (
                <li key={i}><a href={col.ids[i]}>{link}</a></li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="footer-subscribe"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3>Get access to exclusive updates</h3>
        <div className="subscribe-form">
          <input type="email" placeholder="Email address" />
          <button className="subscribe-btn">Subscribe</button>
        </div>
      </motion.div>

      <motion.div
        className="footer-social"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3>Social Media</h3>
        <div className="social-icons">
          {[faFacebook, faInstagram, faTwitter, faLinkedin].map((icon, i) => (
            <motion.a
              href="#"
              key={i}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={icon} />
            </motion.a>
          ))}
        </div>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;
