import { z } from 'zod'

// Enum values for task status and priority
export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
} as const

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const

// Base task schema
export const taskSchema = z.object({
  $id: z.string().optional(), // Optional for new tasks, required for existing ones
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]),
  priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH]),
  parent_task_id: z.string().nullable(),
  assigned_to: z.array(z.string()),
  completed: z.boolean(),
  project: z.string().min(1, 'Project is required'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD')
})

// Schema for creating a new task (some fields are optional)
export const createTaskSchema = taskSchema.omit({ $id: true }).extend({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]).default(TaskStatus.TODO),
  priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH]).default(TaskPriority.MEDIUM),
  completed: z.boolean().default(false),
  assigned_to: z.array(z.string()).default([]),
  parent_task_id: z.string().nullable().default(null),
  project: z.string().min(1, 'Project is required')
})

// Schema for updating an existing task
export const updateTaskSchema = taskSchema.partial().extend({
  $id: z.string()
})

// Type inference
export type Task = z.infer<typeof taskSchema>
export type CreateTask = z.infer<typeof createTaskSchema>
export type UpdateTask = z.infer<typeof updateTaskSchema>
