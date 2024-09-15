import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteController } from './site/site.controller';
import { SiteModule } from './site/site.module';
import { SiteService } from './site/site.service';
import { TicketController } from './ticket/ticket.controller';
import { TicketModule } from './ticket/ticket.module';
import { TicketService } from './ticket/ticket.service';
import { TruckController } from './truck/truck.controller';
import { TruckModule } from './truck/truck.module';
import { TruckService } from './truck/truck.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configure TypeORM with the ConfigService to load env variables
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT'), 10),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    // Other modules
    SiteModule,
    TruckModule,
    TicketModule,
  ],
  providers: [SiteService, TruckService, TicketService],
  controllers: [SiteController, TruckController, TicketController],
})
export class AppModule {}
