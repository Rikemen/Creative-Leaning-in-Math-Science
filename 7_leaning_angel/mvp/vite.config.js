import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Viteビルド設定 — Vue 3プラグインのみの最小構成
export default defineConfig({
  plugins: [vue()],
})
