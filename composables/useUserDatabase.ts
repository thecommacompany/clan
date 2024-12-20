import { useUserStore } from '~/stores/user'
import type { Models } from 'appwrite'

export interface User {
  $id: string
  Name: string
  phone: string
  email: string
  userID: string
}

// function parse user
function parseUser(user: Models.Document): User {
  return {
    $id: user.$id,
    Name: user.Name,
    phone: user.phone,
    email: user.email,
    userID: user.userID
  }
}

export function useUserDatabase() {
  const config = useRuntimeConfig()
  const { database, Query } = useAppwrite()
  const userStore = useUserStore()

  const fetchUsers = async () => {
    try {
      const response = await database.listDocuments(
        config.public.databaseId,
        config.public.usersCollectionId
      ) as Models.DocumentList<Models.Document>
      const users = response.documents.map(parseUser)
      userStore.setUsers(users)
      return users
    } catch (error) {
      console.error('Failed to fetch users:', error)
      throw error
    }
  }
const fetchUser = async (userId: string) => {
    try {
      const response = await database.listDocuments(
        config.public.databaseId,
        config.public.usersCollectionId,
        [Query.equal('userID', userId)]
      ) as Models.DocumentList<Models.Document>
      
      const user = response.documents[0] && parseUser(response.documents[0])
      
      return user
    } catch (error) {
      console.error('Failed to fetch user:', error)
      throw error
    }
  }

  return {
    fetchUsers,
    fetchUser
  }
}
