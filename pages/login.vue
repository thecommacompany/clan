<script setup lang="ts">
const { account } = useAppwrite();
let formData = ref({
  email: "",
  password: "",
});
async function submit() {
  try {
    const session = await account.createEmailPasswordSession(
      formData.value.email,
      formData.value.password,
    );
    if (session) {
      navigateTo("/");
    }
  } catch (err) {
    console.log(err)
  }
}
definePageMeta({
  layout: "login",
});
</script>

<template>
  <div class="h-screen flex items-center justify-center">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl"> Login </CardTitle>
        <CardDescription>
          Enter your email below to login to your account.
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4">
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" v-model="formData.email" required />
        </div>
        <div class="grid gap-2">
          <Label for="password">Password</Label>
          <Input id="password" type="password" v-model="formData.password" placeholder="Enter your password" required />
        </div>
      </CardContent>
      <CardFooter>
        <Button class="w-full" @click="submit"> Sign in </Button>
      </CardFooter>
    </Card>
  </div>
</template>
