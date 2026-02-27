import React from "react";
import { Link } from "react-router-dom";
import { FaLinkedin, FaTwitter, FaGithub, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-10 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-white mb-4">AI Career System</h3>
            <p className="text-gray-400 text-sm">
              Empowering careers with AI-driven insights and intelligent job matching.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link to="/features" className="hover:text-blue-400 transition-colors">Features</Link></li>
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/getstarted" className="hover:text-blue-400 transition-colors">Get Started</Link></li>
              <li><span className="cursor-pointer hover:text-blue-400 transition-colors">Career Tips</span></li>
              <li><span className="cursor-pointer hover:text-blue-400 transition-colors">Skills Guide</span></li>
              <li><span className="cursor-pointer hover:text-blue-400 transition-colors">Help Center</span></li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition-colors">
                <FaLinkedin className="text-lg" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-blue-400 transition-colors">
                <FaTwitter className="text-lg" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-gray-600 transition-colors">
                <FaGithub className="text-lg" />
              </a>
              <a href="mailto:support@aicareersystem.com" className="p-2 bg-gray-800 rounded-full hover:bg-green-600 transition-colors">
                <FaEnvelope className="text-lg" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800 py-6 text-center">
        <p className="text-sm">© {currentYear} AI Career System. All Rights Reserved.</p>
        <p className="text-sm mt-2">
          Designed with ❤️ by <span className="text-blue-400">Arti and Aliza</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
