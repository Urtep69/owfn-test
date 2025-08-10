# Official World Family Network (OWFN) Website

This project is a React-based single-page application for the Official World Family Network. It is set up to be deployed directly from source files without a build step, using modern browser features like import maps.

## How to Deploy to Vercel

Follow these steps to deploy the website live on Vercel using GitHub.

### Step 1: Push to GitHub

1.  **Create a new repository on GitHub.** You can name it whatever you like, for example, `owfn-website`.
2.  **Upload all project files** to this new repository. The files include `index.html`, `index.tsx`, `App.tsx`, all the files in `pages/`, `components/`, `hooks/`, `contexts/`, `lib/`, `services/`, and the newly added `vercel.json` and `README.md`.

### Step 2: Deploy on Vercel

1.  **Sign up or log in to [Vercel](https://vercel.com).**
2.  From your Vercel dashboard, click **"Add New... -> Project"**.
3.  **Import the GitHub repository** you just created. Vercel will ask for permission to access your repositories if you haven't granted it already.
4.  Vercel will detect that this is a static site and should not require any special framework presets. The `vercel.json` file will handle the routing configuration automatically.
5.  **Configure Environment Variables (CRUCIAL STEP):**
    *   Before deploying, navigate to the project's **Settings** tab.
    *   Click on **Environment Variables**.
    *   Add a new variable with the name `API_KEY`.
    *   In the value field, paste your actual Gemini API key.
    *   This step is **essential** for the AI Chatbot to function correctly. The application code reads this key from `process.env.API_KEY`.
6.  **Deploy:**
    *   Go back to the deployment screen.
    *   Click the **"Deploy"** button.

Vercel will now build and deploy your site. Once it's finished, you'll be given a live URL where you can view your website. That's it!
