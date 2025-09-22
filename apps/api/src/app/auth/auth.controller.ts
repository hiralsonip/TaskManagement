import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

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

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie("jwt");
        return { message: "Logout successful" }
    }
}

