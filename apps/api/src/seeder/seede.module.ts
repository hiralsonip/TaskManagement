import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { Role } from '../app/entities/role.entity';
import { Permission } from '../app/entities/permission.entity';
import { User } from '../app/entities/user.entity';
import { Task } from '../app/entities/task.entity';
import { Organization } from '../app/entities/organization.entity';


@Module({
    imports: [TypeOrmModule.forFeature([Role, Permission, User, Task, Organization])],
    providers: [SeederService],
    exports: [SeederService],
})
export class SeederModule { }
