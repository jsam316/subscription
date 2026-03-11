# Subscription Manager

A personal subscription tracking app with Auth0 login, deployed on GitHub Pages.

---

## 🚀 Deploy in 5 Steps

### Step 1 — Create a GitHub repository

1. Go to https://github.com/new
2. Name it exactly `subscription-manager`
3. Make it **Public** (required for free GitHub Pages)
4. Click **Create repository**

---

### Step 2 — Configure Auth0

1. Log into https://auth0.com → go to **Applications → Applications**
2. Click **+ Create Application** → choose **Single Page Application** → Create
3. In the application **Settings** tab, copy your:
   - **Domain** (e.g. `dev-abc123.us.auth0.com`)
   - **Client ID**

4. Still in Settings, add these URLs (replace `YOUR_GITHUB_USERNAME`):

   **Allowed Callback URLs:**
   ```
   https://YOUR_GITHUB_USERNAME.github.io/subscription-manager/
   ```

   **Allowed Logout URLs:**
   ```
   https://YOUR_GITHUB_USERNAME.github.io/subscription-manager/
   ```

   **Allowed Web Origins:**
   ```
   https://YOUR_GITHUB_USERNAME.github.io
   ```

5. Click **Save Changes**

---

### Step 3 — Add your Auth0 credentials to the app

Open `src/main.jsx` and replace the placeholders:

```js
const AUTH0_DOMAIN    = 'dev-abc123.us.auth0.com'   // ← your domain
const AUTH0_CLIENT_ID = 'xAbCdEfGhIjKlMnOpQrStUvW'  // ← your client ID
```

Also open `vite.config.js` and confirm the base matches your repo name:

```js
base: '/subscription-manager/',
```

---

### Step 4 — Push to GitHub

```bash
# In this project folder:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/subscription-manager.git
git push -u origin main
```

---

### Step 5 — Deploy to GitHub Pages

```bash
npm install
npm run deploy
```

This builds the app and pushes it to the `gh-pages` branch automatically.

Then in GitHub:
- Go to your repo → **Settings → Pages**
- Source: **Deploy from a branch** → branch: `gh-pages` → folder: `/ (root)`
- Click **Save**

Your app will be live at:
```
https://YOUR_GITHUB_USERNAME.github.io/subscription-manager/
```

---

## 🔁 Updating the app

After making changes:

```bash
npm run deploy
```

That's it — rebuilds and pushes in one command.

---

## 🛠 Local development

```bash
npm install
npm run dev
```

Runs at http://localhost:5173/subscription-manager/

> **Note:** Auth0 login won't work locally unless you also add `http://localhost:5173/subscription-manager/` to your Auth0 Allowed Callback, Logout, and Web Origins URLs.

---

## Project structure

```
subscription-manager/
├── src/
│   ├── main.jsx        ← Auth0Provider setup (put your credentials here)
│   └── App.jsx         ← Full app: login screen + dashboard
├── index.html
├── vite.config.js      ← GitHub Pages base path
├── package.json
└── README.md
```
