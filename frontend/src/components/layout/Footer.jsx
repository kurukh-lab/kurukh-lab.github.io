import React from 'react';
import { Link } from 'react-router-dom';
import { KurukhDictionaryLogo } from '../logo/KurukhDictionaryLogo';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-base-300">
      <div className="footer p-10 text-base-content max-w-7xl mx-auto">
        <div>
          <div className="w-16 h-16 mb-2">
            <KurukhDictionaryLogo />
          </div>
          <p className="averia-serif-libre-regular">
            <span className="font-bold">Kurukh Dictionary</span><br/>
            Preserving and sharing the Kurukh language<br />
            since 2023
          </p>
          <p className="text-sm mt-2">© {currentYear} All Rights Reserved</p>
        </div> 
        
        <div>
          <span className="footer-title">Explore</span> 
          <Link to="/" className="link link-hover hover:text-primary transition-colors">Home</Link> 
          <Link to="/contribute" className="link link-hover hover:text-primary transition-colors">Contribute</Link> 
          <Link to="/about" className="link link-hover hover:text-primary transition-colors">About</Link>
        </div> 
        
        <div>
          <span className="footer-title">Account</span> 
          <Link to="/login" className="link link-hover hover:text-primary transition-colors">Login</Link> 
          <Link to="/register" className="link link-hover hover:text-primary transition-colors">Register</Link> 
          <Link to="/my-contributions" className="link link-hover hover:text-primary transition-colors">My Contributions</Link>
        </div> 
        
        <div>
          <span className="footer-title">Legal</span> 
          <Link to="/terms" className="link link-hover hover:text-primary transition-colors">Terms of use</Link> 
          <Link to="/privacy" className="link link-hover hover:text-primary transition-colors">Privacy policy</Link>
          <Link to="/contact" className="link link-hover hover:text-primary transition-colors">Contact Us</Link>
        </div>
      </div>
      
      <div className="py-4 border-t border-base-200 text-center text-sm">
        <div className="max-w-7xl mx-auto px-4">
          <p>
            Made with ❤️ for the Kurukh community. <a href="https://github.com/yourusername/kurukh-dictionary" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">GitHub</a>
          </p>
        </div>
      </div>
    </footer>
  );
};
