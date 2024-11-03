<script setup lang="ts">
import { useFinanceStore } from "@/stores/finance";
const financeStore = useFinanceStore();

const { fetchTransactions} = useFinanceDatabase();
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
const stats = [
  {
    title: "Total Revenue",
    value: totalIncome,
    change: "+20.1%",
    icon: "ri:money-rupee-circle-fill",
    link: "#",
  },
  {
    title: "Active Projects",
    value: "2",
    change: "+0.1%",
    icon: "ri:folder-3-fill",
    link: "#",
  },
  {
    title: "Due This Week",
    value: "10",
    change: "-10.1%",
    icon: "ri:sticky-note-fill",
    link: "#",
  },
  // {
  //   title: "Clients",
  //   value: "20",
  //   change: "-10.1%",
  //   icon: "ri:group-3-fill",
  //   link: "#",
  // },
  {
    title: "My Earnings",
    value: "20",
    change: "-10.1%",
    icon: "ri:money-rupee-circle-fill",
    link: "#",
  },
];
onMounted(async () => {
  await fetchTransactions()
})
</script>

<template>
  <div>
    <div class="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 grid-cols-2">
      <Card v-for="(stat, index) in stats" :key="index">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium"> {{ stat.title }} </CardTitle>
<Icon :name="stat.icon" class="w-6 text-green-500" :class="index < 1 ? 'text-red-500' :index > 2? 'text-blue-500':'text-green-500'" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stat.value }}</div>
          <p class="text-xs text-muted-foreground">
            {{ stat.change }} from last month
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
