import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
    constructor(private readonly usersService : UsersService) {}

    async signIn(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);

        if (user?.password !== pass) {
            throw new UnauthorizedException();
        }

        const { password, ...result } = user;
        // TODO Generate JWT and return here
        // instead of user object
        return result;
    }
}
