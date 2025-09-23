import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Task } from '../entities/task.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class TasksService {

    constructor(
        @InjectRepository(Task) private taskRepository: Repository<Task>,
        @InjectRepository(User) private userRepository: Repository<User>,
    ) { }

    private async loadUserRelations(user: User): Promise<User> {
        return this.userRepository.findOne({
            where: { id: user.id },
            relations: ['roles', 'organization'],
        })
    }

    async createTask(user: User, title: string) {
        const fullUser = await this.loadUserRelations(user);
        if (!fullUser.organization) {
            throw new ForbiddenException('You must belong to an organization to create tasks');
        }

        if (!title || title.trim().length === 0) {
            throw new NotFoundException('Task title is required');
        }

        const task = this.taskRepository.create({ title, owner: fullUser, organization: fullUser.organization })
        return this.taskRepository.save(task)
    }

    async findTasksForUser(user: User) {
        const fullUser = await this.loadUserRelations(user);

        // Owner => All tasks
        if (fullUser.roles.some(r => r.name === 'Owner')) {
            const ownerTasks = await this.taskRepository.find({
                relations: ['owner', 'organization']
            })
            return { count: ownerTasks.length, tasks: ownerTasks };
        }

        if (fullUser.roles.some(r => r.name === 'Admin')) {
            // All tasks in the organization
            const adminTasks = await this.taskRepository.find({
                where: { organization: { id: fullUser.organization.id } },
                relations: ['owner', 'organization']
            });
            return { count: adminTasks.length, tasks: adminTasks };
        }

        // Viewer => Only own task
        const viewerTasks = await this.taskRepository.find({
            where: { owner: { id: fullUser.id } },
            relations: ['owner', 'organization']
        });
        return { count: viewerTasks.length, tasks: viewerTasks };
    }

    async updateTask(user: User, id: string, updates: Partial<Task>) {
        const fullUser = await this.loadUserRelations(user);

        if (!fullUser.organization) {
            throw new ForbiddenException('You must belong to an organization to update tasks');
        }

        const task = await this.taskRepository.findOne({
            where: { id },
            relations: ['owner', 'organization']
        })
        if (!task) throw new NotFoundException('Task not found');

        // Only owner or admin in org or the task owner can update
        if (!(fullUser.roles.some(r => ['Owner', 'Admin'].includes(r.name)) && task.organization.id === fullUser.organization.id) && task.owner.id !== fullUser.id) {
            throw new ForbiddenException('You can not update the task from different organization')
        }

        if (!updates.title || updates.title.trim().length === 0) {
            throw new NotFoundException('Task title is required');
        }

        if (!updates.status || updates.status.trim().length === 0) {
            throw new NotFoundException('Task status is required');
        }

        // Handle owner reassignment
        if (updates.owner && updates.owner.id !== task.owner.id) {
            if (!fullUser.roles.some(r => ['Owner', 'Admin'].includes(r.name))) {
                throw new ForbiddenException('Only Owner or Admin can reassign tasks');
            }

            const newOwner = await this.userRepository.findOne({
                where: { id: updates.owner.id },
                relations: ['organization']
            });

            if (!newOwner) {
                throw new NotFoundException('New owner user not found');
            }

            if (!newOwner || newOwner.organization.id !== fullUser.organization.id) {
                throw new ForbiddenException('New owner must belong to the same organization');
            }

            task.owner = newOwner;
        }

        Object.assign(task, updates);
        return this.taskRepository.save(task)
    }

    async deleteTask(user: User, id: string) {
        const fullUser = await this.loadUserRelations(user);

        if (!fullUser.organization) {
            throw new ForbiddenException('You must belong to an organization to delete tasks');
        }

        const task = await this.taskRepository.findOne({
            where: { id },
            relations: ['owner', 'organization'],
        });
        if (!task) throw new NotFoundException('Task not found');

        if (!(fullUser.roles.some(r => ['Owner', 'Admin'].includes(r.name)) && task.organization.id === fullUser.organization.id) && task.owner.id !== fullUser.id) {
            throw new ForbiddenException('You can not delete the task from different organization')
        }

        const deletedTask = await this.taskRepository.remove(task)
        return {
            message: 'Task deleted successfully',
            task: deletedTask
        }
    }
}
