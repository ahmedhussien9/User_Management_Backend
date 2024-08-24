import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function startServer() {
  const app = await NestFactory.create(AppModule);

  // Configure CORS settings
  app.enableCors({
    origin: 'http://localhost:4200', // Allow requests from this frontend URL
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    credentials: true, // Include credentials in requests
  });

  await app.listen(3000); // Start the server on port 3000
}

startServer();