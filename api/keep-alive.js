export default async function handler(req, res) {
  try {
    // Call your Supabase keep-alive function
    const response = await fetch('https://hrgoxcdixvpmcbfgltea.supabase.co/functions/v1/keep-alive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ source: 'vercel-cron' })
    });

    const result = await response.json();
    
    console.log(`Keep-alive ping: ${response.status}`, result);
    
    res.status(200).json({ 
      success: true, 
      message: 'Keep-alive executed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Keep-alive error:', error);
    res.status(500).json({ error: error.message });
  }
}