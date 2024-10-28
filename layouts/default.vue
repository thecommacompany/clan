<script setup lang="ts">
const nuxtApp = useNuxtApp();
const loading = ref(true);

nuxtApp.hook("page:start", () => {
  loading.value = true;
});
nuxtApp.hook("page:finish", () => {
  loading.value = false;
});
</script>

<template>
  <div>
    <div class="w-screen h-screen fixed z-50 bg-[#005b5b] flex justify-center items-center" v-if="loading">
      <div class="flex flex-col jsutify-center items-center gap-4">
        <img src="/img/logo.png" alt="comma_clan_logo" class="w-24" />
        <h1 class="text-3xl font-bold font-logo text-white">Clan</h1>
      </div>
    </div>
    <Nav />
    <slot />
  </div>
</template>
