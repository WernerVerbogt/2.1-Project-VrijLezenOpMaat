// Handles authentication logic, such as signing in users and validating credentials.
// Also JWT generation and validation

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async signIn(
        username: string,
        password: string,
    ): Promise<{ access_token: string }> {
        const user = await this.usersService.findOne(username);
        if (user?.password !== password) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { sub: user.userId, username: user.username };
        return {
            // here the jwt secret key that is used for signing the payload
            // is the key that was passed in the JwtModule.register() method in the AuthModule
            access_token: await this.jwtService.signAsync(payload),
        }
    }
}
