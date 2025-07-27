import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': '"https://gdovwhmcwjetbadiulpl.supabase.co"',
    'import.meta.env.VITE_SUPABASE_ANON_KEY': '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkb3Z3aG1jd2pldGJhZGl1bHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTg2NjgsImV4cCI6MjA2NjE3NDY2OH0.3xbz1PvCNfTGTiVgpbDEH2Q2iV4FeAuVML1Mn1Hhdk0"'
  }
}) 