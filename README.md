# RAT

Frontend for the RAT multiplayer word game. Built with Next.js, React, and Socket.IO.

## Overview

RAT is a social deduction game where players receive a secret word from a category. One player (the impostor) doesn't know the word and must blend in during discussions. Players vote to identify the impostor.

### Game Modes

- **Single Player**: A mode to play locally on a single device.
- **Multiplayer**: Real-time online rooms to play with friends.

### Features

- Real-time multiplayer with WebSocket
- Internationalization (Spanish and English)
- Responsive design for mobile and desktop
- Room creation with customizable settings
- Public room browser with search

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Socket.IO Client** - Real-time communication
- **Framer Motion** - Animations

## Requirements

- Node.js 18+
- pnpm (recommended)
- [RAT API](https://github.com/matgarfer499/rat-api) running locally

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

3. Run the development server:

```bash
pnpm dev
```

4. Open http://localhost:3000 in your browser.

## Project Structure

```
app/
  globals.css           # Global styles
  [lang]/               # i18n route segment
    layout.tsx          # Root layout
    page.tsx            # Home page
    categories/         # Category selection
    setup/              # Game setup (single player)
    play/               # Single player game
    reveal/             # Single player reveal
    multiplayer/        # Multiplayer routes
      page.tsx          # Multiplayer lobby
      create/           # Create room
      join/             # Join room
      room/[id]/        # Game room

components/
  game/                 # Game UI components
  icons/                # Icon components
  layout/               # Layout components (Header)
  multiplayer/          # Multiplayer-specific components
  ui/                   # Reusable UI components

hooks/
  use-countdown.ts      # Countdown timer hook
  use-dictionary.ts     # i18n dictionary hook
  use-socket.ts         # Socket.IO client hook

i18n/
  config.ts             # i18n configuration
  get-dictionary.ts     # Dictionary loader
  dictionaries/         # Translation files

lib/
  api.ts                # API client utilities
  fetch-helper.ts       # Fetch wrapper
  game-utils.ts         # Game logic utilities
  rooms-api.ts          # Room API client
  types.ts              # Shared types
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API URL |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm knip` | Find unused code |

## Internationalization

The app supports multiple languages through URL-based routing:

- `/es` - Spanish (default)
- `/en` - English

Translations are stored in `i18n/dictionaries/` as JSON files.
