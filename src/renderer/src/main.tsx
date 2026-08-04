import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { detectLocale, LocaleProvider } from './i18n'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <LocaleProvider locale={detectLocale()}>
      <App />
    </LocaleProvider>
  </React.StrictMode>
)
