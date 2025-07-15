# Brevo API Integration Setup

This guide will help you set up the Brevo API integration to capture email addresses and names when users sign up.

## Prerequisites

1. A Brevo account (formerly Sendinblue)
2. Your Brevo API key
3. Your Brevo list IDs

## Setup Steps

### 1. Get Your Brevo API Key

1. Log in to your Brevo account
2. Go to Settings > API Keys
3. Create a new API key or copy an existing one
4. Note down your API key

### 2. Get Your List IDs

1. In Brevo, go to Contacts > Lists
2. Note down the IDs of the lists you want to add contacts to
3. Currently configured lists: `[2, 15]` (update these in `brevo-subscribe.cjs` if needed)

### 3. Configure Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Brevo API Configuration
BREVO_API_KEY=your-brevo-api-key-here

# Server Configuration
PORT=3001
```

### 4. Start the Brevo API Server

Run the Brevo API server:

```bash
node brevo-subscribe.cjs
```

The server will start on port 3001 (or the port specified in your .env file).

### 5. Test the Integration

You can test the Brevo API health endpoint:

```bash
curl http://localhost:3001/api/brevo-health
```

## How It Works

### Signup Flow
1. When a user signs up and opts in for emails, they are automatically added to your Brevo lists
2. The system captures both email and name (if provided)
3. Contacts are added to lists with IDs `[2, 15]`

### Consent Flow
1. When users update their email preferences on the Consent page, they are subscribed/unsubscribed accordingly
2. The system handles both new subscriptions and updates to existing contacts

### Error Handling
- Invalid email formats are rejected
- Network errors are logged but don't block the signup process
- Failed subscriptions are logged for debugging

## API Endpoints

- `POST /api/subscribe-brevo` - Subscribe a contact to Brevo
- `GET /api/brevo-health` - Check if the Brevo API server is running

## Troubleshooting

### Common Issues

1. **API Key Not Found**: Make sure your `BREVO_API_KEY` is set in your `.env` file
2. **Server Not Running**: Start the Brevo API server with `node brevo-subscribe.cjs`
3. **Invalid List IDs**: Update the `listIds` array in `brevo-subscribe.cjs` with your actual list IDs
4. **CORS Issues**: The API server runs on a different port, make sure your frontend can reach it

### Debugging

Check the console logs for detailed information about:
- API requests and responses
- Error messages
- Successful subscriptions

## Security Notes

- Never commit your `.env` file to version control
- The Brevo API key should be kept secure
- The API server runs locally and should not be exposed to the internet in production 