<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTasks } from "@/composables/useTasks";
import { useUserDatabase } from "@/composables/useUserDatabase";
import { useUserStore } from "@/stores/user";
import UserSelector from "@/components/Tasks/UserSelector.vue";
import { useTaskStore } from "@/stores/tasks";
import type { Task } from "@/types/task";


// Initialize composables and stores
const route = useRoute();
const router = useRouter();
const { fetchTask, updateTask, deleteTask, toggleTaskCompletion } = useTasks();
const { fetchUser } = useUserDatabase();
const userStore = useUserStore();

// Reactive references

const isEditing = ref(false);
const editedTask = ref({
    title: "",
    status: "todo",
    priority: "medium",
    assigned_to: [],
    completed: false,
    project: "",
    due_date: ""
})as Ref<Partial<Task>>;
const selectedUsers = ref<User[]>([]);

// Computed properties
const fetchedUsers = computed(() => userStore.getFetchedUsers);
const taskStore = useTaskStore();
let task = computed(() => taskStore.getTask);
// Fetch task data and assigned users
const fetchTaskData = async () => {
    try {
        const taskId = route.params.id as string;
        const fetchedTask = await fetchTask(taskId);
        
        if (!fetchedTask) {
            throw new Error('Task not found');
        }

        // task.value = {
        //     $id: fetchedTask.$id,
        //     title: fetchedTask.title,
        //     status: fetchedTask.status,
        //     priority: fetchedTask.priority,
        //     parent_task_id: fetchedTask.parent_task_id || null,
        //     assigned_to: fetchedTask.assigned_to || [],
        //     completed: fetchedTask.completed || false,
        //     project: fetchedTask.project || null,
        //     due_date:""
        // };
        
        // // Format task data for editing
        // editedTask.value = {
        //     ...fetchedTask,
        //     due_date: fetchedTask.due_date 
        //         ? new Date(fetchedTask.due_date).toISOString().split("T")[0]
        //         : ""
        // };

        // Fetch and set assigned users
        if (task.value?.assigned_to) {
        selectedUsers.value = await Promise.all(
          
                task.value.assigned_to
                .map(async (userId: string) => {
                    try {
                        return await fetchUser(userId);
                    } catch (error) {
                        console.error(`Failed to fetch user ${userId}:`, error);
                        return null;
                    }
                })
            
        ).then(users => users.filter((user): user is User => user !== null));
            }
    } catch (error) {
        console.error("Failed to fetch task:", error);
        router.push('/tasks');
    }
};

// Task operations
const handleUpdateTask = async () => {
    if (!editedTask.value || !task.value) return;

    try {
        const updatedTaskData = {
            ...editedTask.value,
            assigned_to: selectedUsers.value.map((user: User) => user.$id)
        };

        const updatedTask = await updateTask(task.value.$id, updatedTaskData);
        // task.value = updatedTask;
        isEditing.value = false;
    } catch (error) {
        console.error("Failed to update task:", error);
    }
};

const handleDeleteTask = async () => {
    if (!task.value || !confirm("Are you sure you want to delete this task?")) return;

    try {
        await deleteTask(task.value.$id);
        router.push("/tasks");
    } catch (error) {
        console.error("Failed to delete task:", error);
    }
};

const handleToggleCompletion = async () => {
    if (!task.value) return;

    try {
        const res= await toggleTaskCompletion(task.value);
    } catch (error) {
        console.error("Failed to toggle task completion:", error);
    }
};

const startEditing = () => {
    isEditing.value = true;
    fetchTaskData();
};

// Initialize component
onMounted(fetchTaskData);
</script>

<template>
    <div class="p-2">
        <!-- Breadcrumb Navigation -->
        <Breadcrumb class="mb-4">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <NuxtLink href="/">Home</NuxtLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <NuxtLink href="/tasks">Tasks</NuxtLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>{{ task?.title || "Loading..." }}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

        <!-- Task Detail Card -->
        <div v-if="task" class="max-w-2xl mx-auto mt-8 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>{{ isEditing ? "Edit Task" : task.title }}</CardTitle>
                </CardHeader>
                
                <CardContent>
                    <!-- View Mode -->
                    <div v-if="!isEditing" class="space-y-4">
                        <div class="flex items-center space-x-2">
                            <Badge>{{ task.status }}</Badge>
                            <Badge>{{ task.priority }}</Badge>
                        </div>
                        <p>
                            <strong>Assigned to:</strong>
                            {{ selectedUsers.map((user: User) => user.Name).join(", ") || "Unassigned" }}
                        </p>
                        <p>
                            <strong>Due Date:</strong>
                            {{ task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date" }}
                        </p>
                        <div class="flex items-center space-x-2">
                            <Checkbox
                                :checked="task.completed"
                                @update:checked="handleToggleCompletion"
                            />
                            <span>{{ task.completed ? "Completed" : "Not Completed" }}</span>
                        </div>
                    </div>

                    <!-- Edit Mode -->
                    <form v-else @submit.prevent="handleUpdateTask" class="space-y-4">
                        <div>
                            <Label for="title">Title</Label>
                            <Input id="title" v-model="editedTask.title" required />
                        </div>
                        
                        <div>
                            <Label for="status">Status</Label>
                            <Select v-model="editedTask.status">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label for="priority">Priority</Label>
                            <Select v-model="editedTask.priority">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label for="assigned_to">Assigned To</Label>
                            <UserSelector v-model="selectedUsers" />
                        </div>

                        <div>
                            <Label for="due_date">Due Date</Label>
                            <Input
                                id="due_date"
                                type="date"
                                v-model="editedTask.due_date"
                            />
                        </div>
                    </form>
                </CardContent>

                <CardFooter class="flex justify-between">
                    <div v-if="!isEditing">
                        <Button @click="startEditing">Edit</Button>
                        <Button
                            @click="handleDeleteTask"
                            variant="destructive"
                            class="ml-2"
                        >Delete</Button>
                    </div>
                    <div v-else>
                        <Button @click="handleUpdateTask" type="submit">Save</Button>
                        <Button
                            @click="isEditing = false"
                            variant="outline"
                            class="ml-2"
                        >Cancel</Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
        <div v-else class="text-center mt-8">Loading...</div>
    </div>
</template>
