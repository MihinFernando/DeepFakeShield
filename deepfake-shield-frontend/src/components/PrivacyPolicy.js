// src/components/PrivacyPolicy.js
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const PrivacyPolicy = () => {
  return (
    <Container className="py-5 text-light">
      {/* Header Section */}
      <Row className="mb-5">
        <Col lg={10} className="mx-auto">
          <h1 className="text-glow mb-3">Privacy Policy</h1>
          <p className="lead">Last Updated: September 5, 2025</p>
          <p className="text-light-muted">
            At DeepFakeShield, we take your privacy seriously. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our services.
          </p>
        </Col>
      </Row>

      <Row>
        <Col lg={10} className="mx-auto">
          <Card className="policy-card p-4 mb-4">
            <h2 className="mb-4">1. Information We Collect</h2>
            <h5>1.1 Personal Information</h5>
            <p>
              When you create an account, we may collect personal information such as:
            </p>
            <ul>
              <li>Name and email address</li>
              <li>Profile information</li>
              <li>Payment information (for premium services)</li>
              <li>Communication preferences</li>
            </ul>

            <h5>1.2 Usage Data</h5>
            <p>
              We automatically collect information about your interaction with our services, including:
            </p>
            <ul>
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent on our platform</li>
              <li>Scan history and results (for registered users)</li>
            </ul>

            <h5>1.3 Uploaded Images</h5>
            <p>
              Images uploaded for analysis are processed temporarily for detection purposes. We do not:
            </p>
            <ul>
              <li>Permanently store your images without consent</li>
              <li>Use your images for training our models without explicit permission</li>
              <li>Share your images with third parties</li>
            </ul>
          </Card>

          <Card className="policy-card p-4 mb-4">
            <h2 className="mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process your image analysis requests</li>
              <li>Develop and enhance our detection algorithms (using anonymized data only)</li>
              <li>Communicate with you about updates, security alerts, and support messages</li>
              <li>Personalize your experience and provide content recommendations</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, prevent, and address technical issues and fraudulent activities</li>
            </ul>
          </Card>

          <Card className="policy-card p-4 mb-4">
            <h2 className="mb-4">3. Data Retention</h2>
            <h5>3.1 Image Data</h5>
            <p>
              Uploaded images are processed in real-time and immediately deleted after analysis, 
              unless you choose to save them to your account history. You can delete your scan 
              history at any time from your dashboard.
            </p>

            <h5>3.2 Account Information</h5>
            <p>
              We retain your personal information for as long as your account is active or as 
              needed to provide services. You can request account deletion at any time, which 
              will permanently remove your personal data from our systems.
            </p>

            <h5>3.3 Anonymized Data</h5>
            <p>
              We may retain anonymized, aggregated data indefinitely to improve our services 
              and for statistical purposes. This data cannot be used to identify individual users.
            </p>
          </Card>

          <Card className="policy-card p-4 mb-4">
            <h2 className="mb-4">4. Data Sharing and Disclosure</h2>
            <p>We do not sell, trade, or rent your personal information to third parties.</p>
            
            <h5>4.1 Service Providers</h5>
            <p>
              We may share information with third-party service providers who perform services 
              on our behalf, such as:
            </p>
            <ul>
              <li>Payment processing</li>
              <li>Data analysis</li>
              <li>Email delivery</li>
              <li>Hosting services</li>
              <li>Customer service</li>
            </ul>
            <p>These providers are contractually obligated to protect your data.</p>

            <h5>4.2 Legal Requirements</h5>
            <p>
              We may disclose your information if required to do so by law or in response to 
              valid requests by public authorities (e.g., court orders, subpoenas).
            </p>

            <h5>4.3 Business Transfers</h5>
            <p>
              In the event of a merger, acquisition, or sale of all or a portion of our assets, 
              your information may be transferred as part of that transaction.
            </p>
          </Card>

          <Card className="policy-card p-4 mb-4">
            <h2 className="mb-4">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your 
              personal information against unauthorized access, alteration, disclosure, or 
              destruction. These measures include:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and testing</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure development practices</li>
            </ul>
            <p>
              While we strive to protect your information, no security system is impenetrable, 
              and we cannot guarantee the absolute security of your data.
            </p>
          </Card>

          <Card className="policy-card p-4 mb-4">
            <h2 className="mb-4">6. Your Rights and Choices</h2>
            <h5>6.1 Access and Correction</h5>
            <p>
              You can access and update your personal information through your account settings 
              or by contacting us directly.
            </p>

            <h5>6.2 Data Portability</h5>
            <p>
              You can request a copy of your personal data in a structured, machine-readable format.
            </p>

            <h5>6.3 Deletion</h5>
            <p>
              You can delete your account and associated data at any time through your account 
              settings or by contacting us.
            </p>

            <h5>6.4 Communication Preferences</h5>
            <p>
              You can opt-out of promotional communications by following the unsubscribe 
              instructions included in these messages or through your account settings.
            </p>

            <h5>6.5 Cookies and Tracking</h5>
            <p>
              Most web browsers are set to accept cookies by default. You can usually set your 
              browser to remove or reject cookies, but this may affect the functionality of our services.
            </p>
          </Card>

          <Card className="policy-card p-4 mb-4">
            <h2 className="mb-4">7. Children's Privacy</h2>
            <p>
              Our services are not intended for children under the age of 13. We do not knowingly 
              collect personal information from children under 13. If we become aware that we have 
              collected personal information from a child under 13, we will take steps to delete 
              such information.
            </p>
          </Card>

          <Card className="policy-card p-4 mb-4">
            <h2 className="mb-4">8. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your 
              country of residence. These countries may have data protection laws that are 
              different from the laws of your country. We take appropriate safeguards to ensure 
              that your personal information remains protected in accordance with this Privacy Policy.
            </p>
          </Card>

          <Card className="policy-card p-4 mb-4">
            <h2 className="mb-4">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last Updated" date. 
              We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </Card>

          <Card className="policy-card p-4 mb-4">
            <h2 className="mb-4">10. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or our data practices, 
              please contact us at:
            </p>
            <ul>
              <li>Email: privacy@deepfakeshield.com</li>
              <li>Phone: 070 567 4987</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PrivacyPolicy;