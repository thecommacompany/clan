<script setup lang="ts">
import { useFinanceStore } from '@/stores/finance'
import { useFinanceDatabase } from '@/composables/useFinanceDatabase'
import { useProjectStore } from '@/stores/project'
import { useProjects } from '@/composables/useProjects'
import { useUserStore } from '@/stores/user'
import { useUserDatabase } from '@/composables/useUserDatabase'
import type { Transaction } from '@/types/finance'
const financeStore = useFinanceStore()
const projectStore = useProjectStore()
const userStore = useUserStore()
const { fetchTransactions, addTransaction, updateTransaction, deleteTransaction } = useFinanceDatabase()
const { fetchUsers } = useUserDatabase()

const isDialogOpen = ref(false)
const selectedTransaction = ref<Transaction | null>(null)

const newTransaction = ref<Partial<Transaction>>({
  title: '',
  amount: 0,
  description: '',
  type: 'internal',
  user: "",
  debit_credit: 'debit',
  project: ""
})

onMounted(async () => {
  await handleFetchTransactions()
  await fetchUsers()
})

// Computed properties for analytics
const totalExpense = computed(() => {
  return financeStore.transactions
    .filter(t => t.debit_credit === 'debit')
    .reduce((sum, t) => sum + t.amount, 0)
})

const totalIncome = computed(() => {
  return financeStore.transactions
    .filter(t => t.debit_credit === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)
})

const currentBalance = computed(() => {
  return totalIncome.value - totalExpense.value
})

const handleFetchTransactions = async () => {
  financeStore.setLoading(true)
  financeStore.setError(null)
  try {
    const transactions = await fetchTransactions()
    financeStore.setTransactions(transactions as Transaction[])
  } catch (error) {
    financeStore.setError('Failed to fetch transactions')
    console.error(error)
  } finally {
    financeStore.setLoading(false)
  }
}

const { isPending: isProjectsLoading, isError: isProjectsError, error: projectsError } = useProjects()



const handleAddTransaction = async () => {
  financeStore.setLoading(true)
  financeStore.setError(null)
  try {
    const addedTransaction = await addTransaction(newTransaction.value)
    financeStore.addTransaction(addedTransaction)
    isDialogOpen.value = false
    resetNewTransaction()
  } catch (error) {
    financeStore.setError('Failed to add transaction')
    console.error(error)
  } finally {
    financeStore.setLoading(false)
  }
}

const handleUpdateTransaction = async () => {
  if (!selectedTransaction.value) return
  financeStore.setLoading(true)
  financeStore.setError(null)
  try {
    const updatedTransaction = await updateTransaction(selectedTransaction.value.$id, newTransaction.value)
    financeStore.updateTransaction(updatedTransaction)
    isDialogOpen.value = false
    selectedTransaction.value = null
    resetNewTransaction()
  } catch (error) {
    financeStore.setError('Failed to update transaction')
    console.error(error)
  } finally {
    financeStore.setLoading(false)
  }
}

const handleDeleteTransaction = async (id: string) => {
  financeStore.setLoading(true)
  financeStore.setError(null)
  try {
    await deleteTransaction(id)
    financeStore.removeTransaction(id)
  } catch (error) {
    financeStore.setError('Failed to delete transaction')
    console.error(error)
  } finally {
    financeStore.setLoading(false)
  }
}

const openEditDialog = (transaction: Transaction) => {
  selectedTransaction.value = transaction
  newTransaction.value = { ...transaction }
  isDialogOpen.value = true
}

const resetNewTransaction = () => {
  newTransaction.value = {
    title: '',
    amount: 0,
    description: '',
    type: 'internal',
    user: "",
    debit_credit: 'debit',
    project: ""
  }
}
</script>

<template>
  <div class="container mx-auto p-4">
    <Breadcrumb class="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <NuxtLink href="/">Home</NuxtLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Finances</BreadcrumbPage> 
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
    <h1 class="text-2xl font-bold mb-4">Finances</h1>
    
    <!-- Analytics Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold text-red-500">{{ totalExpense.toFixed(2) }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Income</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold text-green-500">{{ totalIncome.toFixed(2) }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold" :class="currentBalance >= 0 ? 'text-green-500' : 'text-red-500'">
            {{ currentBalance.toFixed(2) }}
          </p>
        </CardContent>
      </Card>
    </div>
    
    <Button @click="isDialogOpen = true" class="mb-4">Add Transaction</Button>

    <Table v-if="!financeStore.isLoading && !financeStore.error">
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Debit/Credit</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="transaction in financeStore.transactions" :key="transaction.$id">
          <TableCell>{{ transaction.title }}</TableCell>
          <TableCell :class="transaction.debit_credit === 'debit' ? 'text-red-500' : 'text-green-500'">
            {{ transaction.amount.toFixed(2) }}
          </TableCell>
          <TableCell>{{ transaction.type }}</TableCell>
          <TableCell>{{ transaction.debit_credit }}</TableCell>
          <TableCell>
            <Button @click="openEditDialog(transaction)" variant="outline" class="mr-2">Edit</Button>
            <Button @click="handleDeleteTransaction(transaction.$id)" variant="destructive">Delete</Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <div v-else-if="financeStore.isLoading">Loading...</div>
    <div v-else-if="financeStore.error">Error: {{ financeStore.error }}</div>

    <Dialog v-model:open="isDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ selectedTransaction ? 'Edit Transaction' : 'Add Transaction' }}</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="selectedTransaction ? handleUpdateTransaction() : handleAddTransaction()">
          <div class="space-y-4">
            <div>
              <Label for="title">Title</Label>
              <Input id="title" v-model="newTransaction.title" required />
            </div>
            <div>
              <Label for="amount">Amount</Label>
              <Input id="amount" v-model="newTransaction.amount" type="number" step="1" required />
            </div>
            <div>
              <Label for="description">Description</Label>
              <Textarea id="description" v-model="newTransaction.description" />
            </div>
            <div>
              <Label for="type">Type</Label>
              <Select v-model="newTransaction.type">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label for="debit_credit">Debit/Credit</Label>
              <Select v-model="newTransaction.debit_credit">
                <SelectTrigger>
                  <SelectValue placeholder="Select debit/credit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label for="project">Project</Label>
              <Select v-model="newTransaction.project">
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem
                    v-for="project in projectStore.getProjects"
                    :key="project.$id"
                    :value="project.$id"
                  >
                    {{ project.title }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div v-if="newTransaction.type === 'internal'">
              <Label for="user">User</Label>
              <Select v-model="newTransaction.user">
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="user in userStore.getUsers"
                    :key="user.$id"
                    :value="user.userID"
                  >
                    {{ user.Name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">{{ selectedTransaction ? 'Update' : 'Add' }} Transaction</Button>
          </div>
        
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
