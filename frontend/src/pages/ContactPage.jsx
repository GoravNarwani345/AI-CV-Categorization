import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaGithub, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const ContactPage = () => {
  const contactInfo = [
    {
      icon: <FaEnvelope className="text-2xl text-blue-600" />,
      title: "Email",
      details: "support@aicareersystem.com",
      desc: "Send us an email anytime!",
    },
    {
      icon: <FaPhone className="text-2xl text-green-600" />,
      title: "Phone",
      details: "+1 (555) 123-4567",
      desc: "Mon-Fri from 8am to 5pm.",
    },
    {
      icon: <FaMapMarkerAlt className="text-2xl text-red-600" />,
      title: "Office",
      details: "123 AI Street, Tech City, TC 12345",
      desc: "Come say hello at our HQ.",
    },
  ];

  const socialLinks = [
    { icon: <FaLinkedin className="text-2xl text-blue-700" />, url: "#", label: "LinkedIn" },
    { icon: <FaTwitter className="text-2xl text-blue-400" />, url: "#", label: "Twitter" },
    { icon: <FaGithub className="text-2xl text-gray-800" />, url: "#", label: "GitHub" },
  ];

  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div>
      <Navbar />

      {/* Page Header */}
      {/* <section className="pt-24 pb-12 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center px-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get In Touch
          </h1>
          <p className="text-lg text-gray-600">
            Have questions or need support? We're here to help you succeed with our AI Career System.
          </p>
        </div>
      </section> */}

      <Contact />

      {/* Contact Information */}
      <section className="py-20 bg-white">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Contact Information</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-10">
          {contactInfo.map((info, index) => (
            <div key={index} className="text-center p-6 border rounded-2xl hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer">
              <div className="flex justify-center mb-4">{info.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{info.title}</h3>
              <p className="text-gray-800 font-medium mb-1">{info.details}</p>
              <p className="text-gray-600 text-sm">{info.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Media */}
      <section className="py-20 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Follow Us</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Stay connected and get the latest updates on AI career innovations.
        </p>
        <div className="flex justify-center space-x-6">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.url}
              className="p-3 bg-white rounded-full shadow-md hover:scale-110 hover:shadow-xl transition-all duration-300 cursor-pointer"
              aria-label={social.label}
            >
              {social.icon}
            </a>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Frequently Asked Questions</h2>
        <div className="max-w-4xl mx-auto space-y-6 px-10">
          <FAQItem
            index={0}
            question="How does the AI CV categorization work?"
            answer="Our AI uses natural language processing to analyze resume content, extracting skills, experience, and qualifications to categorize candidates accurately."
            isOpen={openFAQ === 0}
            toggle={() => toggleFAQ(0)}
          />
          <FAQItem
            index={1}
            question="Is my data secure?"
            answer="Yes, we use enterprise-grade encryption and comply with all major data protection regulations to ensure your information is safe."
            isOpen={openFAQ === 1}
            toggle={() => toggleFAQ(1)}
          />
          <FAQItem
            index={2}
            question="Can I use this for free?"
            answer="We offer a free tier with basic features. Premium plans unlock advanced AI capabilities and unlimited usage."
            isOpen={openFAQ === 2}
            toggle={() => toggleFAQ(2)}
          />
          <FAQItem
            index={3}
            question="How do I get started?"
            answer="Simply sign up for an account, upload your resume, and let our AI guide you through personalized career recommendations."
            isOpen={openFAQ === 3}
            toggle={() => toggleFAQ(3)}
          />
          <FAQItem
            index={4}
            question="Do you support multiple languages?"
            answer="Yes, our system supports multiple languages and can analyze resumes in various formats and languages."
            isOpen={openFAQ === 4}
            toggle={() => toggleFAQ(4)}
          />
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-10 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Visit Our Office</h2>
          <div className="bg-gray-200 h-64 rounded-2xl flex items-center justify-center">
            <p className="text-gray-600">Interactive Map Placeholder</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FAQItem = ({ index, question, answer, isOpen, toggle }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full text-left p-6 bg-white hover:bg-gray-50 transition flex justify-between items-center"
        onClick={toggle}
      >
        <h3 className="text-lg font-semibold text-gray-800">{question}</h3>
        {isOpen ? <FaChevronUp className="text-gray-600" /> : <FaChevronDown className="text-gray-600" />}
      </button>
      {isOpen && (
        <div className="px-6 pb-6">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default ContactPage;
