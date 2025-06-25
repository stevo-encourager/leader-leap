const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/api/subscribe-brevo', async (req, res) => {
  const { email } = req.body;
  console.log('[Brevo] Received subscribe request for:', email);
  if (!email) {
    console.log('[Brevo] No email provided in request body.');
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, listIds: [2, 15] }),
    });

    const responseBody = await response.text();
    console.log('[Brevo] API response status:', response.status);
    console.log('[Brevo] API response body:', responseBody);

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: responseBody });
    }
  } catch (err) {
    console.error('[Brevo] Error subscribing:', err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Brevo API server running on http://localhost:${PORT}`)); 