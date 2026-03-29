<template>
  <header class="sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-sm">
    <div class="container mx-auto flex items-center justify-between px-4 py-3">
      <h1 class="text-xl font-bold text-sakura-600">
        🌸 さくら先輩の数学辞書
      </h1>
      <div class="flex items-center gap-3">
        <!-- ログアウトボタン -->
        <button
          @click="handleSignOut"
          title="ログアウト"
          class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
        >
          <svg class="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuth } from '../composables/useAuth.js'

// ログアウト機能
const { signOut } = useAuth()
const handleSignOut = async () => {
  try {
    await signOut()
  } catch (error) {
    console.error('ログアウトエラー', error)
  }
}
</script>
