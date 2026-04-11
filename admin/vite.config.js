import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const renderApi = 'https://exe201-budgetbites.onrender.com';

const apiProxy = {
    '/api': {
        target: renderApi,
        changeOrigin: true,
        secure: true,
        // Upstream (e.g. Render/WAF) may return 403 if Origin is localhost while Host is production.
        configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
                proxyReq.removeHeader('origin');
                proxyReq.removeHeader('referer');
            });
        }
    }
};

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 5174,
        watch: {
            usePolling: true
        },
        // Same-origin /api in dev → no CORS against Render.
        proxy: apiProxy
    },
    preview: {
        port: 5174,
        proxy: apiProxy
    }
});
