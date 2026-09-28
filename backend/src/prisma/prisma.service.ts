// Handles transfer NestJS -> DB URL -> PrismaPg -> PrismaClient -> PostgreSQL
// Provides a reusable Prisma database service for NestJS,
// handling the PostgreSQL connection lifecycle automatically.

import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy
{
    constructor(configService: ConfigService) {
        const adapter = new PrismaPg({
            connectionString: configService.getOrThrow<string>('DATABASE_URL'),
        });

        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect(); // Open connection to db
    }

    async onModuleDestroy() {
        await this.$disconnect(); // Close connection to db when application stops
    }
}