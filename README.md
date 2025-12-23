<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This- 🤖 **Gemini 3 Pro**: Advanced reasoning for understanding drawings.
- 🍌 **Nano Banana Pro**: High-fidelity image generation.
- 🛡️ **Secure**: Keys managed via local environment variables.

## Setup & Security 🛡️

1.  **Duplicate the template**:
    ```bash
    cp .env.example .env.local
    ```
2.  **Add your Key**: Open `.env.local` and paste your Google AI Studio API Key.
    ```env
    GEMINI_API_KEY=AIzaSy...
    ```
3.  **Run**: `npm run dev`

> **Note**: `.env.local` is ignored by Git to keep your key safe. Do not commit it!

## Developmenttps://ai.studio/apps/drive/15OpOzFAEZdn1BojJ20s6jz3MFMkKMnCo

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:

## Maintenance & Customization 🛠️

Want to change how the app looks or how the AI behaves?

### 1. Adding New Styles
Go to `src/constants.ts` and look for the `STYLES` array.
To add a new style, just copy one of the blocks and change the details:
```typescript
{
  id: 'cyberpunk',
  name: 'Cyberpunk', 
  icon: '🤖', // Pick any Lucide icon in App.tsx!
  color: 'bg-[#00F0FF]', // Tailwind color class
  description: 'Neon lights, futuristic city, rain...' // The prompt for the AI
}
```

### 2. Changing the Magic Spell (Prompts)
- **Style Definitions:** Edit the `description` fields in `src/constants.ts`. This is the main "instruction" for each style.
- **AI Logic:** The main prompt construction happens in `src/services/geminiService.ts` inside `generateStyledImage()`. You can tweak the "CRITICAL" instructions there if the AI starts disobeying!

### 3. Updating the UI
- **Everything is in** `src/App.tsx`.
- **Icons:** We use [Lucide React](https://lucide.dev/icons). Import new ones at the top of the file.
- **Fonts:** Changed in `src/index.html` (currently using "Fredoka").

### 4. Deployment
Ready to go live?
1. run `npm run build`
2. Upload the `dist` folder to Netlify, Vercel, or Firebase Hosting.
