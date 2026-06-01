# GlowAI Web App

This project is a skin analysis PWA built with React in a single HTML file.

## What was added
- `manifest.json` for PWA installability
- `sw.js` service worker for offline caching
- `api/skin-analyze.js` serverless endpoint using OpenAI Responses API

## Setup for real skin analysis
1. Create a repository and push this project.
2. Deploy on Vercel.
3. In Vercel project settings, add environment variable:
   - `OPENAI_API_KEY` = your OpenAI API key

## How it works
- The client uploads a base64 image to `/api/skin-analyze`.
- The serverless function calls OpenAI Vision and returns structured JSON.
- If the API call fails, the app falls back to a mock analysis.

## Notes
- Replace the placeholder `OPENAI_API_KEY` with a valid key in Vercel.
- For best reliability, keep API keys in environment variables and do not commit them.
