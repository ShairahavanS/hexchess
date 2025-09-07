import React from "react";
import "./Footer.css"; // Optional: If you want to use external CSS for styling

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2025 Hexagonal Games. All rights reserved.</p>
        {/* <div className="footer-links">
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/terms-of-service">Terms of Service</a>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
