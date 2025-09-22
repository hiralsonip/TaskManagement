import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { Role } from "../app/entities/role.entity";
import { Permission } from "../app/entities/permission.entity";
import { User } from "../app/entities/user.entity";
import { Task } from "../app/entities/task.entity";
import { Organization } from "../app/entities/organization.entity";

@Injectable()
export class SeederService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SeederService.name);

    constructor(
        @InjectRepository(Role) private rolesRepository: Repository<Role>,
        @InjectRepository(Permission) private permissionsRepository: Repository<Permission>,
        @InjectRepository(User) private usersRepository: Repository<User>,
        @InjectRepository(Task) private tasksRepository: Repository<Task>,
        @InjectRepository(Organization) private orgRepository: Repository<Organization>,
    ) { }

    async onApplicationBootstrap() {
        await this.seedPermissions();
        await this.seedRoles();
        await this.seedOrganizations();
        await this.seedDefaultAdmin();
        await this.seedSampleUsers();
        await this.seedTasks();
    }

    private async seedPermissions() {
        const permissions = ['CREATE_TASK', 'READ_TASK', 'UPDATE_TASK', 'DELETE_TASK'];

        for (const name of permissions) {
            const existing = await this.permissionsRepository.findOne({ where: { name } });
            if (!existing) {
                await this.permissionsRepository.save(this.permissionsRepository.create({ name }));
                this.logger.log(`Permission ${name} created`);
            }
        }
    }

    private async seedRoles() {
        const roles = [
            { name: 'Owner', permissions: ['CREATE_TASK', 'READ_TASK', 'UPDATE_TASK', 'DELETE_TASK'] },
            { name: 'Admin', permissions: ['CREATE_TASK', 'READ_TASK', 'UPDATE_TASK'] },
            { name: 'Viewer', permissions: ['READ_TASK'] },
        ];

        for (const roleData of roles) {
            let role = await this.rolesRepository.findOne({ where: { name: roleData.name }, relations: ['permissions'] });
            if (!role) role = this.rolesRepository.create({ name: roleData.name });

            const permissions = await this.permissionsRepository.find({
                where: roleData.permissions.map(name => ({ name }))
            });
            role.permissions = permissions;

            await this.rolesRepository.save(role);
            this.logger.log(`Role ${roleData.name} created or updated`);
        }
    }

    private async seedOrganizations() {
        const orgsData = ['Alpha Corp', 'Beta Inc'];
        for (const name of orgsData) {
            const existing = await this.orgRepository.findOne({ where: { name } });
            if (!existing) {
                const org = this.orgRepository.create({ name });
                await this.orgRepository.save(org);
                this.logger.log(`Organization ${name} created`);
            }
        }
    }

    private async seedDefaultAdmin() {
        const username = 'admin';
        const existing = await this.usersRepository.findOne({ where: { username }, relations: ['roles', 'organization'] });
        if (!existing) {
            const adminRole = await this.rolesRepository.findOne({ where: { name: 'Owner' } });
            const org = await this.orgRepository.findOne({}); // Assign to first org
            const hashedPassword = await bcrypt.hash('admin123', 10);

            const adminUser = this.usersRepository.create({
                username,
                password: hashedPassword,
                roles: [adminRole],
                organization: org
            });

            await this.usersRepository.save(adminUser);
            this.logger.log('Default admin user created with username: admin and password: admin123');
        }
    }

    private async seedSampleUsers() {
        const orgs = await this.orgRepository.find();
        const roles = await this.rolesRepository.find({ relations: ['permissions'] });

        const sampleUsers = [
            { username: 'owner1', role: 'Owner', org: orgs[0] },
            { username: 'admin1', role: 'Admin', org: orgs[0] },
            { username: 'viewer1', role: 'Viewer', org: orgs[0] },
            { username: 'admin2', role: 'Admin', org: orgs[1] },
            { username: 'viewer2', role: 'Viewer', org: orgs[1] },
        ];

        for (const userData of sampleUsers) {
            const existing = await this.usersRepository.findOne({ where: { username: userData.username }, relations: ['roles'] });
            if (!existing) {
                const role = roles.find(r => r.name === userData.role);
                const hashedPassword = await bcrypt.hash('password', 10);

                const user = this.usersRepository.create({
                    username: userData.username,
                    password: hashedPassword,
                    roles: [role],
                    organization: userData.org
                });
                await this.usersRepository.save(user);
                this.logger.log(`User ${userData.username} created`);
            }
        }
    }

    private async seedTasks() {
        const users = await this.usersRepository.find({ relations: ['roles', 'organization'] });
        const orgs = await this.orgRepository.find();

        if (!users.length || !orgs.length) return;

        const taskCount = await this.tasksRepository.count();
        if (taskCount > 0) return;

        const tasks: Partial<Task>[] = [];

        for (const user of users) {
            const org = user.organization || orgs[0];

            if (user.roles.some(r => r.name === 'Owner')) {
                tasks.push(
                    { title: `Owner Task 1`, status: 'todo', owner: user, organization: org },
                    { title: `Owner Task 2`, status: 'inprogress', owner: user, organization: org },
                );
            }

            if (user.roles.some(r => r.name === 'Admin')) {
                tasks.push(
                    { title: `Admin Task 1`, status: 'todo', owner: user, organization: org },
                    { title: `Admin Task 2`, status: 'done', owner: user, organization: org },
                );
            }

            // Optional: skip Viewer tasks if you want strict RBAC
        }

        if (tasks.length) {
            await this.tasksRepository.save(tasks.map(t => this.tasksRepository.create(t)));
            this.logger.log('Sample tasks seeded successfully.');
        }
    }
}
