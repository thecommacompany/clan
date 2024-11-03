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
    "@vite-pwa/nuxt",
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
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Comma Clan",
      short_name: "Comma Clan",
      start_url: "/",
      description: "Comma Clan is a project management tool that allows you to manage tasks, projects, and finances.",
      display: "standalone",
      orientation: "portrait",
      theme_color: "#120e4b",
      icons: [
        {
          src: "img/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "img/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "img/maskable-icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: "module",
    },

  },
  devtools: { enabled: true },
});