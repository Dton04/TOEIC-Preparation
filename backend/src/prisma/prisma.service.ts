import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL || '';
    const ssl =
      connectionString.includes('sslmode=require') ||
        connectionString.includes('ssl=true') ||
        connectionString.includes('db.prisma.io')
        ? { rejectUnauthorized: false }
        : undefined;
    const pool = new Pool({ connectionString, ssl });
    const adapter = new PrismaPg(pool as any);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('PostgreSQL connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}