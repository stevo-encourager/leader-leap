# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/7f12c5cc-5c91-4071-abf7-9802cae8c209

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7f12c5cc-5c91-4071-abf7-9802cae8c209) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/7f12c5cc-5c91-4071-abf7-9802cae8c209) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Development Rules & Guidelines

### 🚨 Critical Rules (Never Violate)

**Database Operations:**
- **NEVER** initiate database resets, truncates, or destructive operations without explicit, multi-step user confirmation
- **NEVER** modify database schema outside of Supabase migrations
- **NEVER** create new standalone SQL files without explicit need and approval
- **ALWAYS** verify current database state before suggesting changes

**Code Modifications:**
- **NEVER** modify the core logic inside existing hooks without explicit permission
- **NEVER** make any code changes without presenting them step-by-step first
- **ALWAYS** ask for explicit consent before implementing changes
- **ALWAYS** explain the reasoning behind suggested modifications

**Security:**
- **NEVER** modify RLS policies without thorough explanation and approval
- **NEVER** suggest security changes without explicit approval
- **ALWAYS** consider security implications of any database changes

### 🔧 Project Conventions

**Database:**
- Use Supabase migrations for all schema changes
- Standalone SQL files are for manual maintenance only
- This project uses a remotely hosted database (no local Supabase instance)

**Code Quality:**
- Follow existing code patterns and conventions
- Use TypeScript types consistently
- Maintain existing file structure
- Respect the current tech stack (Vite, React, Supabase)

**Communication:**
- Proceed step-by-step and ask for consent
- Explain the reasoning behind suggestions
- Provide context for all recommendations
- If unsure about a change, ask for clarification

### 🎨 Design Guidelines

- Button colors in emails should match the dark green from the website's results dashboard
- Admin pages should never be indexed by search engines (private access only)

### 📝 For AI Assistants

When working on this project, please:
1. Read and follow these development rules
2. Present changes step-by-step before implementing
3. Ask for explicit permission before making modifications
4. Explain your reasoning and provide context
5. Respect the existing codebase patterns and conventions
