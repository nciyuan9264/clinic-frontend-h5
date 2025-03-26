import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path";

export default defineConfig({
    plugins: [react()],
    base: '/h5/', // 让静态资源路径加上 /h5/
    server: {
        port: 80,
        host: '0.0.0.0',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '~': '/src',
        }
    }
})
