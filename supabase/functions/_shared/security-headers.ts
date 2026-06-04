export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none';",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Will be restricted per function
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

export function getCorsHeaders(origin?: string | null): Record<string, string> {
  // Define allowed origins
  const allowedOrigins = [
    'https://www.leader-leap.com',
    'https://leader-leap.com',
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000'
  ]
  
  // Check if origin is allowed
  const isAllowed = origin && allowedOrigins.includes(origin)
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  }
}

export function createSecureResponse(
  body: any, 
  status: number = 200,
  origin?: string | null
): Response {
  return new Response(
    typeof body === 'string' ? body : JSON.stringify(body),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...securityHeaders,
        ...getCorsHeaders(origin)
      }
    }
  )
}