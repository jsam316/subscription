import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App.jsx'

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 CONFIGURATION — fill these in from your Auth0 dashboard
//    Dashboard → Applications → Your App → Settings
// ─────────────────────────────────────────────────────────────────────────────
const AUTH0_DOMAIN   = 'YOUR_AUTH0_DOMAIN'        // e.g. dev-abc123.us.auth0.com
const AUTH0_CLIENT_ID = 'YOUR_AUTH0_CLIENT_ID'    // e.g. xAbCdEfGhIjKlMnOpQrStUvW
// ─────────────────────────────────────────────────────────────────────────────

// For GitHub Pages the redirect must match exactly what you register in Auth0
const redirectUri = `${window.location.origin}/subscription-manager/`

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{ redirect_uri: redirectUri }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
)
