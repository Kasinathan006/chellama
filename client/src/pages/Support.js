import React, { useState } from 'react';
import {
  FaHeadset,
  FaEnvelope,
  FaComments,
  FaBook,
  FaQuestionCircle,
  FaChevronDown,
  FaChevronUp,
  FaPaperPlane
} from 'react-icons/fa';
import './Support.css';

const Support = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'Click the "Register" button in the top right corner, fill in your details, and verify your email address to get started.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept credit/debit cards, bank transfers, PayPal, Skrill, Neteller, and various cryptocurrencies including Bitcoin and Ethereum.'
    },
    {
      question: 'How long do withdrawals take?',
      answer: 'Most withdrawals are processed within 24 hours. Cryptocurrency withdrawals are typically instant once approved.'
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes, we use industry-standard SSL encryption and follow strict data protection protocols to keep your information safe.'
    },
    {
      question: 'How do I claim a bonus?',
      answer: 'Visit the Promotions page, select the bonus you want, and click "Claim Now". Some bonuses may require a promo code.'
    },
    {
      question: 'What is the minimum deposit amount?',
      answer: 'The minimum deposit is $10 for most payment methods. Some methods may have different minimums.'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="support-page">
      <div className="support-hero">
        <div className="container">
          <FaHeadset className="hero-icon" />
          <h1>How Can We Help?</h1>
          <p>Get in touch with our support team or browse our FAQ</p>
        </div>
      </div>

      <div className="container">
        {/* Contact Options */}
        <div className="support-options">
          <div className="support-option">
            <FaEnvelope className="option-icon" />
            <h3>Email Support</h3>
            <p>support@purpleplay.com</p>
            <span>24-48 hour response time</span>
          </div>

          <div className="support-option">
            <FaComments className="option-icon" />
            <h3>Live Chat</h3>
            <p>Available 24/7</p>
            <span>Instant response</span>
          </div>

          <div className="support-option">
            <FaBook className="option-icon" />
            <h3>Help Center</h3>
            <p>Browse articles</p>
            <span>Self-service</span>
          </div>
        </div>

        <div className="support-content">
          {/* FAQ Section */}
          <div className="faq-section">
            <div className="section-header">
              <FaQuestionCircle />
              <h2>Frequently Asked Questions</h2>
            </div>

            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`faq-item ${activeFaq === index ? 'active' : ''}`}
                >
                  <button
                    className="faq-question"
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  >
                    <span>{faq.question}</span>
                    {activeFaq === index ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                  {activeFaq === index && (
                    <div className="faq-answer">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-section">
            <div className="section-header">
              <FaEnvelope />
              <h2>Send us a Message</h2>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select a topic</option>
                  <option value="account">Account Issues</option>
                  <option value="payments">Payments & Withdrawals</option>
                  <option value="games">Game Issues</option>
                  <option value="bonuses">Bonuses & Promotions</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input"
                  rows="5"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg">
                <FaPaperPlane /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
