<script setup lang="ts">
import { loginSchema } from '~/schemas/loginSchema';
import { useToast } from '@/components/ui/toast/use-toast';
import { z } from 'zod';
const { account } = useAppwrite();
const { toast } = useToast();

let formData = ref({
  email: "",
  password: "",
});

async function submit() {
 
  try {
    // Validate form data using the schema
    const validatedData = loginSchema.parse(formData.value);

    const session = await account.createEmailPasswordSession(
      validatedData.email,
      validatedData.password,
    );
    
    if (session) {
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      navigateTo("/");
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      // Handle validation errors
      err.errors.forEach((error) => {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.message,
          
        });
      });
    } else {
      // Handle Appwrite or other errors
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to login. Please check your credentials.",
      });
      console.log(err);
    }
   
  }
}

definePageMeta({
  layout: "login",
});
</script>

<template>
  <div class="h-screen flex items-center justify-center">
    <Toaster />
    <Card class="w-full max-w-sm">
      <CardHeader>
        <div class="p-3 font-logo flex gap-2 justify-center items-center">  
          <img src="/img/logo_dark.png" alt="comma_clan_logo" class="w-16" />
          <span class="hidden md:block">Clan</span>
        </div>
        <CardTitle class="text-2xl"> 
          Login
         </CardTitle>
        <CardDescription>
          Enter your email below to login to your account.
        </CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4">
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            v-model="formData.email" 
            required 
          />
        </div>
        <div class="grid gap-2">
          <Label for="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            v-model="formData.password" 
            placeholder="Enter your password" 
            required 
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button class="w-full" @click="submit">Sign in</Button>
      </CardFooter>
    </Card>
  </div>
</template>
