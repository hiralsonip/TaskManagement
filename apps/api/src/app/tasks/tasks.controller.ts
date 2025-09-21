import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('tasks')
export class TasksController {
    @UseGuards(AuthGuard('jwt'))
    @Get('my-tasks')
    getMyTasks(@Request() req) {
        return `Hello ${req.user.username} ${req.user.userId}`
    }
}
