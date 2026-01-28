This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Flight Search Engine

A modern flight search application built with Next.js, featuring real-time flight search, filtering, and price visualization. The app integrates with the Amadeus API for flight data, with automatic fallback to mock data when the API is unavailable.

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm/bun
- Amadeus API credentials (optional - app will use mock data if not configured)

### Installation

1. **Clone the repository** (if applicable) and navigate to the project directory:
   ```bash
   cd aerolens
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**:
   
   Create a `.env.local` file in the `aerolens` directory (you can copy from `.env.example`):
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` and add your Amadeus API credentials:
   ```env
   AMADEUS_CLIENT_ID=your_amadeus_client_id_here
   AMADEUS_CLIENT_SECRET=your_amadeus_client_secret_here
   ```
   
   **Getting Amadeus API Credentials:**
   - Visit [Amadeus for Developers](https://developers.amadeus.com/)
   - Sign up for a free account
   - Create a new app to get your `Client ID` and `Client Secret`
   - Use the **test environment** credentials for development
   - The app uses the Amadeus test API by default (`test.api.amadeus.com`)
   
   **Note:** If you don't have Amadeus credentials or prefer to test without them, the app will automatically fall back to mock data when the API is unavailable. You can leave the environment variables empty or skip this step entirely.

4. **Run the development server**:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

The following environment variables are used by the application:

| Variable | Description | Required |
|----------|-------------|----------|
| `AMADEUS_CLIENT_ID` | Your Amadeus API Client ID | No (falls back to mock data) |
| `AMADEUS_CLIENT_SECRET` | Your Amadeus API Client Secret | No (falls back to mock data) |

**Important:** 
- The `.env.local` file is git-ignored and will not be committed to version control
- Never commit your actual API credentials to the repository
- For production deployments, set these variables in your hosting platform's environment settings

### Features

- ✈️ Real-time flight search with debounced input
- 🔍 Advanced filtering (stops, price range, airlines)
- 📊 Interactive price visualization with Recharts
- 📱 Fully responsive design
- 🎨 Modern UI built with ShadCN components
- 🔄 Automatic fallback to mock data when API is unavailable

## Getting Started

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
