export interface Transaction {
    $id: string
    title: string
    amount: number
    description: string
    type: 'internal' | 'external'
    user: string
    debit_credit: 'debit' | 'credit'
    project: string
  }