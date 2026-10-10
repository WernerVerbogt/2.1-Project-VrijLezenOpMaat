// Handles authentication logic, such as signing in users and validating credentials,
// as well as JWT generation and validation
// email -> Prisma searches USER in db -> bcrypt.compare -> if true, then generate JWT token and return accesstoken

import { Injectable, UnauthorizedException } from '@nestjs/common';
//import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async login(loginDto: LoginDto) {
        const email = loginDto.email.trim().toLowerCase();

        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('E-mailadres of wachtwoord is onjuist.',);
        }

        const passwordMatches = await bcrypt.compare(loginDto.password, user.passwordHash,);

        if (!passwordMatches) {
            throw new UnauthorizedException('E-mailadres of wachtwoord is onjuist.',);
        }

        const role = user.role.toLowerCase();

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        }

        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role,
            },
        };
    }
}
