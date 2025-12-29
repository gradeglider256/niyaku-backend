import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import {
  Client,
  IndividualClient,
  BusinessClient,
} from './entities/client.entity';
import { ClientAddress } from './entities/client.address.entity';
import { ClientContact } from './entities/client.contact.entity';
import { ClientDocument } from './entities/client.documents.entity';
import { BusinessRepresentative } from './entities/business-representative.entity';
import { Branch } from '../user/entities/branch.entity';
import { AuthMiddleware } from '../user/auth.middleware';
import { UserModule } from '../user/user.module';
import { DocumentsModule } from '../documents/documents.module';
import { EmploymentHistory } from '../credit_assessment/entities/employment.entity';
import { SalaryHistory } from '../credit_assessment/entities/salary.entity';
import { CompanyEarnings } from '../credit_assessment/entities/company-earnings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Client,
      IndividualClient,
      BusinessClient,
      ClientAddress,
      ClientContact,
      ClientDocument,
      BusinessRepresentative,
      Branch,
      EmploymentHistory,
      SalaryHistory,
      CompanyEarnings,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    DocumentsModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(ClientsController);
  }
}
