// src/components/Tutorials.js
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Accordion, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Tutorials = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  // Tutorial categories
  const categories = [
    { id: 'all', name: 'All Tutorials' },
    { id: 'beginner', name: 'Beginner Guides' },
    { id: 'advanced', name: 'Advanced Techniques' },
    { id: 'detection', name: 'Detection Methods' },
    { id: 'security', name: 'Security Practices' }
  ];

  // Tutorial data
  const tutorials = [
    {
      id: 1,
      title: "Getting Started with DeepFake Detection",
      excerpt: "Learn the basics of identifying AI-generated content and how to use our platform effectively.",
      level: "Beginner",
      duration: "15 min",
      category: "beginner",
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      lessons: 5,
      lastUpdated: "Sept 10, 2025"
    },
    {
      id: 2,
      title: "Advanced Deepfake Analysis Techniques",
      excerpt: "Master advanced methods for detecting sophisticated AI-generated media with our expert tools.",
      level: "Advanced",
      duration: "45 min",
      category: "advanced",
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      lessons: 8,
      lastUpdated: "Aug 28, 2025"
    },
    {
      id: 3,
      title: "Understanding AI-Generated Image Artifacts",
      excerpt: "Identify telltale signs and artifacts that reveal an image was AI-generated.",
      level: "Intermediate",
      duration: "25 min",
      category: "detection",
      image: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      lessons: 6,
      lastUpdated: "Sept 5, 2025"
    },
    {
      id: 4,
      title: "Protecting Your Digital Identity from Deepfakes",
      excerpt: "Essential security practices to safeguard yourself against malicious deepfake content.",
      level: "Beginner",
      duration: "20 min",
      category: "security",
      image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      lessons: 4,
      lastUpdated: "Aug 15, 2025"
    },
    {
      id: 5,
      title: "Interpreting Confidence Scores and Results",
      excerpt: "Learn how to accurately interpret detection results and confidence metrics from our AI system.",
      level: "Intermediate",
      duration: "30 min",
      category: "detection",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      lessons: 7,
      lastUpdated: "Sept 2, 2025"
    },
    {
      id: 6,
      title: "API Integration for Developers",
      excerpt: "Technical guide on integrating our deepfake detection API into your applications.",
      level: "Advanced",
      duration: "60 min",
      category: "advanced",
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      lessons: 10,
      lastUpdated: "Jul 20, 2025"
    }
  ];

  // FAQ section
  const faqItems = [
    {
      question: "Do I need technical knowledge to follow these tutorials?",
      answer: "No, we have tutorials for all skill levels. Our beginner guides assume no prior knowledge and gradually build up to more advanced concepts."
    },
    {
      question: "Are these tutorials free?",
      answer: "Yes, all tutorials on our platform are completely free. We believe in making deepfake detection knowledge accessible to everyone."
    },
    {
      question: "How often are new tutorials added?",
      answer: "We add new tutorials every month. Subscribe to our newsletter to stay updated on new content."
    },
    {
      question: "Can I request a tutorial on a specific topic?",
      answer: "Absolutely! We welcome suggestions. Please contact us with your tutorial requests."
    }
  ];

  // Filter tutorials based on active category
  const filteredTutorials = activeCategory === 'all' 
    ? tutorials 
    : tutorials.filter(tutorial => tutorial.category === activeCategory);

  return (
    <Container className="py-5 text-light">
      <div className="text-center mb-5">
        <h1 className="text-glow">DeepFakeShield Tutorials</h1>
        <p className="lead">Learn how to detect and protect against AI-generated content with our expert guides</p>
      </div>

      {/* Category Filters */}
      <div className="text-center mb-5">
        <div className="d-flex flex-wrap justify-content-center gap-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "info" : "outline-info"}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              className="mb-2"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Tutorials Grid */}
      <Row className="mb-5">
        {filteredTutorials.map(tutorial => (
          <Col lg={4} md={6} className="mb-4" key={tutorial.id}>
            <Card className="tutorial-card h-100">
              <div className="tutorial-image-container">
                <Card.Img variant="top" src={tutorial.image} />
                <Badge 
                  bg={tutorial.level === 'Beginner' ? 'success' : tutorial.level === 'Intermediate' ? 'warning' : 'danger'} 
                  className="position-absolute top-0 end-0 m-2"
                >
                  {tutorial.level}
                </Badge>
              </div>
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Badge bg="secondary">{tutorial.category}</Badge>
                  <small className="text-muted">{tutorial.duration}</small>
                </div>
                <Card.Title className="h5">{tutorial.title}</Card.Title>
                <Card.Text className="flex-grow-1">{tutorial.excerpt}</Card.Text>
                <div className="d-flex justify-content-between align-items-center mt-auto">
                  <small className="text-muted">{tutorial.lessons} lessons</small>
                  <Button variant="outline-info" size="sm">Start Learning</Button>
                </div>
              </Card.Body>
              <Card.Footer>
                <small className="text-muted">Updated {tutorial.lastUpdated}</small>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Getting Started Section */}
      <Row className="mb-5">
        <Col lg={8} className="mx-auto">
          <Card className="getting-started-card">
            <Card.Body className="text-center p-5">
              <h3 className="mb-3">New to Deepfake Detection?</h3>
              <p className="mb-4">
                Start with our beginner-friendly guide that walks you through the fundamentals of 
                identifying AI-generated content and using our detection tools effectively.
              </p>
              <Button variant="info" size="lg">Start Beginner Tutorial</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* FAQ Section */}
      <Row>
        <Col lg={10} className="mx-auto">
          <h2 className="text-center mb-4">Frequently Asked Questions</h2>
          <Accordion defaultActiveKey="0" className="faq-accordion">
            {faqItems.map((faq, index) => (
              <Accordion.Item eventKey={index.toString()} key={index}>
                <Accordion.Header>{faq.question}</Accordion.Header>
                <Accordion.Body>{faq.answer}</Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>
      </Row>

      {/* Newsletter Signup */}
      <Row className="mt-5">
        <Col lg={8} className="mx-auto">
          <Card className="newsletter-card text-center">
            <Card.Body className="p-5">
              <h4 className="mb-3">Stay Updated with New Tutorials</h4>
              <p className="mb-4">
                Subscribe to our newsletter to get notified when we publish new tutorials and 
                update existing content.
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <input 
                  type="email" 
                  className="form-control w-50" 
                  placeholder="Your email address" 
                />
                <Button variant="info">Subscribe</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Tutorials;