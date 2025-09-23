import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { Role } from '../entities/role.entity';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
    ) { }

    async create({ username, password }: { username: string; password: string }): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

        const defaultRole = await this.roleRepository.findOneBy({ name: 'Viewer' });
        if (!defaultRole) {
            throw new InternalServerErrorException('Default role not found');
        }

        const userWithHashedPassword = {
            username,
            password: hashedPassword,
            roles: [defaultRole],
        };
        const newUser = this.userRepository.create(userWithHashedPassword);
        return this.userRepository.save(newUser);
    }

    async findOne(username: string): Promise<User | undefined> {
        try {
            const user = await this.userRepository.findOneBy({ username });
            return user
        } catch (error) {
            console.error(error)
        }
    }

    async findOneWithRoles(username: string): Promise<User | undefined> {
        try {
            const user = await this.userRepository.findOne({
                where: { username },
                relations: ['roles', 'roles.permissions', 'organization'],
            });
            return user
        } catch (error) {
            console.error(error)
        }
    }

    async getProfile(id: string) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['roles', 'roles.permissions', 'organization']
        });
        return user;
    }
}