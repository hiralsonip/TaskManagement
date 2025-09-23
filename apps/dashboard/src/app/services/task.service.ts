import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface Task {
    id: string;
    title: string;
    status?: 'todo' | 'in-progress' | 'done';
    owner?: { id: string; username: string };
    organization?: { id: string; name: string };
}

@Injectable({ providedIn: 'root' })
export class TaskService {
    private apiUrl = 'http://localhost:3000/api/tasks';

    private http = inject(HttpClient);

    getTasks(): Observable<{ count: number; tasks: Task[] }> {
        return this.http.get<{ count: number; tasks: Task[] }>(this.apiUrl, { withCredentials: true });
    }

    createTask(title: string) {
        return this.http.post<Task>(this.apiUrl, { title })
    }

    updateTask(id: string, updates: Partial<Task>) {
        return this.http.put<Task>(`${this.apiUrl}/${id}`, updates);
    }

    deleteTask(id: string) {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
    }

}