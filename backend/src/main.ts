import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Temp code to test db connection without API feature
  //const prisma = app.get(PrismaService);
  //const users = await prisma.user.findMany();
  //console.log(`PostgreSQL connection succesful. Users found: ${users.length}`);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
  