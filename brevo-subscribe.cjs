const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://leader-leap-dashboard.vercel.app', 'https://your-production-domain.com'] // Replace with your actual domain
    : ['http://localhost:3000', 'http://localhost:8083', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

app.post('/api/subscribe-brevo', async (req, res) => {
  const { email, name } = req.body;
  console.log('[Brevo] Received subscribe request for:', { email, name });
  
  if (!email) {
    console.log('[Brevo] No email provided in request body.');
    return res.status(400).json({ error: 'Email required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('[Brevo] Invalid email format:', email);
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Prepare contact data for Brevo
    const contactData = {
      email: email.toLowerCase().trim(),
      listIds: [2, 15], // Your Brevo list IDs
      updateEnabled: true, // Update existing contacts
    };

    // Add name if provided
    if (name && name.trim()) {
      contactData.attributes = {
        FIRSTNAME: name.trim().split(' ')[0] || '',
        LASTNAME: name.trim().split(' ').slice(1).join(' ') || '',
        FULLNAME: name.trim()
      };
    }

    console.log('[Brevo] Sending contact data to Brevo:', contactData);

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
      console.log('[Brevo] Successfully subscribed contact to Brevo');
      return res.status(200).json({ 
        success: true, 
        message: 'Contact added to Brevo successfully' 
      });
    } else {
      console.error('[Brevo] API error response:', response.status, responseBody);
      return res.status(500).json({ 
        error: 'Failed to subscribe to Brevo',
        details: responseBody 
      });
    }
  } catch (err) {
    console.error('[Brevo] Error subscribing:', err);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
});

// Health check endpoint
app.get('/api/brevo-health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Brevo API server is running',
    hasApiKey: !!process.env.BREVO_API_KEY,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Brevo API Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Brevo API server running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API Key configured: ${!!process.env.BREVO_API_KEY}`);
}); 