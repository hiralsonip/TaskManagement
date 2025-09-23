export interface TaskDto {
    id: string;
    title: string;
    status: 'todo' | 'inprogress' | 'done';
}