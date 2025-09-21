import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RolesModule } from './roles/roles.module';
import { TasksModule } from './tasks/tasks.module';
import { OrganizationService } from './organization/organization.service';
import { OrganizationModule } from './organization/organization.module';
import { AuditLogController } from './audit-log/audit-log.controller';
import { AuditLogModule } from './audit-log/audit-log.module';
import { User } from './entities/user.entity';
import { Task } from './entities/task.entity';
import { Organization } from './entities/organization.entity';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { AuditLog } from './entities/audit-log.entity';
import { SeederModule } from '../seeder/seede.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'apps/api/taskmanagement.sqlite',
      entities: [User, Task, Organization, Permission, Role, AuditLog],
      synchronize: true,
    }),
    // TypeOrmModule.forFeature([User, Task, Organization, Permission, Role, AuditLog]),
    AuthModule,
    UserModule,
    RolesModule,
    TasksModule,
    OrganizationModule,
    AuditLogModule,
    SeederModule
  ],
  controllers: [AppController, AuditLogController],
  providers: [AppService, OrganizationService],
})
export class AppModule { }
