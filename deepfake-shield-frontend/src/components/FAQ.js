// src/components/FAQ.js
import React from 'react';
import { Container, Accordion, Card } from 'react-bootstrap';

const FAQ = () => {
  return (
    <Container className="py-5 text-light">
      <h2 className="text-center mb-4 text-glow">Frequently Asked Questions</h2>
      
      <Accordion defaultActiveKey="0" className="faq-accordion">
        <Card className="faq-card mb-3">
          <Accordion.Item eventKey="0">
            <Accordion.Header>What is DeepFakeShield?</Accordion.Header>
            <Accordion.Body>
              DeepFakeShield is an AI-powered platform that helps detect AI-generated images and prevent potential harm from deepfake technology. Our advanced algorithms analyze images to determine whether they were created by AI or are authentic photographs.
            </Accordion.Body>
          </Accordion.Item>
        </Card>

        <Card className="faq-card mb-3">
          <Accordion.Item eventKey="1">
            <Accordion.Header>How accurate is the detection?</Accordion.Header>
            <Accordion.Body>
              Our AI model achieves an accuracy rate of over 95% in controlled tests. However, accuracy can vary based on image quality, the AI model used to generate the image, and other factors. We continuously improve our algorithms to stay ahead of evolving deepfake technology.
            </Accordion.Body>
          </Accordion.Item>
        </Card>

        <Card className="faq-card mb-3">
          <Accordion.Item eventKey="2">
            <Accordion.Header>How many free scans do I get?</Accordion.Header>
            <Accordion.Body>
              Anonymous users receive 3 free scans. After that, you'll need to create an account to continue using our service. Registered users enjoy unlimited scans and additional features like scan history tracking.
            </Accordion.Body>
          </Accordion.Item>
        </Card>

        <Card className="faq-card mb-3">
          <Accordion.Item eventKey="3">
            <Accordion.Header>What image formats are supported?</Accordion.Header>
            <Accordion.Body>
              We support common image formats including JPG, JPEG, PNG, and WEBP. For best results, use high-quality images with clear details and avoid heavily compressed files.
            </Accordion.Body>
          </Accordion.Item>
        </Card>

        <Card className="faq-card mb-3">
          <Accordion.Item eventKey="4">
            <Accordion.Header>Is my data secure?</Accordion.Header>
            <Accordion.Body>
              Yes, we take privacy seriously. Uploaded images are processed securely and are not stored longer than necessary for analysis. For registered users, scan history is stored encrypted and is only accessible to you.
            </Accordion.Body>
          </Accordion.Item>
        </Card>

        <Card className="faq-card mb-3">
          <Accordion.Item eventKey="5">
            <Accordion.Header>Can I use this for commercial purposes?</Accordion.Header>
            <Accordion.Body>
              Our free tier is for personal use only. For commercial applications or high-volume usage, please contact us about our enterprise solutions which offer API access, higher rate limits, and dedicated support.
            </Accordion.Body>
          </Accordion.Item>
        </Card>

        <Card className="faq-card mb-3">
          <Accordion.Item eventKey="6">
            <Accordion.Header>What does the confidence score mean?</Accordion.Header>
            <Accordion.Body>
              The confidence score represents how certain our AI is about its determination. A higher percentage indicates stronger confidence in the result. Results above 85% are typically very reliable, while results between 60-85% should be interpreted with caution.
            </Accordion.Body>
          </Accordion.Item>
        </Card>

        <Card className="faq-card mb-3">
          <Accordion.Item eventKey="7">
            <Accordion.Header>How can I improve detection accuracy?</Accordion.Header>
            <Accordion.Body>
              For best results, use high-resolution images with minimal compression. Avoid images that have been heavily edited or filtered. The AI performs best with clear, well-lit photos where facial features (if present) are clearly visible.
            </Accordion.Body>
          </Accordion.Item>
        </Card>
      </Accordion>
    </Container>
  );
};

export default FAQ;