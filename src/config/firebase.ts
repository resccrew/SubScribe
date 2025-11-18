import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAeM27E3vi6Y5C9BqZ7ATco7g7LvS_wNzA",
  authDomain: "subscribe-14d9b.firebaseapp.com",
  projectId: "subscribe-14d9b",
  storageBucket: "subscribe-14d9b.firebasestorage.app",
  messagingSenderId: "143722365968",
  appId: "1:143722365968:web:46128888d9ce88b257f695",
  measurementId: "G-2MX6H4N6EL"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
export const appleProvider = new OAuthProvider('apple.com')

export default app