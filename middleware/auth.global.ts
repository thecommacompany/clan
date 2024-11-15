import {useAuthStore} from "@/stores/auth";
export default defineNuxtRouteMiddleware(async (to, from) => {

  const { account } = useAppwrite();
  if (process.client) {
    if (to.path != "/login") {
      try {
        const res = await account.get();
      
        if(res.$id) {
          const authStore = useAuthStore();

          authStore.sessionID = res.$id
          
        }
        return;
      } catch (err) {
        console.log(err);

        return navigateTo("/login");
      }
    }
  }
});
