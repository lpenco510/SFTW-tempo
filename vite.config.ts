import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  console.log('===== VITE CONFIG =====');
  console.log('Mode:', mode);
  console.log('VITE_SUPABASE_URL defined:', !!env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_ANON_KEY defined:', !!env.VITE_SUPABASE_ANON_KEY);
  console.log('=======================');
  
  return {
    base: process.env.NODE_ENV === "development" ? "/" : process.env.VITE_BASE_PATH || "/",
    optimizeDeps: {
      entries: ["src/main.tsx"],
    },
    plugins: [
      react(),
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {},
    envDir: '.',
    envPrefix: 'VITE_',
  };
});
