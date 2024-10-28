import { defineStore } from 'pinia'
import type { User } from '~/composables/useUserDatabase'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[]
  }),
  actions: {
    setUsers(users: User[]) {
      this.users = users
    }
  },
  getters: {
    getUsers: (state) => state.users
  }
})
