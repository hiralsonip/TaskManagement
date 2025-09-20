import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) { }

    async create({ username, password }: { username: string; password: string }): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const userWithHashedPassword = { username, password: hashedPassword };
        const newUser = this.userRepository.create(userWithHashedPassword);
        return this.userRepository.save(newUser);
    }

    async findOne(username: string): Promise<User | undefined> {
        return this.userRepository.findOne({ where: { username } });
    }
}