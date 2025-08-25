import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORT = process.env.PORT ?? 3003;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enables CORS for all origins (frontend, Postman, curl, etc)
  app.enableCors();

  // Global exception filter to prevent raw exceptions from leaking
  // Import filter using standard TypeScript import
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { AllExceptionsFilter } = require('./all-exceptions.filter');
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(PORT);
  console.log('server running on PORT=' + PORT);
}
bootstrap();
