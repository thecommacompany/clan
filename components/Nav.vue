<script setup lang="ts">
const { account } = useAppwrite();

async function logout() {
  try {
    await account.deleteSessions();

    navigateTo("/login");
  } catch (err) {
    console.log(err);
  }
}
</script>

<template>
  <div class="sticky top-0 z-10">
    <header class="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 ">
      <nav
        class="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <NuxtLink to="/" class="flex items-center gap-2 text-lg font-semibold md:text-base">
          <span class="text-primary">Comma</span>
          <span class="sr-only">Comma Clan</span>
        </NuxtLink>
        <NuxtLink to="/" class="text-foreground transition-colors hover:text-foreground">
          Dashboard
        </NuxtLink>
        <NuxtLink to="/projects" class="text-muted-foreground transition-colors hover:text-foreground">
          Projects
        </NuxtLink>
        <NuxtLink to="/tasks" class="text-muted-foreground transition-colors hover:text-foreground">
          Tasks
        </NuxtLink>
        <NuxtLink to="/finances" class="text-muted-foreground transition-colors hover:text-foreground">
          Finances
        </NuxtLink>

       
      </nav>
      <Sheet>
        <SheetTrigger as-child>
          <Button variant="outline" size="icon" class="shrink-0 md:hidden">
            <Icon name="ri:menu-4-fill" />
            <span class="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav class="grid gap-6 text-lg font-medium">
            <NuxtLink to="/" class="flex items-center gap-2 text-lg font-semibold">
              <span class="text-primary">Comma</span>
            </NuxtLink>
            <NuxtLink to="/" class="hover:text-foreground"> Dashboard </NuxtLink>
            <NuxtLink to="/projects" class="text-muted-foreground hover:text-foreground">
              Projects
            </NuxtLink>
            <NuxtLink to="/tasks" class="text-muted-foreground hover:text-foreground">
              Tasks
            </NuxtLink>
            <NuxtLink to="/finances" class="text-muted-foreground hover:text-foreground">
              Finances
            </NuxtLink>
            <NuxtLink to="#" class="text-muted-foreground hover:text-foreground">
              Analytics
            </NuxtLink>
          </nav>
        </SheetContent>
      </Sheet>
      <div class="flex w-full items-center gap-4 justify-end">
        <!--
        <form class="ml-auto flex-1 sm:flex-initial">
          <div class="relative">
            <Icon name="ri:search-line" class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search products..." class="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]" />
          </div>
        </form>
-->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="secondary" size="icon" class="rounded-full">
              <Icon name="ri:account-circle-fill" />
              <span class="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="logout">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  </div>
</template>
