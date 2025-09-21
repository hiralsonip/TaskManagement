import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { Role } from '../entities/role.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'default',
      // secret: 'secretkey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule { }
