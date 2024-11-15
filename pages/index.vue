<script setup lang="ts">
const data = useFetch('/api')

</script>

<template>
  <div class="flex min-h-screen w-full flex-col">
    <main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <HomeStats />
      <div class="">
        <HomeWidgets />
      </div>
    </main>
  </div>
</template>
