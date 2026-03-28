<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-sakura-50 via-white to-sakura-100 p-4">
    <!-- グラスモーフィズムなメインコンテナ -->
    <div class="max-w-4xl w-full bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col md:flex-row">
      
      <!-- 左側：さくら先輩の画像とメッセージ -->
      <div class="md:w-1/2 bg-gradient-to-br from-sakura-100/50 to-sakura-200/50 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <!-- 装飾的な光の円（背景） -->
        <div class="absolute top-10 left-10 w-32 h-32 bg-white/60 rounded-full blur-2xl"></div>
        <div class="absolute bottom-10 right-10 w-48 h-48 bg-sakura-300/30 rounded-full blur-3xl"></div>

        <h2 class="text-3xl font-bold text-sakura-800 mb-4 z-10 text-center drop-shadow-sm">
          Learning Angel
        </h2>
        
        <!-- モードに応じた先輩のセリフ -->
        <div class="bg-white/60 backdrop-blur-sm px-6 py-4 rounded-2xl mb-6 z-10 shadow-sm border border-white/80 relative">
          <!-- 吹き出しのしっぽ -->
          <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/60 rotate-45 border-r border-b border-white/80"></div>
          <p class="text-sakura-700 text-center font-medium whitespace-pre-line leading-relaxed">
            {{ isLoginMode ? '…ふぁ、いらっしゃい。\n今日も一緒にお勉強、\nがんばろっか。' : '…初めまして。\nこれから一緒に、\nゆっくり進めていこうね。' }}
          </p>
        </div>

        <img 
          src="../assets/images/sakura_sleepy.png" 
          alt="さくら先輩" 
          class="w-64 md:w-80 h-auto object-contain z-10 drop-shadow-2xl transform transition-transform duration-500 hover:scale-105"
        />
      </div>

      <!-- 右側：ログイン/登録フォーム -->
      <div class="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white/40">
        <!-- タブ切り替え -->
        <div class="flex p-1 bg-gray-100/50 rounded-xl mb-8 backdrop-blur-sm border border-gray-200/50 shadow-inner">
          <button 
            @click="isLoginMode = true"
            :class="['flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300', isLoginMode ? 'bg-white text-sakura-600 shadow-sm' : 'text-gray-400 hover:text-gray-600']"
          >
            ログイン
          </button>
          <button 
            @click="isLoginMode = false"
            :class="['flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300', !isLoginMode ? 'bg-white text-sakura-600 shadow-sm' : 'text-gray-400 hover:text-gray-600']"
          >
            新規登録
          </button>
        </div>

        <h3 class="text-2xl font-bold text-gray-800 mb-6">
          {{ isLoginMode ? 'おかえりなさい' : 'アカウント作成' }}
        </h3>

        <!-- エラーメッセージ表示 -->
        <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg text-sm flex items-start gap-3 animate-fade-in">
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <span class="leading-relaxed">{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1.5 ml-1">メールアドレス</label>
            <input 
              v-model="email" 
              type="email" 
              required
              class="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-sakura-400 focus:ring-4 focus:ring-sakura-100 transition-all bg-white/60 backdrop-blur-sm outline-none"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1.5 ml-1">パスワード</label>
            <input 
              v-model="password" 
              type="password" 
              required
              minlength="6"
              class="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-sakura-400 focus:ring-4 focus:ring-sakura-100 transition-all bg-white/60 backdrop-blur-sm outline-none"
              placeholder="6文字以上"
            />
          </div>

          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full mt-6 py-4 px-4 bg-gradient-to-r from-sakura-400 to-sakura-500 hover:from-sakura-500 hover:to-sakura-600 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(251,113,133,0.39)] transform transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            <span v-if="isLoading">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </span>
            <span>{{ isLoginMode ? 'ログインして始める' : '登録して始める' }}</span>
            <svg v-if="!isLoading" class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </form>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const { signIn, signUp } = useAuth()

const isLoginMode = ref(true)
const isLoading = ref(false)
const email = ref('')
const password = ref('')
const errorMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    if (isLoginMode.value) {
      await signIn(email.value, password.value)
    } else {
      await signUp(email.value, password.value)
    }
    // 成功時は親コンポーネント (App.vue) の認証状態が切り替わり、この画面ごと破棄される
  } catch (error) {
    console.error('Auth Error:', error)
    const code = error.code || ''
    
    // エラーコードに応じてユーザーに優しいメッセージに書き換える
    if (code.includes('invalid-credential') || code.includes('user-not-found') || code.includes('wrong-password')) {
      errorMessage.value = 'メールアドレスまたはパスワードが間違っています。'
    } else if (code.includes('email-already-in-use')) {
      errorMessage.value = 'このメールアドレスは既に登録されています。\nログインタブからログインしてください。'
    } else if (code.includes('weak-password')) {
      errorMessage.value = 'パスワードは6文字以上で入力してください。'
    } else if (code.includes('invalid-email')) {
      errorMessage.value = '正しい形式のメールアドレスを入力してください。'
    } else {
      errorMessage.value = 'エラーが発生しました。もう一度お試しください。'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
