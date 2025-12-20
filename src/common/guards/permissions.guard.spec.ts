import { PermissionsGuard } from './permissions.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Profile } from '../../user/entities/profile.entity';

describe('PermissionsGuard', () => {
    let guard: PermissionsGuard;
    let reflector: Reflector;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PermissionsGuard,
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<PermissionsGuard>(PermissionsGuard);
        reflector = module.get<Reflector>(Reflector);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should allow access if no permissions are required', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
        const context = {
            getHandler: jest.fn(),
            getClass: jest.fn(),
        } as unknown as ExecutionContext;

        expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access if user is not found in request', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['test.permission']);
        const context = {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({}),
            }),
        } as unknown as ExecutionContext;

        expect(() => guard.canActivate(context)).toThrow('User permissions not found');
    });

    it('should deny access if user has no roles', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['test.permission']);
        const user = { auth: {} } as Profile;
        const context = {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({ user }),
            }),
        } as unknown as ExecutionContext;

        expect(() => guard.canActivate(context)).toThrow('User permissions not found');
    });

    it('should deny access if user does not have required permissions', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['required.permission']);
        const user = {
            auth: {
                roles: [
                    {
                        role: {
                            permissions: [
                                { permission: { name: 'other.permission' } },
                            ],
                        },
                    },
                ],
            },
        } as unknown as Profile;

        const context = {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({ user }),
            }),
        } as unknown as ExecutionContext;

        expect(() => guard.canActivate(context)).toThrow('Insufficient permissions');
    });

    it('should allow access if user has required permissions', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['required.permission']);
        const user = {
            auth: {
                roles: [
                    {
                        role: {
                            permissions: [
                                { permission: { name: 'required.permission' } },
                            ],
                        },
                    },
                ],
            },
        } as unknown as Profile;

        const context = {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({ user }),
            }),
        } as unknown as ExecutionContext;

        expect(guard.canActivate(context)).toBe(true);
    });
});
