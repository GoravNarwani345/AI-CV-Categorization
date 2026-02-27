import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      {/* Logo */}
      <h1 className="text-2xl font-bold text-blue-600 tracking-wide">
        AI Career System
      </h1>

      {/* Desktop Menu Links */}
      <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <Link to="/features" className="hover:text-blue-600 transition-colors">Features</Link>
        <Link to="/about" className="hover:text-blue-600 transition-colors">About</Link>
        <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
      </div>

      {/* CTA Button */}
      <Link to='/getstarted' className="hidden md:block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
        Get Started
      </Link>

      {/* Hamburger Menu Button */}
      <button
        className="md:hidden text-gray-700 focus:outline-none"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-md transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-10 py-4 space-y-4">
          <Link to="/" className="block text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/features" className="block text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Features</Link>
          <Link to="/about" className="block text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" className="block text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link to="/getstarted" className="block w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-center" onClick={() => setMenuOpen(false)}>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
