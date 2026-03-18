# Leader Leap - Leadership Assessment Platform

## Project Overview

**Leader Leap** is a comprehensive leadership assessment and development platform that helps individuals identify their leadership strengths and areas for improvement through self-assessment tools, AI-powered insights, and personalized action plans.

**Live URL**: https://leader-leap.com

## Features

- **Leadership Skills Assessment**: 10-category comprehensive assessment covering key leadership competencies
- **AI-Powered Insights**: Personalized feedback and recommendations using OpenAI
- **Skills Gap Analysis**: Visual charts and detailed analysis of strengths and improvement areas
- **Action Plans**: Customized development plans with SMART goals
- **PDF Export**: Download assessment results and action plans
- **Guest Mode**: Try the assessment without creating an account
- **User Dashboard**: Track assessment history and progress over time
- **Email Notifications**: Welcome emails and newsletter subscriptions via Resend

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **State Management**: React Query + Context API
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **PDF Generation**: @react-pdf/renderer, html2canvas, jspdf

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Edge Functions**: Supabase Edge Functions (Deno)
- **Email Service**: Resend API
- **AI Integration**: OpenAI API

### Deployment
- **Hosting**: Vercel
- **Domain**: leader-leap.com

## Getting Started

### Prerequisites
- Node.js & npm (install with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Supabase account
- Resend account (for email functionality)
- OpenAI API key (for AI insights)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/stevo-encourager/leader-leap.git
cd leader-leap-dashboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key

# Admin Configuration
VITE_ADMIN_EMAILS=admin@example.com
```

4. **Start development server**
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run seo-check` - Check SEO configuration

## Project Structure

```
leader-leap-dashboard/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Route-level page components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions and helpers
│   ├── contexts/       # React Context providers
│   └── integrations/   # External service integrations
├── supabase/
│   ├── functions/      # Edge functions
│   └── migrations/     # Database migrations
├── public/            # Static assets
└── CLAUDE.md         # AI assistant guidelines
```

## Database Schema

The application uses Supabase with the following main tables:
- `profiles` - User profiles and preferences
- `assessment_results` - Assessment data and AI insights
- `action_plans` - Personalized development plans
- `temp_assessment_data` - Temporary storage for guest assessments

All tables are protected with Row Level Security (RLS) policies.

## Deployment

### Vercel Deployment

The project is configured for automatic deployment via Vercel:

1. Push changes to the main branch
2. Vercel automatically builds and deploys
3. Preview deployments are created for pull requests

### Supabase Edge Functions

Deploy edge functions using the Supabase CLI:
```bash
npx supabase functions deploy function-name
```

Current edge functions:
- `send-welcome-email` - Welcome email for new users
- `resend-subscribe` - Newsletter subscription
- `resend-unsubscribe` - Newsletter unsubscription
- `generate-insights` - AI-powered assessment insights
- `save-guest-assessment` - Save guest assessment data

## Development Guidelines

### Code Quality
- Follow TypeScript best practices
- Use existing component patterns
- Maintain consistent code formatting
- Write meaningful commit messages

### Security
- Never commit secrets or API keys
- Use environment variables for sensitive data
- Follow Supabase RLS best practices
- Validate all user inputs

### Database Operations
- Use Supabase migrations for schema changes
- Never run destructive operations without backups
- Test database changes in development first

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the project conventions
3. Test thoroughly in development
4. Submit a pull request with clear description

## Support

For questions or issues:
- Email: steve@leader-leap.com
- GitHub Issues: [Create an issue](https://github.com/stevo-encourager/leader-leap/issues)

## License

© 2025 Leader Leap. All rights reserved.

---

Built with ❤️ by Steve Thompson | Encourager Coaching