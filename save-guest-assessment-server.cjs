require('dotenv').config();
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'not set');
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

app.post('/api/save-guest-assessment', async (req, res) => {
  try {
    const { categories, demographics, tempUserId } = req.body;
    if (!categories || !tempUserId) {
      console.error('Request missing categories or tempUserId:', req.body);
      return res.status(400).json({ error: 'Missing categories or tempUserId' });
    }
    const { data, error } = await supabase
      .from('assessment_results')
      .insert({
        user_id: tempUserId,
        categories,
        demographics,
        completed: true,
        ai_insights: null,
      })
      .select();
    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error('API route error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Guest assessment server running on http://localhost:${PORT}`);
});

// Add global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
}); 