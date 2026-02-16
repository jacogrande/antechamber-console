# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Antechamber Console is the React admin dashboard for the Antechamber schema-driven intake SaaS. It connects to a separate Hono API backend (`antechamber` repo).

## Tech Stack

- **Framework:** React 18 + Vite + TypeScript (strict mode)
- **UI:** shadcn/ui (Radix primitives + Tailwind CSS)
- **State:** TanStack React Query for server state
- **Forms:** React Hook Form + Zod
- **Auth:** Supabase Auth (token passed to backend)

## Development Commands

```bash
bun install          # Install dependencies
bun run dev          # Start dev server (localhost:5173)
bun run build        # TypeScript check + Vite build
bun run lint         # Run ESLint
```

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `VITE_API_URL` - Backend API URL (optional, defaults to `/api` for local dev proxy)

## Architecture

### Directory Structure

```
src/
├── components/       # React components by feature
│   ├── ui/          # shadcn/ui primitives
│   ├── common/      # Reusable components
│   ├── layout/      # AppShell, Sidebar, Header
│   └── {feature}/   # Feature-specific (schemas, submissions, webhooks)
├── domain/          # Pure business logic (testable, no React)
│   ├── schema/      # Schema manipulation
│   └── undo/        # Undo/redo system
├── hooks/           # Custom React hooks
├── lib/             # Utilities and adapters
│   └── api/         # API client (client.ts + domain endpoints)
├── pages/           # Route-level page components
└── types/           # TypeScript interfaces
```

### Key Patterns

**API Client (`lib/api/client.ts`):**
- All API calls go through `apiGet`, `apiPost`, `apiDelete`
- Auto-injects Supabase auth token as `Authorization: Bearer <token>`
- Auto-injects tenant ID as `X-Tenant-ID` header (stored in localStorage)

**Auth & Tenant Flow:**
1. User logs in → backend returns token + tenant list
2. User selects tenant → stored in localStorage
3. `AuthGuard` protects auth routes, `TenantGuard` protects tenant routes

**Result Type (`lib/utils/result.ts`):**
- Railway-oriented error handling with `Result<T, E>`
- Used in domain logic for explicit error handling

**Undo/Redo (`domain/undo/`):**
- Pure functional implementation with immutable stacks
- Used by `useSchemaBuilder` hook for schema field management

### Import Convention

Always use the `@/` path alias for internal imports:
```typescript
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
```

### Styling

- Tailwind CSS with CSS variables for theming
- Use `cn()` utility from `lib/utils` for class merging
- Component variants via class-variance-authority (CVA)
- Dark mode via `next-themes` with class strategy
