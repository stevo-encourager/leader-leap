const express = require('express');
const fetch = require('node-fetch');
const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

const app = express();

// Add CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.post('/api/subscribe-brevo', async (req, res) => {
  const { email, firstName, lastName } = req.body;
  console.log('[Brevo] Received subscribe request for:', email, 'Name:', firstName, lastName);
  if (!email) {
    console.log('[Brevo] No email provided in request body.');
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    // Prepare contact data
    const contactData = { 
      email, 
      listIds: [24, 2] 
    };

    // Add name fields if provided
    if (firstName) {
      contactData.attributes = { ...contactData.attributes, FIRSTNAME: firstName };
    }
    if (lastName) {
      contactData.attributes = { ...contactData.attributes, LASTNAME: lastName };
    }

    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    const responseBody = await response.text();
    console.log('[Brevo] API response status:', response.status);
    console.log('[Brevo] API response body:', responseBody);

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else if (response.status === 400 && responseBody.includes('duplicate_parameter')) {
      // Email already exists in Brevo - treat as success
      console.log('[Brevo] Email already exists, treating as success');
      return res.status(200).json({ success: true, message: 'Email already subscribed' });
    } else {
      return res.status(500).json({ error: responseBody });
    }
  } catch (err) {
    console.error('[Brevo] Error subscribing:', err);
    return res.status(500).json({ error: err.message });
  }
});

// New endpoint for sending PDF emails
app.post('/api/send-pdf-email', async (req, res) => {
  const { email, pdfBase64, assessmentId } = req.body;
  console.log('[Brevo] Received PDF email request for:', email);
  
  if (!email || !pdfBase64) {
    console.log('[Brevo] Missing email or PDF data in request body.');
    return res.status(400).json({ error: 'Email and PDF data required' });
  }

  try {
    // Configure the Brevo SDK
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    
    // Create the transactional email API instance
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    
    // Create the email data
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: email, name: email.split('@')[0] }];
    sendSmtpEmail.sender = { name: 'Encourager Coaching', email: 'info@encouragercoaching.com' };
    sendSmtpEmail.subject = 'Your Leader Leap Assessment Results';
    sendSmtpEmail.htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2F564D; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2F564D; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Leader Leap Assessment Results</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Thank you for completing your Leader Leap Assessment! Your personalised leadership development report is attached to this email.</p>
              <p>This comprehensive report includes:</p>
              <ul>
                <li>Your competency analysis across 11 leadership areas</li>
                <li>Personalised insights and recommendations</li>
                <li>Development priorities and action steps</li>
                <li>Professional development resources</li>
              </ul>
              <p>We recommend reviewing this report with your manager or mentor to create a targeted development plan.</p>
              <p>If you have any questions about your results or would like to discuss professional development coaching, please don't hesitate to reach out.</p>
              <p>Best regards,<br>The Encourager Coaching Team</p>
            </div>
            <div class="footer">
              <p>Encourager Coaching<br>www.encouragercoaching.com</p>
            </div>
          </div>
        </body>
      </html>
    `;
    sendSmtpEmail.attachment = [{
      name: 'leader-leap-assessment-results.pdf',
      content: pdfBase64
    }];

    // Send the email using the SDK
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('[Brevo] Email sent successfully:', result);
    
    return res.status(200).json({ success: true, messageId: result.messageId });
    
  } catch (err) {
    console.error('[Brevo] Error sending PDF email:', err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Brevo API server running on http://localhost:${PORT}`)); 