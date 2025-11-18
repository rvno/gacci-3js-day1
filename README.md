# Three.js Basic Template

A simple Three.js project setup with Vite.

## Installation

1. Install dependencies:

```bash
npm install three
npm install -D vite
```

## Development

Start the development server:

```bash
npx vite
```

Open your browser to the URL shown in the terminal (typically `http://localhost:5173`).

## Build

Create a production build:

```bash
npx vite build
```

## Deploy to Render.com

1. **Push your code to GitHub** (use VS Code's source control)

2. **Create a Render Static Site**

   - Go to [Render.com](https://render.com) and sign in
   - Click "New +" and select "Static Site"
   - Connect your GitHub repository

3. **Configure Build Settings**

   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - Click "Create Static Site"

4. **Deploy**
   - Render will automatically build and deploy your site
   - Your site will be live at the URL provided by Render
   - Future commits to your GitHub repo will trigger automatic deployments

## Project Structure

- `index.html` - Main HTML file
- `main.js` - Three.js scene setup with animated cube

For more information, visit the [Three.js Installation Guide](https://threejs.org/manual/#en/installation).
