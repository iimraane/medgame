import { defineConfig } from 'vite';

export default defineConfig({
    root: 'src',
    base: '/game/',
    build: {
        outDir: '../dist',
        // The output lives outside Vite's root. Empty it explicitly so a
        // refresh can never load an obsolete hashed bundle from a prior build.
        emptyOutDir: true,
    },
    server: {
        port: 5173,
        proxy: {
            '/game/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
        },
    },
});
