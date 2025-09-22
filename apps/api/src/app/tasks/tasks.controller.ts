import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../guards/roles.guard';
import { HasPermissions, PermissionName } from '../../decorator/has-roles.decorators';
import { TasksService } from './tasks.service';
import { UpdateTaskDto } from '@task-management/data';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TasksController {

    constructor(private readonly taskService: TasksService) { }

    // Create task
    @Post()
    @HasPermissions(PermissionName.CREATE_TASK)
    createTask(@Body() body: { title: string }, @Request() req) {
        return this.taskService.createTask(req.user, body.title);
    }

    // Get tasks
    @Get()
    @HasPermissions(PermissionName.READ_TASK)
    getTasks(@Request() req) {
        return this.taskService.findTasksForUser(req.user);
    }

    // Update tasks
    @Put(':id')
    @HasPermissions(PermissionName.UPDATE_TASK)
    updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req) {
        return this.taskService.updateTask(req.user, id, updateTaskDto);
    }

    // Delete tasks
    @Delete(':id')
    @HasPermissions(PermissionName.DELETE_TASK)
    deleteTask(@Param('id') id: string, @Request() req) {
        return this.taskService.deleteTask(req.user, id)
    }

    // @Get('my-tasks')
    // @HasRoles(RoleName.ADMIN, RoleName.OWNER)
    // // @HasPermissions(PermissionName.READ_TASK)
    // getMyTasks(@Request() req) {
    //     return `Hello ${JSON.stringify(req.user)}`
    // }
}
