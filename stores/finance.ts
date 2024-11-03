import { defineStore } from 'pinia'
import type { Transaction } from '~/types/finance'


export const useFinanceStore = defineStore('finance', {
  state: () => ({
    transactions: [] as Transaction[],
    isLoading: false,
    error: null as string | null,
  }),
  actions: {
    setTransactions(transactions: Transaction[]) {
      this.transactions = transactions
    },
    addTransaction(transaction: Transaction) {
      this.transactions.push(transaction)
    },
    updateTransaction(updatedTransaction: Transaction) {
      const index = this.transactions.findIndex(t => t.$id === updatedTransaction.$id)
      if (index !== -1) {
        this.transactions[index] = updatedTransaction
      }
    },
    removeTransaction(id: string) {
      this.transactions = this.transactions.filter(t => t.$id !== id)
    },
    setLoading(isLoading: boolean) {
      this.isLoading = isLoading
    },
    setError(error: string | null) {
      this.error = error
    },
  },
})
