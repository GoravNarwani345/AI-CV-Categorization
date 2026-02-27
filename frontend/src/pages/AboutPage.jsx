import React from 'react';
import Navbar from '../components/Navbar';
import About from '../components/About';
import Footer from '../components/Footer';
import { FaUsers, FaLightbulb, FaRocket, FaHeart } from 'react-icons/fa';

const AboutPage = () => {
  const team = [
    {
      name: "Arti Lohana",
      role: "Full Stack Developer & AI Integration",
      desc: "working in machine learning and NLP, passionate about revolutionizing recruitment. CS student at Shaheed Benazir Bhutto University, Full Stack Developer.",
      image: "A"
    },
    {
      name: "Aliza Khan",
      role: "Full Stack Developer & AI Integration ",
      desc: "Creative designer focused on user experience and intuitive interfaces. CS student at Shaheed Benazir Bhutto University, Full Stack Developer.",
      image: "A"
    },
  ];

  const values = [
    {
      icon: <FaLightbulb className="text-3xl text-yellow-500 mb-2" />,
      title: "Innovation",
      desc: "We leverage cutting-edge AI to solve real-world career challenges.",
    },
    {
      icon: <FaUsers className="text-3xl text-blue-500 mb-2" />,
      title: "Inclusivity",
      desc: "Creating equal opportunities for all through unbiased technology.",
    },
    {
      icon: <FaRocket className="text-3xl text-green-500 mb-2" />,
      title: "Growth",
      desc: "Empowering individuals and organizations to reach their full potential.",
    },
    {
      icon: <FaHeart className="text-3xl text-red-500 mb-2" />,
      title: "Passion",
      desc: "Driven by our commitment to transform lives through technology.",
    },
  ];

  return (
    <div>
      <Navbar />

      {/* Page Header */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center px-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About AI Career System
          </h1>
          <p className="text-lg text-gray-600">
            Learn about our mission to democratize career opportunities through innovative AI technology.
          </p>
        </div>
      </section>

      <About />

      {/* Mission Section */}
      <section className="py-20 bg-white text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Our Mission</h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-12">
          To democratize career opportunities by harnessing the power of AI, making recruitment fairer,
          faster, and more effective for everyone involved. We believe in a future where technology
          enhances human potential rather than replacing it.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-10">
          {values.map((value, index) => (
            <div key={index} className="p-6 border rounded-2xl hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer">
              <div className="flex justify-center">{value.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Meet Our Team</h2>
        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto px-10">
          {team.map((member, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-md hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer">
              <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">{member.image}</span>
              </div>
              <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
              <p className="text-blue-600 mb-3">{member.role}</p>
              <p className="text-gray-600">{member.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-10 text-center">
          <h2 className="text-3xl font-bold mb-12">Our Impact</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">CVs Analyzed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Companies Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
