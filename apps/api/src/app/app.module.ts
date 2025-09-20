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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'apps/api/taskmanagement.sqlite',
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule,
    UserModule,
    RolesModule,
    TasksModule,
    OrganizationModule,
    AuditLogModule,
  ],
  controllers: [AppController, AuditLogController],
  providers: [AppService, OrganizationService],
})
export class AppModule { }
