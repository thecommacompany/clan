<script setup lang="ts">
import { useFinanceStore } from "@/stores/finance";
import { useProjectStore } from "@/stores/project";
import { useTaskStore } from "@/stores/tasks";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from 'pinia';
import { useFinanceDatabase } from '@/composables/useFinanceDatabase';
import { useProjects } from '@/composables/useProjects';
import { useTasks } from '@/composables/useTasks';

const financeStore = useFinanceStore();
const projectStore = useProjectStore();
const taskStore = useTaskStore();
const authStore = useAuthStore();

const { projects } = storeToRefs(projectStore);

const { fetchTransactions } = useFinanceDatabase();
const { isPending, isError, error } = useProjects();
const { tasks } = useTasks();

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

const myEarnings = computed(() => {
  return financeStore.transactions
    .filter(t => t.debit_credit === 'debit' && t.user === authStore.sessionID)
    .reduce((sum, t) => sum + t.amount, 0)
})

const myEarningsChange = computed(() => {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  
  const thisMonthEarnings = financeStore.transactions
    .filter(t => {
      const transDate = new Date(t.$createdAt);
      return t.debit_credit === 'credit' && 
             t.user === authStore.sessionID && 
             transDate >= lastMonth && 
             transDate <= today;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const prevMonthEarnings = financeStore.transactions
    .filter(t => {
      const transDate = new Date(t.$createdAt);
      const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());
      return t.debit_credit === 'credit' && 
             t.user === authStore.sessionID && 
             transDate >= twoMonthsAgo && 
             transDate <= lastMonth;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  if (prevMonthEarnings === 0) return '+100%';
  const percentageChange = ((thisMonthEarnings - prevMonthEarnings) / prevMonthEarnings) * 100;
  return `${percentageChange >= 0 ? '+' : ''}${percentageChange.toFixed(1)}%`;
})

const currentBalance = computed(() => {
  return totalIncome.value - totalExpense.value
})

const activeProjects = computed(() => {
  return projects.value?.filter(project => {
    const totalTasks = project.stats?.totalTasks ?? 0;
    const completedTasks = project.stats?.completedTasks ?? 0;
    return totalTasks > completedTasks;
  }).length || 0;
});

const importantTasks = computed(() => {
  const today = new Date();
  const fiveDaysFromNow = new Date(today);
  fiveDaysFromNow.setDate(today.getDate() + 5);

  const overdueTasks = tasks.value?.filter(task => {
    if (!task.due_date || task.completed) return false;
    const dueDate = new Date(task.due_date);
    return dueDate < today;
  }).length || 0;

  const upcomingTasks = tasks.value?.filter(task => {
    if (!task.due_date || task.completed) return false;
    const dueDate = new Date(task.due_date);
    return dueDate >= today && dueDate <= fiveDaysFromNow;
  }).length || 0;

  return {
    total: overdueTasks + upcomingTasks,
    overdue: overdueTasks,
    upcoming: upcomingTasks
  };
});

const stats = [
  {
    title: "Total Revenue",
    value: totalIncome,
    change: "+20.1%",
    icon: "ri:money-rupee-circle-fill",
    link: "finances",
  },
  {
    title: "Active Projects",
    value: activeProjects,
    change: "+0.1%",
    icon: "ri:folder-3-fill",
    link: "projects",
  },
  {
    title: "Important Tasks",
    value: importantTasks.value.total,
    change: `${importantTasks.value.upcoming} upcoming, ${importantTasks.value.overdue} overdue`,
    icon: "ri:sticky-note-fill",
    link: "tasks",
  },
  {
    title: "My Earnings",
    value: myEarnings,
    change: myEarningsChange,
    icon: "ri:money-rupee-circle-fill",
    link: "finances",
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
        <CardFooter>
          <NuxtLink :to="stat.link" class="text-blue-500 hover:text-blue-600 flex items-center justify-center">
            View <Icon name="ri:arrow-right-s-line" class="text-xl" />
          </NuxtLink>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>
