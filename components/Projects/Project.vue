<script setup lang="ts">
  defineProps({
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
  <CardTitle>{{ project.title }}</CardTitle>
  <CardDescription>{{ project.description }}</CardDescription>

</CardHeader>
<CardContent class="flex flex-col gap-3 justify-center items-start">
<Badge>{{project.status}}</Badge>
<div class="font-bold">{{project.stats.totalTasks}} tasks</div>
<div class="flex items-center gap-3 py-2 justify-end font-bold"> {{project.stats.completedTasks}}/{{project.stats.totalTasks}}</div>
<Progress v-model="project.stats.progress" />
</CardContent>
<CardFooter>
<Avatar>
<AvatarFallback>CN</AvatarFallback>
  </Avatar>

</CardFooter>
</Card>
</NuxtLink>
  </div>
</template>
