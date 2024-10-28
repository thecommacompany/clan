import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  let sessionID = ref("")

  return {
    sessionID
  }
})
