import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { permission } from 'process';

@Injectable()
export class AuthService {

    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) { }

    async loginUser(username: string, password: string): Promise<any> {
        const user = await this.userService.findOneWithRoles(username);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const { password: pwd, ...result } = user;

        console.log("USER --- ", user)
        //* JWT Token 
        const payload = {
            username: user.username,
            sub: user.id,
            roles: user.roles.map(role => role.name),
            permissions: user.roles.flatMap(role => role.permissions.map(p => p.name)),
            organization: user.organization.name
        };
        const access_token = await this.jwtService.signAsync(payload);

        return {
            user: result,
            access_token
        };

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
