import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],server:{port:5184,strictPort:true,proxy:{'/api':`http://127.0.0.1:${process.env.MESURE_API_PORT||3184}`}},build:{outDir:'dist',rollupOptions:{output:{manualChunks:{react:['react','react-dom','react-router-dom'],motion:['gsap','lenis'],icons:['@fortawesome/fontawesome-svg-core','@fortawesome/free-solid-svg-icons','@fortawesome/react-fontawesome']}}}}});
