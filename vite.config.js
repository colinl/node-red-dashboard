import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

/**
 * Vite is used to build the UI for the dashboard,
 * is is not used for the nodes themselves.
 */

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    root: 'ui',
    build: {
        outDir: '../dist',
        emptyOutDir: true
    },
    base: '/dashboard/'
})
