import { defineConfig } from 'vite';

export default defineConfig({
    root: 'src',
    base: '/game/',
    build: {
        outDir: '../dist',
    },
    server: {
        port: 5173,
        proxy: {
            '/game/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/game\/api/, '/api'),
            },
        },
    },
});
