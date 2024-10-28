// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "shadcn-nuxt",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@pinia/nuxt",
    "nuxt-appwrite",
  ],
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },
  compatibilityDate: "2024-04-03",

  typescript: {
    typeCheck: true,
  },

  colorMode: {
    preference: "dark",
  },
  appwrite: {
    endpoint:process.env.NUXT_API_URL,
    project: process.env.NUXT_PROJECT_ID,
  },
  runtimeConfig: {
    apiUrl: "",
    apiKey: "",
    projectId: "",

    public: {
      databaseId: "",
      projectsCollectionId: "",
      tasksCollectionId: "",
      usersCollectionId: 'your-users-collection-id',
      financesCollectionId: "",

    },
  },
  devtools: { enabled: true },
});
