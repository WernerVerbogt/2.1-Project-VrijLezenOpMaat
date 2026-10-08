/**
 * Unit tests for the authentication controller.
 * Authentication dependencies are mocked because guard behavior
 * is tested separately from the controller.
 */

import {
    Test,
    TestingModule,
} from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

describe('AuthController', () => {
    let controller: AuthController;

    const authServiceMock = {
        login: jest.fn(),
    };

    beforeEach(async () => {
        const moduleBuilder =
            Test.createTestingModule({
                controllers: [
                    AuthController,
                ],
                providers: [
                    {
                        provide: AuthService,
                        useValue: authServiceMock,
                    },
                ],
            });

        moduleBuilder
            .overrideGuard(AuthGuard)
            .useValue({
                canActivate: () => true,
            });

        const module: TestingModule =
            await moduleBuilder.compile();

        controller =
            module.get<AuthController>(
                AuthController,
            );
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});