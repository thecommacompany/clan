import type { Transaction } from '@/types/finance'  
import type {Models} from "appwrite"
import { useFinanceStore } from '@/stores/finance'
function parseTransaction(transaction: Models.Document): Transaction {
  return {
    $id: transaction.$id,
    title: transaction.title,
    amount: transaction.amount,
    description: transaction.description,
    type: transaction.type,
    user: transaction.user,
    debit_credit: transaction.debit_credit,
    project: transaction.project
  }
}
export const useFinanceDatabase = () => {
  const config = useRuntimeConfig()
  const { database } = useAppwrite()

  const fetchTransactions = async () => {
    try {
      const response = await database.listDocuments(
        config.public.databaseId,
        config.public.financesCollectionId
      ) as Models.DocumentList<Models.Document>
      const transactions = response.documents.map(parseTransaction)
      useFinanceStore().setTransactions(transactions)
      return transactions
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
      ) as Models.Document
      const transactionData = parseTransaction(response)
      return transactionData
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
      ) as Models.Document
      const transactionData = parseTransaction(response)
      return transactionData
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
