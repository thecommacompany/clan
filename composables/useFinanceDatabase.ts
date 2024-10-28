

export interface Transaction {
  $id: string
  title: string
  amount: number
  description: string
  type: 'internal' | 'external'
  users: string[]
  debit_credit: 'debit' | 'credit'
  project: string
}

export function useFinanceDatabase() {
  const config = useRuntimeConfig()
  const { database } = useAppwrite()

  const fetchTransactions = async () => {
    try {
      const response = await database.listDocuments(
        config.public.databaseId,
        config.public.financesCollectionId
      )
      return response.documents as Transaction[]
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      throw error
    }
  }

  const addTransaction = async (transaction: Partial<Transaction>) => {
    try {
      const response = await database.createDocument(
        config.public.databaseId,
        config.public.financesCollectionId,
        'unique()',
        transaction
      )
      return response as Transaction
    } catch (error) {
      console.error('Failed to add transaction:', error)
      throw error
    }
  }

  const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    try {
      const response = await database.updateDocument(
        config.public.databaseId,
        config.public.financesCollectionId,
        id,
        transaction
      )
      return response as Transaction
    } catch (error) {
      console.error('Failed to update transaction:', error)
      throw error
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      await database.deleteDocument(
        config.public.databaseId,
        config.public.financesCollectionId,
        id
      )
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      throw error
    }
  }

  return {
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  }
}
