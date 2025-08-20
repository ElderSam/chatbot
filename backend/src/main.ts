import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORT = process.env.PORT ?? 3003;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT); 
  console.log('server running on PORT='+PORT);
}
bootstrap();
