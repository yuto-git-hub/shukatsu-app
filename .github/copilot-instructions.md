# GitHub Copilot Instructions

This is a just-activity (shukatsu) management application built with Next.js.

## Project Overview
- **Name**: 就活管理 (Job Search Management App)
- **Type**: Full-stack Next.js web application
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Storage**: Browser LocalStorage

## Key Features
1. **Schedule Management** - Track interviews, tests, and company events
2. **Company Information** - Store and organize company details
3. **Email Management** - Record and manage company communications
4. **Reminders** - Task management with priority levels
5. **User Profile** - Store personal and academic information
6. **Settings** - Data backup and export functionality

## Technology Stack
- **Framework**: Next.js 14 with App Router
- **UI**: React 18 with Tailwind CSS
- **State Management**: React Hooks + LocalStorage
- **Type Safety**: TypeScript 5.2
- **Code Quality**: ESLint with Next.js rules
- **CSS Processing**: PostCSS with Tailwind and Autoprefixer

## File Structure
- `src/app/` - Next.js App Router pages (dashboard, schedules, companies, emails, reminders, profile, settings)
- `src/components/` - Reusable React components (Navigation, Forms)
- `src/lib/` - Utility functions and LocalStorage management
- `src/types/` - TypeScript type definitions for all data models
- `public/` - Static assets directory
- `tailwind.config.ts` - Tailwind CSS configuration
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration

## Development Guidelines

### Component Development
- Create client components for interactive features (`'use client'`)
- Use TypeScript interfaces for all props
- Follow the existing component structure in `src/components/`

### Data Management
- Use `storage.get()` and `storage.set()` from `src/lib/storage.ts`
- Generate unique IDs with `generateId()` from `src/lib/utils.ts`
- Store all data in KEYS constants defined in `storage.ts`

### Styling
- Use Tailwind CSS utility classes
- Follow the color scheme: indigo (#3B82F6) for primary, green (#10B981) for secondary
- Ensure responsive design with mobile-first approach

### Type Safety
- Define interfaces in `src/types/index.ts`
- Keep types organized by feature
- Use strict mode in TypeScript

## Installation & Setup
1. Ensure Node.js is installed
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Open `http://localhost:3000` in browser

## Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Future Enhancements
- Firebase integration for cloud backup
- Dark mode support
- Push notifications
- Gmail/Outlook API integration
- Calendar view
- Analytics dashboard
- PWA (Progressive Web App) conversion
- Mobile app version

## Data Privacy
All data is stored locally in the browser's LocalStorage. No data is sent to external servers. Users should regularly export data via the Settings page for backup purposes.
