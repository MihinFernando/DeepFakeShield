// src/components/Contact.js
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [showAlert, setShowAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setShowAlert(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Hide alert after 5 seconds
      setTimeout(() => setShowAlert(false), 5000);
    }, 1500);
  };

  // Contact information
  const contactInfo = [
    {
      icon: '📧',
      title: 'Email',
      details: 'support@deepfakeshield.com',
      description: 'Send us an email anytime'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      details: 'Available 24/7',
      description: 'Get instant help from our support team'
    },
    {
      icon: '📞',
      title: 'Phone',
      details: '070 567 4987',
      description: 'Mon-Fri from 8am to 6pm PST'
    },
   
  ];

  // FAQ items
  const faqItems = [
    {
      question: "How long does it take to get a response?",
      answer: "We typically respond to all inquiries within 24 hours. For urgent matters, please use our live chat support."
    },
    {
      question: "Do you offer enterprise solutions?",
      answer: "Yes, we provide custom enterprise solutions for organizations. Contact our sales team to discuss your specific needs."
    },
    {
      question: "Can I schedule a demo?",
      answer: "Absolutely! We'd be happy to give you a personalized demo of our platform. Please request a demo through our contact form."
    },
    {
      question: "Do you have documentation for developers?",
      answer: "Yes, we provide comprehensive API documentation and developer guides. Contact us for access to our developer portal."
    }
  ];

  return (
    <Container className="py-5 text-light">
      {/* Header Section */}
      <Row className="mb-5">
        <Col lg={8} className="mx-auto text-center">
          <h1 className="text-glow mb-3">Contact Us</h1>
          <p className="lead">
            Have questions or need support? We're here to help you protect digital authenticity.
          </p>
        </Col>
      </Row>

      {/* Alert Message */}
      {showAlert && (
        <Row className="mb-4">
          <Col lg={8} className="mx-auto">
            <Alert variant="success" onClose={() => setShowAlert(false)} dismissible>
              <strong>Thank you!</strong> Your message has been sent successfully. We'll get back to you within 24 hours.
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        {/* Contact Form */}
        <Col lg={8} className="mb-5">
          <Card className="contact-card p-4">
            <h3 className="mb-4">Send us a Message</h3>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Your Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Email Address *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email address"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Subject *</Form.Label>
                <Form.Control
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What is this regarding?"
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Message *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us how we can help you..."
                />
              </Form.Group>
              <Button 
                variant="info" 
                type="submit" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending Message...' : 'Send Message'}
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Contact Information */}
        <Col lg={4} className="mb-5">
          <Card className="contact-info-card p-4 mb-4">
            <h4 className="mb-4">Get in Touch</h4>
            {contactInfo.map((item, index) => (
              <div key={index} className="d-flex mb-4">
                <div className="contact-icon me-3" style={{fontSize: '2rem'}}>
                  {item.icon}
                </div>
                <div>
                  <h6 className="mb-1">{item.title}</h6>
                  <p className="mb-1 text-info">{item.details}</p>
                  <small className="text-light-muted">{item.description}</small>
                </div>
              </div>
            ))}
          </Card>

          {/* Support Hours */}
          <Card className="contact-info-card p-4">
            <h5 className="mb-3">Support Hours</h5>
            <div className="mb-2">
              <strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM PST
            </div>
            <div className="mb-2">
              <strong>Saturday:</strong> 10:00 AM - 4:00 PM PST
            </div>
            <div>
              <strong>Sunday:</strong> Closed
            </div>
          </Card>
        </Col>
      </Row>

      {/* FAQ Section */}
      <Row className="mb-5">
        <Col lg={10} className="mx-auto">
          <h2 className="text-center mb-4">Frequently Asked Questions</h2>
          <Row>
            {faqItems.map((item, index) => (
              <Col md={6} key={index} className="mb-3">
                <Card className="faq-card h-100">
                  <Card.Body>
                    <h6 className="text-info">{item.question}</h6>
                    <p className="mb-0">{item.answer}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Map Section */}
      <Row>
        <Col lg={10} className="mx-auto">
          <Card className="map-card">
            <Card.Body className="p-0">
              <div className="map-placeholder d-flex align-items-center justify-content-center">
                <div className="text-center">
                  <div className="mb-3" style={{fontSize: '3rem'}}>🗺️</div>
                  <h5>Our Location</h5>
                  <p className="mb-0">505/4b,Rajagiriya</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;