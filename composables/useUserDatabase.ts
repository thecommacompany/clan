import { useUserStore } from '~/stores/user'

export interface User {
  $id: string
  Name: string
  phone: string
  email: string
}

export function useUserDatabase() {
  const config = useRuntimeConfig()
  const { database } = useAppwrite()
  const userStore = useUserStore()

  const fetchUsers = async () => {
    try {
      const response = await database.listDocuments(
        config.public.databaseId,
        config.public.usersCollectionId
      )
      const users = response.documents as User[]
      userStore.setUsers(users)
      return users
    } catch (error) {
      console.error('Failed to fetch users:', error)
      throw error
    }
  }

  return {
    fetchUsers
  }
}
