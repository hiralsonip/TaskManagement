export interface UpdateTaskDto {
    title?: string;
    status?: 'todo' | 'inprogress' | 'done';
}