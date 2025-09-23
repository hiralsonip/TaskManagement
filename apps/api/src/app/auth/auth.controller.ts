import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService, private userService: UserService) { }

    @Post('login')
    async login(
        @Body() body: { username: string, password: string },
        @Res({ passthrough: true }) res: Response
    ) {
        const { access_token, user } = await this.authService.loginUser(body.username, body.password);

        // Set JWT as HttpOnly cookie
        res.cookie('jwt', access_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 // 1 hour
        });

        return { message: "Login successful", user, access_token }
    }

    @Post('register')
    register(@Body() body: { username: string, password: string }) {
        return this.authService.registerUser(body.username, body.password);
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    getProfile(@Req() req) {
        return this.userService.getProfile(req.user.id);
        return req.user; // comes from JwtStrategy.validate()
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie("jwt");
        return { message: "Logout successful" }
    }
}

