/**
 * Unit tests for the authentication service.
 * External dependencies are mocked so no real database or JWT is required.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
    let service: AuthService;

    const prismaServiceMock = {};

    const jwtServiceMock = {
        signAsync: jest.fn(),
        verifyAsync: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule =
            await Test.createTestingModule({
                providers: [
                    AuthService,
                    {
                        provide: PrismaService,
                        useValue: prismaServiceMock,
                    },
                    {
                        provide: JwtService,
                        useValue: jwtServiceMock,
                    },
                ],
            }).compile();

        service =
            module.get<AuthService>(
                AuthService,
            );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});