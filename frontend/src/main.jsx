import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Auth0Provider } from '@auth0/auth0-react';
import {BrowserRouter} from "react-router-dom"

createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain="dev-udqndn3ec1rcacr4.us.auth0.com"
    clientId="XHsauniI6RxihzmdsaCRCpIxS9rxrLHF"
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
  <BrowserRouter>
    <App />
  </BrowserRouter>
  </Auth0Provider>
)
