import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from './site/site.entity';
import { SiteModule } from './site/site.module';
import { Ticket } from './ticket/ticket.entity';
import { TicketModule } from './ticket/ticket.module';
import { Truck } from './truck/truck.entity';
import { TruckModule } from './truck/truck.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configure TypeORM with the ConfigService to load env variables
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.POSTGRES_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Site, Ticket, Truck],
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      autoLoadEntities: true,
    }),

    // Other modules
    SiteModule,
    TruckModule,
    TicketModule,
  ],
  providers: [], // Site, Truck and Ticket services are already imported in their own Moduels
  controllers: [], // Site, Truck and Ticket controllers are already imported in their own Moduels
})
export class AppModule {}
