import { defineConfig } from 'vite';

export default defineConfig({
    root: 'src',
    // Production is served by the Worker at the custom-domain root.  Keep all
    // asset URLs relative to that origin so no browser request leaves alimni.tv.
    base: '/',
    build: {
        outDir: '../dist',
        // The output lives outside Vite's root. Empty it explicitly so a
        // refresh can never load an obsolete hashed bundle from a prior build.
        emptyOutDir: true,
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
            },
        },
    },
});
