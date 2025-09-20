import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(private userService: UserService) { }

    async loginUser(username: string, password: string): Promise<any> {
        const user = await this.userService.findOne(username);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const { password: pwd, ...result } = user;
        return result;
    }

    async registerUser(username: string, password: string): Promise<any> {
        const existingUser = await this.userService.findOne(username);
        if (existingUser) {
            throw new UnauthorizedException('Username already exists');
        }

        const newUser = await this.userService.create({ username, password });
        const { password: pwd, ...result } = newUser;
        return result;
    }
}
