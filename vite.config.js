import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/', // or '/repo-name/' if it isn't a custom domain
  plugins: [react()],
})