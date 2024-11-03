<script setup lang="ts">
  // Import necessary Vue composables and components
  import { ref, computed, onMounted } from 'vue'
  import { useUserStore } from '@/stores/user'
  import { useUserDatabase } from '@/composables/useUserDatabase'

  // Import UI components
  import { Button } from '@/components/ui/button'
  import { ScrollArea } from '@/components/ui/scroll-area'
  import { Checkbox } from '@/components/ui/checkbox'
  import { ChevronsUpDown } from 'lucide-vue-next'
  
  // Initialize stores and composables
  const userStore = useUserStore()
  const { fetchUsers } = useUserDatabase()
  // Control popover state
  const open = ref(false)
  // Store array of selected users
  let selectedUsers = ref<User[]>([])
  
  // Computed property to get filtered users from store
  const filteredUsers = computed(() => userStore.getFilteredUsers)
  
  // Fetch users data when component is mounted
  onMounted(async () => {
    try {
      await fetchUsers()
      if(props.modelValue.length > 0) {
        selectedUsers.value = props.modelValue
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  })
  
  // Check if a user is currently selected
  const isSelected = (user: User) => {
    return selectedUsers.value.some((selectedUser) => selectedUser.$id === user.$id)
  }
  
  // Toggle user selection (add/remove from selectedUsers)
  const toggleUser = (user: User) => {
    const index = selectedUsers.value.findIndex(
      (selectedUser) => selectedUser.$id === user.$id
    )
    
    if (index === -1) {
      // Add user if not already selected
      selectedUsers.value.push(user)
      emit('update:modelValue', selectedUsers.value)
    } else {
      // Remove user if already selected
      selectedUsers.value.splice(index, 1)
    }
  }
  
  // Handle search input and filter users
  const handleSearch = async (event: Event) => {
    let searchTerm = (event.target as HTMLInputElement).value
    userStore.filterUsers(searchTerm)
  }
  
  // Define emits for v-model support
  const emit = defineEmits(['update:modelValue'])
  // Define props for v-model support
   const props = defineProps({
    modelValue: {
      type: Array as () => User[],
      default: () => []
    }
  })
  
  // Watch for changes in selected users and emit IDs to parent
  watch(selectedUsers, (newValue) => {
    emit('update:modelValue', newValue.map(user => user.$id))
  })
</script>

<template>
  <div class="w-full">
    <!-- Popover component for user selection dropdown -->
    <Popover v-model:open="open" class="relative">
      <!-- Trigger button for the popover -->
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          role="combobox"
          :aria-expanded="open"
          class="w-full justify-between"
        >
          <!-- Show placeholder if no users selected -->
          <span v-if="selectedUsers.length === 0">
            Select users to assign...
          </span>
          <!-- Show selected users' names if any -->
          <span v-else class="flex gap-1 flex-wrap">
            {{ selectedUsers.map(user => user.Name).join(', ') }}
          </span>
          <ChevronsUpDown class="w-5 h-5" />
        </Button>
      </PopoverTrigger>

      <!-- Popover content containing the user selection interface -->
      <PopoverContent class="w-full p-0">
        <Command>
          <!-- Search input for filtering users -->
          <CommandInput 
            placeholder="Search users..." 
            @input="handleSearch"
          />
          <CommandList>
            <!-- Shown when no users match search -->
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              <!-- Scrollable area containing user list -->
              <ScrollArea class="h-[200px]">
                <!-- List of users with checkboxes -->
                <CommandItem
                  v-for="user in filteredUsers"
                  :key="user.$id"
                  :value="user"
                  @select="toggleUser(user)"
                >
                  <Checkbox
                    :checked="isSelected(user)"
                    class="mr-2"
                  />
                  {{ user.Name }}
                  <span class="ml-2 text-sm text-gray-500">{{ user.email }}</span>
                </CommandItem>
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
</template>
  
  