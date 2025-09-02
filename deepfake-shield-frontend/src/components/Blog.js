// src/components/Blog.js
import React from 'react';
import { Container, Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Blog = () => {
  // Sample blog posts data
  const blogPosts = [
    {
      id: 1,
      title: "Understanding Deepfakes: How AI-Generated Media is Evolving",
      excerpt: "Explore the rapid advancements in deepfake technology and how it's becoming increasingly difficult to distinguish AI-generated content from reality.",
      date: "June 22, 2025",
      author: "Kawya Nethmi",
      category: "Technology",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1677442135135-416f8aa26a5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 2,
      title: "The Ethical Implications of Deepfake Technology",
      excerpt: "Dive into the ethical considerations surrounding deepfakes, from misinformation campaigns to privacy concerns and potential regulatory solutions.",
      date: "June 24, 2025",
      author: "Vihanga Rodrigo",
      category: "Ethics",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 3,
      title: "How Our AI Detection Model Works",
      excerpt: "A technical breakdown of the machine learning techniques we use to identify AI-generated images with high accuracy.",
      date: "June 25, 2025",
      author: "Nithika Williams",
      category: "Technology",
      readTime: "10 min read",
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 4,
      title: "Case Study: Detecting Political Deepfakes in the 2024 Election",
      excerpt: "How our technology helped identify and flag AI-generated political content during a recent election cycle.",
      date: "June 25, 2025",
      author: "Mihin Fernando",
      category: "Case Study",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 5,
      title: "The Future of Digital Authenticity: What's Next for Detection Technology",
      excerpt: "Predictions for the next generation of deepfake detection and how the arms race between creation and detection will evolve.",
      date: "July 5, 2025",
      author: "Imani Kaldera",
      category: "Future",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 6,
      title: "Protecting Yourself from Deepfake Scams: A Practical Guide",
      excerpt: "Practical tips for individuals and businesses to protect themselves from the growing threat of deepfake-based fraud.",
      date: "August 18, 2025",
      author: "Dilathma khalifa",
      category: "Security",
      readTime: "9 min read",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    }
  ];

  // Categories for the sidebar
  const categories = [
    { name: "Technology", count: 12 },
    { name: "Ethics", count: 7 },
    { name: "Security", count: 9 },
    { name: "Case Study", count: 5 },
    { name: "Future", count: 4 },
    { name: "Industry News", count: 8 }
  ];

  // Recent posts for the sidebar
  const recentPosts = blogPosts.slice(0, 3);

  return (
    <Container className="py-5 text-light">
      <div className="text-center mb-5">
        <h1 className="text-glow">DeepFakeShield Blog</h1>
        <p className="lead">Insights, updates, and analysis on AI-generated content detection</p>
      </div>

      <Row>
        {/* Main Blog Content */}
        <Col lg={8}>
          <Row>
            {blogPosts.map(post => (
              <Col md={6} className="mb-4" key={post.id}>
                <Card className="blog-card h-100">
                  <div className="blog-image-container">
                    <Card.Img variant="top" src={post.image} />
                    <Badge bg="info" className="position-absolute top-0 end-0 m-2">{post.category}</Badge>
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-2 text-muted small">
                      <span>{post.date}</span> • <span>{post.readTime}</span>
                    </div>
                    <Card.Title className="h5">{post.title}</Card.Title>
                    <Card.Text className="flex-grow-1">{post.excerpt}</Card.Text>
                    <div className="mt-auto">
                      <small className="text-muted">By {post.author}</small>
                      <div className="mt-2">
                        <Button variant="outline-info" size="sm">Read More</Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          <nav aria-label="Blog pagination" className="mt-5">
            <ul className="pagination justify-content-center">
              <li className="page-item disabled">
                <span className="page-link">Previous</span>
              </li>
              <li className="page-item active">
                <span className="page-link">1</span>
              </li>
              <li className="page-item">
                <a className="page-link" href="#!">2</a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#!">3</a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#!">Next</a>
              </li>
            </ul>
          </nav>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* About Blog Card */}
          <Card className="blog-sidebar-card mb-4">
            <Card.Body>
              <h5>About Our Blog</h5>
              <p className="text-light-muted">
                Stay informed about the latest developments in deepfake technology, detection methods, 
                and digital security with insights from our team of experts.
              </p>
              <div className="d-grid">
                <Button variant="outline-light">Subscribe to Updates</Button>
              </div>
            </Card.Body>
          </Card>

          {/* Categories Card */}
          <Card className="blog-sidebar-card mb-4">
            <Card.Body>
              <h5>Categories</h5>
              <ul className="list-unstyled">
                {categories.map((category, index) => (
                  <li key={index} className="mb-2">
                    <Link to="#!" className="text-light-muted">
                      {category.name} <Badge bg="secondary" className="ms-1">{category.count}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>

          {/* Recent Posts Card */}
          <Card className="blog-sidebar-card mb-4">
            <Card.Body>
              <h5>Recent Posts</h5>
              {recentPosts.map(post => (
                <div key={post.id} className="mb-3">
                  <h6 className="mb-0">
                    <Link to="#!" className="text-light">{post.title}</Link>
                  </h6>
                  <small className="text-muted">{post.date}</small>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Newsletter Signup */}
          <Card className="blog-sidebar-card">
            <Card.Body>
              <h5>Subscribe to Newsletter</h5>
              <p className="text-light-muted small">
                Get the latest articles and updates directly in your inbox.
              </p>
              <div className="mb-3">
                <input 
                  type="email" 
                  className="form-control form-control-sm" 
                  placeholder="Your email address" 
                />
              </div>
              <Button variant="info" size="sm" className="w-100">Subscribe</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Blog;