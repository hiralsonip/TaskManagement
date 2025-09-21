import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "../app/entities/role.entity";
import { Repository } from "typeorm";
import { Permission } from "../app/entities/permission.entity";
import { User } from "../app/entities/user.entity";
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SeederService.name);

    constructor(
        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,

        @InjectRepository(Permission)
        private permissionsRepository: Repository<Permission>,

        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async onApplicationBootstrap() {
        await this.seedPermissions();
        await this.seedsRoles();
        await this.seedDefaultAdmin();
    }

    private async seedPermissions() {
        const permissions = ['CREATE_TASK', 'READ_TASK', 'UPDATE_TASK', 'DELETE_TASK'];

        for (const name of permissions) {
            const existsing = await this.permissionsRepository.findOne({ where: { name } });
            if (!existsing) {
                await this.permissionsRepository.save(this.permissionsRepository.create({ name }))
                this.logger.log(`Permission ${name} created`);
            }
        }
    }

    private async seedsRoles() {
        const roles = [
            { name: 'Owner', permissions: ['CREATE_TASK', 'READ_TASK', 'UPDATE_TASK', 'DELETE_TASK'] },
            { name: 'Admin', permissions: ['CREATE_TASK', 'READ_TASK', 'UPDATE_TASK'] },
            { name: 'Viewer', permissions: ['READ_TASK'] },
        ];

        for (const roleData of roles) {
            let role = await this.rolesRepository.findOne({ where: { name: roleData.name }, relations: ['permissions'] });

            if (!role) {
                role = this.rolesRepository.create({ name: roleData.name })
            }

            //* Link permissions
            const permissions = await this.permissionsRepository.find({
                where: roleData.permissions.map(name => ({ name }))
            })
            role.permissions = permissions;

            await this.rolesRepository.save(role);
            this.logger.log(`Role ${roleData.name} created or updated`);
        }
    }

    private async seedDefaultAdmin() {
        const username = 'admin';
        const exists = await this.usersRepository.findOne({ where: { username }, relations: ['roles'] });

        if (!exists) {
            const adminRole = await this.rolesRepository.findOne({ where: { name: 'Owner' } });
            if (!adminRole) {
                this.logger.warn('Owner role not found, cannot create default admin.');
                return;
            }

            const hashedPassword = await bcrypt.hash('admin123', 10);
            const adminUser = this.usersRepository.create({
                username,
                password: hashedPassword,
                roles: [adminRole],
            });

            await this.usersRepository.save(adminUser);
            this.logger.log('Default admin user created with username: admin and password: admin123');
        }
    }
}
