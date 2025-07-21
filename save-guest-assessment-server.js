const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

app.post('/api/save-guest-assessment', async (req, res) => {
  const { categories, demographics, tempUserId } = req.body;
  if (!categories || !tempUserId) {
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
    return res.status(500).json({ error: error.message });
  }
  res.json({ success: true, data });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Guest assessment server running on http://localhost:${PORT}`);
}); 