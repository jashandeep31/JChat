# JChat

JChat is a modern chat application built with advanced features for seamless communication. This application supports real-time messaging, image sharing with download capabilities, and markdown rendering.

## Features

- Real-time messaging
- User authentication and profiles
- Image sharing with download functionality
- Markdown support via next-mdx-remote-client
- Bring your own Key
- Chat share

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL Database
- Redis Database
- PNPM package manager

## Setup Instructions

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/jashandeep31/JChat.git
   cd JChat
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

### Environment Configuration

The project requires three separate environment files:

1. Copy all `.env.example` files to their corresponding `.env` files in these folders:

   - `backend/`
   - `database/`
   - `web/`

   For each folder:

   ```bash
   cp <folder>/.env.example <folder>/.env
   ```

2. Update each `.env` file with your specific configuration values.

### Running the Application

Start the development server:

```bash
pnpm dev
```

The application should now be running on the configured port (typically http://localhost:3000).

## Technologies Used

- Next.js
- TypeScript
- PostgreSQL
- Redis
- next-mdx-remote-client

## License

MIT
