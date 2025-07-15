interface BrevoContact {
  email: string;
  name?: string;
}

interface BrevoResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
}

// Get the API base URL based on environment
const getApiBaseUrl = (): string => {
  if (import.meta.env.PROD) {
    // Production - Supabase Edge Function
    return 'https://hrgoxcdixvpmcbfgltea.supabase.co/functions/v1/brevo-subscribe';
  }
  // Development - local Railway server
  return 'http://localhost:3001/api/subscribe-brevo';
};

/**
 * Subscribe a contact to Brevo email lists
 * @param contact - The contact information (email and optional name)
 * @returns Promise<BrevoResponse>
 */
export const subscribeToBrevo = async (contact: BrevoContact): Promise<BrevoResponse> => {
  try {
    console.log('[Brevo Integration] Subscribing contact:', contact);
    
    const apiUrl = getApiBaseUrl();
    const isProduction = import.meta.env.PROD;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add Supabase auth header for production
        ...(isProduction && {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        })
      },
      body: JSON.stringify({
        email: contact.email,
        name: contact.name || '',
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('[Brevo Integration] Successfully subscribed:', contact.email);
      return {
        success: true,
        message: data.message || 'Contact added to Brevo successfully'
      };
    } else {
      console.error('[Brevo Integration] Failed to subscribe:', data);
      return {
        success: false,
        error: data.error || 'Failed to subscribe to Brevo',
        details: data.details
      };
    }
  } catch (error) {
    console.error('[Brevo Integration] Error:', error);
    return {
      success: false,
      error: 'Network error',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Check if the Brevo API server is running
 * @returns Promise<boolean>
 */
export const checkBrevoHealth = async (): Promise<boolean> => {
  try {
    const apiUrl = getApiBaseUrl();
    const isProduction = import.meta.env.PROD;
    
    const response = await fetch(apiUrl.replace('/brevo-subscribe', '/brevo-health'), {
      headers: {
        ...(isProduction && {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        })
      }
    });
    const data = await response.json();
    return data.status === 'ok' && data.hasApiKey;
  } catch (error) {
    console.error('[Brevo Integration] Health check failed:', error);
    return false;
  }
}; 