# Environment Variables Setup Guide

This document explains all the environment variables you need to set up for the io-net-tool project.

## Required Environment Variables

Create a `.env.local` file in the root of the `io-net-tool` directory with the following variables:

### 1. Database Configuration (REQUIRED)

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

**Example for local PostgreSQL:**

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ionet_tool?schema=public"
```

**Note:** Your Prisma schema is configured to use PostgreSQL. Make sure you have PostgreSQL installed and running, or update the schema to use SQLite if you prefer.

### 2. NextAuth JWT Secret (REQUIRED)

```env
JWT_SECRET="your-super-secret-jwt-key-here"
```

**How to generate a secure secret:**

- On Linux/Mac: `openssl rand -base64 32`
- On Windows (PowerShell): `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))`
- Or use any random string generator

### 3. OAuth Provider Credentials (OPTIONAL)

These are only required if you want to enable social login. You can skip them if you only want email/password authentication.

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

```env
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

```env
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

#### Twitter/X OAuth

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app and get your API keys
3. Set Callback URL: `http://localhost:3000/api/auth/callback/twitter`

```env
TWITTER_CLIENT_ID="your-twitter-client-id"
TWITTER_CLIENT_SECRET="your-twitter-client-secret"
```

## Complete .env.local Example

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://postgres:password@localhost:5432/ionet_tool?schema=public"

# NextAuth (REQUIRED)
JWT_SECRET="your-random-secret-key-here"

# OAuth Providers (OPTIONAL - only add if you want to use them)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
TWITTER_CLIENT_ID=""
TWITTER_CLIENT_SECRET=""
```

## Setup Steps

1. **Create the `.env.local` file:**

   ```bash
   cd io-net-tool
   touch .env.local
   ```

2. **Add the required variables** (at minimum: `DATABASE_URL` and `JWT_SECRET`)

3. **Set up PostgreSQL database:**

   ```bash
   # Create database
   createdb ionet_tool

   # Or using psql:
   psql -U postgres
   CREATE DATABASE ionet_tool;
   ```

4. **Run Prisma migrations:**

   ```bash
   npx prisma migrate dev
   ```

5. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

## Important Notes

- The `.env.local` file is already in `.gitignore` and won't be committed to git
- Never commit your actual `.env.local` file with real credentials
- For production, set these variables in your hosting platform's environment settings
- If you don't want to use OAuth providers, you can leave those variables empty or remove them - the app will still work with email/password authentication

## Troubleshooting

- **Database connection errors:** Make sure PostgreSQL is running and the connection string is correct
- **OAuth not working:** Verify your redirect URIs match exactly (including http vs https and port numbers)
- **JWT errors:** Make sure `JWT_SECRET` is set and is a long, random string
