import { ref } from 'vue'
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { firebaseApp } from '../config/firebaseInit.js'

// グローバルな状態として保持し、複数コンポーネントから参照されても同一状態を保つ
// （Vue Router の Navigation Guard 等を導入していないため、シンプルなシングルトン状態管理）
const currentUser = ref(null)
const isAuthReady = ref(false)

export function useAuth() {
  const auth = getAuth(firebaseApp)

  // 初回だけ onAuthStateChanged をセットする
  if (!isAuthReady.value) {
    onAuthStateChanged(auth, (user) => {
      currentUser.value = user
      isAuthReady.value = true
    })
  }

  /**
   * メールとパスワードでログインする
   */
  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('[useAuth] ログインエラー:', error)
      throw error
    }
  }

  /**
   * メールとパスワードで新規登録する
   */
  const signUp = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('[useAuth] 新規登録エラー:', error)
      throw error
    }
  }

  /**
   * ログアウトする
   */
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('[useAuth] ログアウトエラー:', error)
      throw error
    }
  }

  return {
    currentUser,
    isAuthReady,
    signIn,
    signUp,
    signOut,
  }
}
