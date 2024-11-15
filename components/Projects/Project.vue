<script setup lang="ts">
  const props = defineProps({
    project: {
      type: Object,
      required: true
    }
  })
</script>

<template>
  <div>
<NuxtLink :to="`/projects/${project.$id}`">
   <Card>
<CardHeader>
  <CardTitle class="flex justify-between items-center"><div>{{ project.title }}</div> <div class="text-sm">{{ new Date(project.due_date).toLocaleDateString() }}</div> </CardTitle>
  <CardDescription>{{ project.description.substring(0, 100) }}</CardDescription>

</CardHeader>
<CardContent class="flex flex-col gap-3 justify-center items-start">
<Badge>{{project.status}}</Badge>
<div class="font-bold">{{project.stats.totalTasks}} tasks</div>
<div class="flex items-center gap-3 py-2 justify-end font-bold"> {{project.stats.completedTasks}}/{{project.stats.totalTasks}}</div>
<Progress v-model="project.stats.progress" />
</CardContent>

</Card>
</NuxtLink>
  </div>
</template>
