import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { CreatePatrickSeed } from './create-patrick.seed';
import { CreatePermissionsSeed } from './permissions.seed';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    console.log('Running Permissions Seed...');
    await new CreatePermissionsSeed().run(dataSource);
    console.log('Permissions Seed Completed');

    console.log('Running Patrick Seed...');
    await new CreatePatrickSeed().run(dataSource);
    console.log('Patrick Seed Completed');

    await app.close();
}

bootstrap();
