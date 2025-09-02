// src/components/AboutUs.js
import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  // Team members data
  const teamMembers = [
    {
      id: 1,
      name: "Kawya Nethmi",
      role: "Founder & CEO",
      bio: "AI researcher with 8+ years of experience in computer vision and deep learning. Formerly at leading tech companies working on media authenticity solutions.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 2,
      name: "Alex Johnson",
      role: "Lead AI Engineer",
      bio: "Ph.D. in Machine Learning with expertise in generative adversarial networks and digital forensics. Published multiple papers on deepfake detection.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 3,
      name: "Sarah Williams",
      role: "Head of Product",
      bio: "Product management expert with a background in cybersecurity. Passionate about creating user-friendly solutions for complex technical challenges.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 4,
      name: "Michael Chen",
      role: "Security Researcher",
      bio: "Digital forensics specialist with focus on media authentication. Developed several patented techniques for detecting manipulated content.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    }
  ];

  // Company milestones
  const milestones = [
    {
      year: "2025",
      title: "Company Founded",
      description: "DeepFakeShield was established with a mission to combat AI-generated misinformation."
    },
    {
      year: "2025 Q1",
      title: "Alpha Release",
      description: "Launched our first detection model with 89% accuracy on benchmark tests."
    },
    {
      year: "2025 Q3",
      title: "Seed Funding",
      description: "Raised $2.5M in seed funding to expand our research and development team."
    },
    {
      year: "2025",
      title: "Platform Launch",
      description: "Public launch of our web platform with advanced detection capabilities."
    }
  ];

  return (
    <Container className="py-5 text-light">
      {/* Hero Section */}
      <Row className="mb-5">
        <Col lg={8} className="mx-auto text-center">
          <h1 className="text-glow mb-4">About DeepFakeShield</h1>
          <p className="lead mb-4">
            We're on a mission to protect digital authenticity and combat misinformation 
            in the age of AI-generated content.
          </p>
        </Col>
      </Row>

      {/* Our Story Section */}
      <Row className="mb-5">
        <Col lg={10} className="mx-auto">
          <Card className="about-card p-4">
            <h2 className="text-center mb-4">Our Story</h2>
            <p>
              DeepFakeShield was founded in 2025 amidst growing concerns about the rapid advancement 
              of AI-generated media. Our team recognized the potential for these technologies to be 
              misused for misinformation, fraud, and manipulation.
            </p>
            <p>
              What started as a research project at a leading university quickly evolved into a 
              full-fledged platform as we saw the urgent need for accessible, reliable tools to 
              detect AI-generated content. Today, we combine state-of-the-art machine learning 
              with digital forensics to provide some of the most accurate detection capabilities 
              available.
            </p>
            <p>
              We believe in a future where technology empowers truth rather than obscures it. 
              Our work is dedicated to ensuring that as AI capabilities grow, so do our abilities 
              to maintain trust and authenticity in digital media.
            </p>
          </Card>
        </Col>
      </Row>

      {/* Mission and Vision */}
      <Row className="mb-5">
        <Col md={6} className="mb-4">
          <Card className="h-100 about-card">
            <Card.Body className="text-center p-4">
              <div className="about-icon mb-3">🎯</div>
              <Card.Title>Our Mission</Card.Title>
              <Card.Text>
                To develop advanced AI-powered tools that detect and prevent the harmful use of 
                synthetic media, protecting individuals and organizations from digital deception.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="h-100 about-card">
            <Card.Body className="text-center p-4">
              <div className="about-icon mb-3">🔭</div>
              <Card.Title>Our Vision</Card.Title>
              <Card.Text>
                A digital ecosystem where authenticity is verifiable, trust is maintained, and 
                AI technologies are used responsibly for the benefit of society.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Our Team Section */}
      <Row className="mb-5">
        <Col className="text-center">
          <h2 className="mb-5">Meet Our Team</h2>
          <Row>
            {teamMembers.map(member => (
              <Col lg={3} md={6} className="mb-4" key={member.id}>
                <Card className="team-card h-100">
                  <div className="team-image-container">
                    <Card.Img variant="top" src={member.image} />
                  </div>
                  <Card.Body className="text-center">
                    <Card.Title>{member.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-info">{member.role}</Card.Subtitle>
                    <Card.Text>{member.bio}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Milestones Section */}
      <Row className="mb-5">
        <Col lg={10} className="mx-auto">
          <h2 className="text-center mb-4">Our Journey</h2>
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <div className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`} key={index}>
                <div className="timeline-content">
                  <h5>{milestone.year}</h5>
                  <h6>{milestone.title}</h6>
                  <p>{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Col>
      </Row>

      {/* Technology Section */}
      <Row className="mb-5">
        <Col lg={10} className="mx-auto">
          <Card className="about-card p-4">
            <h2 className="text-center mb-4">Our Technology</h2>
            <p>
              DeepFakeShield utilizes a multi-modal approach to detection, combining:
            </p>
            <ul>
              <li>Advanced neural network architectures trained on millions of real and AI-generated images</li>
              <li>Digital forensics analysis that examines compression artifacts, lighting inconsistencies, and biological impossibilities</li>
              <li>Proprietary algorithms that detect subtle patterns indicative of AI generation</li>
              <li>Continuous learning systems that adapt to new AI models as they emerge</li>
            </ul>
            <p>
              Our models achieve over 95% accuracy on benchmark tests and are continuously 
              improved as new threats emerge.
            </p>
          </Card>
        </Col>
      </Row>

      {/* Call to Action */}
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="cta-card text-center">
            <Card.Body className="p-5">
              <h3 className="mb-3">Join Us in Protecting Digital Authenticity</h3>
              <p className="mb-4">
                Whether you're an individual concerned about misinformation or an organization 
                looking to protect your digital assets, we're here to help.
              </p>
              <Button variant="info" size="lg" className="me-3">Get Started</Button>
              <Button variant="outline-light" size="lg" as={Link} to="/contact">
                Contact Us
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutUs;