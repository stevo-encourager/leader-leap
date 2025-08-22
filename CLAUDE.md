# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Build for development:**
```bash
npm run build:dev
```

**Lint code:**
```bash
npm run lint
```

**Preview production build:**
```bash
npm run preview
```

**SEO check:**
```bash
npm run seo-check
```

## Architecture Overview

This is a React-based leadership assessment dashboard built with:

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **State Management**: React Query + Context API
- **Authentication**: Supabase Auth
- **PDF Generation**: @react-pdf/renderer, html2canvas, jspdf
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Email**: EmailJS + Brevo/Sendinblue

### Core Application Structure

**Assessment Flow:**
- Multi-step leadership skills assessment across 10 competency categories
- Guest users can complete assessments with temporary data storage
- Registered users get persistent assessment history and AI insights
- Results include skill gap analysis, charts, and personalized action plans

**Database Schema:**
- `assessment_results` - Assessment data and AI insights
- `profiles` - User profiles with GDPR consent tracking  
- `temp_assessment_data` - Temporary storage for guest assessments
- `action_plans` - Personalized development plans linked to assessments

**Key Components:**
- Assessment form with category-based skill ratings
- Results dashboard with charts and detailed analysis
- Admin panel for user management and analytics
- PDF export functionality for results and action plans

### Authentication & Authorization

- Supabase auth with email/password and password reset
- Row Level Security (RLS) policies protect user data
- Super admin access restricted to specific email addresses
- Guest assessment flow with optional account creation

### API Integration

- Supabase functions for backend operations
- OpenAI integration for AI-powered insights generation
- Email services via Brevo for notifications and subscriptions

## Critical Development Rules

**Database Operations:**
- NEVER initiate database resets, truncates, or destructive operations without explicit confirmation
- NEVER modify database schema outside of Supabase migrations  
- NEVER create new standalone SQL files without explicit need and approval
- All schema changes must use Supabase migrations in `/supabase/migrations/`

**Code Modifications:**
- NEVER modify the core logic inside existing hooks without explicit permission
- ALWAYS ask for explicit consent before implementing changes
- ALWAYS explain the reasoning behind suggested modifications
- Follow existing code patterns and TypeScript conventions

**Security:**
- NEVER modify RLS policies without thorough explanation and approval
- NEVER commit secrets or expose API keys
- Admin pages should never be indexed by search engines

## File Structure Notes

- `/src/components/` - Reusable React components organized by feature
- `/src/pages/` - Route-level page components
- `/src/hooks/` - Custom React hooks for data fetching and state management
- `/src/utils/` - Assessment calculations, data normalization, and utilities
- `/src/integrations/supabase/` - Database client and TypeScript types
- `/supabase/functions/` - Edge functions for backend operations
- `/supabase/migrations/` - Database schema changes

## Assessment Data Structure

The assessment covers 10 leadership competencies with multiple skills per category. Assessment data is normalized and stored as JSON with calculated metrics for gap analysis and reporting.

## Communication Guidelines

- Proceed step-by-step and ask for consent before making changes
- Explain the reasoning behind suggestions with context
- Respect existing codebase patterns and the current tech stack
- If unsure about a change, ask for clarification