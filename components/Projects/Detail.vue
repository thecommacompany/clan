
<script setup lang="ts">
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true,
    default: ""
  }
})
</script>

<template>
  <div>
    <div class="py-2">{{ label }}: {{ value }}</div>
    <Separator />
  </div>
</template>
