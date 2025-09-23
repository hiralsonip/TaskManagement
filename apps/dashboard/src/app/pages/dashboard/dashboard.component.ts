import { Component, inject, OnInit } from '@angular/core';
import { Task, TaskService } from '../../services/task.service';
import { TaskDto, UserDto } from '@task-management/data';
import { UserStateService } from '../../state/user-state.service';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { appRoutes } from '../../app.routes';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    standalone: true,
    imports: [NgIf, FormsModule]
})
export class DashboardComponent implements OnInit {
    tasks: Task[] = [];
    taskCount = 0;
    user: UserDto | null = null
    roles: any = []
    statusMap: Record<string, string> = {
        todo: 'To Do',
        inprogress: 'In Progress',
        done: 'Done'
    };

    private taskService = inject(TaskService);
    private userState = inject(UserStateService);
    private authService = inject(AuthService)
    private router = inject(Router)

    ngOnInit() {
        console.log(this.statusMap["todo"])
        this.authService.getMe().subscribe({
            next: (user) => {
                this.userState.setUser(user); // directly user
                this.user = user; // set local user
                this.roles = user.roles.map((r: any) => r.name);
                this.loadTasks();             // load tasks once user is available

            },
            error: () => {
                this.userState.clearUser();
            }
        });
    }

    loadTasks() {
        this.taskService.getTasks().subscribe({
            next: res => {
                this.tasks = res.tasks;
                this.taskCount = res.count
            },
            error: err => console.error(err)
        })
    }

    loginClickHandler() {
        console.log("Login clicked")
    }

    logoutClickHandler() {
        console.log("Logout clicked")
        this.authService.logout().subscribe();
        this.router.navigate(['/login']);
    }

    toastMessage = '';
    toastType: 'success' | 'error' | 'warning' = 'success';

    showToast(message: string, type: 'success' | 'error' | 'warning' = 'success', duration = 3000) {
        this.toastMessage = message;
        this.toastType = type;

        setTimeout(() => {
            this.toastMessage = '';
        }, duration);
    }

    async updateTask(task: any) {
        if (!task.title || task.title.trim().length === 0) {
            alert('Task title cannot be empty');
            return;
        }

        if (!task.status || task.status.trim().length === 0) {
            alert('Task status cannot be empty');
            return;
        }

        try {
            const updates: Partial<Task> = {
                title: task.title,
                status: task.status,
            };

            const updatedTask = await this.taskService.updateTask(task.id, updates).toPromise();
            if (updatedTask) {
                const index = this.tasks.findIndex(t => t.id === task.id);
                if (index !== -1) this.tasks[index] = updatedTask;
                this.showToast('Task updated successfully', 'success');
            } else {
                alert("Something went wrong. Task is not updated.")
            }
            console.log('Task updated successfully', updatedTask);
        } catch (err: any) {
            console.error('Failed to update task', err);
            this.showToast('Failed to update task', 'error');
        }
    }

    async deleteTask(task: any) {
        try {
            const deletedTask = await this.taskService.deleteTask(task.id).toPromise();
            if (deletedTask) {
                this.tasks = this.tasks.filter(t => t.id !== task.id);
                this.taskCount = this.tasks.length;
                this.showToast('Task deleted successfully', 'success');
            }
        } catch (error: any) {
            console.error('Delete Task Error Message - ', error.error.message);
            const err = error.error.message ? error.error.message : 'Failed to delete task'
            this.showToast(err, 'error')
        }
    }

    newTaskTitle = '';
    async createTask() {
        if (!this.newTaskTitle?.trim()) {
            this.showToast('Task title cannot be empty', 'error');
            return;
        }

        try {
            const createdTask = await this.taskService.createTask(this.newTaskTitle.trim()).toPromise();

            // Add the new task to local array so the UI updates
            if (!createdTask) {
                this.showToast('Failed to create task', 'error');
            }
            if (createdTask) {
                this.tasks = [createdTask, ...this.tasks];
                this.taskCount = this.tasks.length;

                this.newTaskTitle = ''; // reset input
                this.showToast('Task created successfully', 'success');
            }

        } catch (err) {
            console.error('Failed to create task', err);
            this.showToast('Failed to create task', 'error');
        }
    }

    filterStatus = '';
    sortBy = 'title';
    sortDirection: 'asc' | 'desc' = 'asc';
    get filteredTasks() {
        let filtered = this.tasks;

        // Filter
        if (this.filterStatus) {
            filtered = filtered.filter(t => t.status === this.filterStatus);
        }

        // Sort
        return filtered.sort((a, b) => {
            let aVal, bVal;

            switch (this.sortBy) {
                case 'status':
                    aVal = a.status;
                    bVal = b.status;
                    break;
                case 'owner':
                    aVal = a.owner?.username || '';
                    bVal = b.owner?.username || '';
                    break;
                default:
                    aVal = a.title;
                    bVal = b.title;
            }

            if (aVal && bVal) {
                if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }


}
