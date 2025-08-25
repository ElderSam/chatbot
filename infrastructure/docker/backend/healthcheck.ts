#!/usr/bin/env node

// Simple healthcheck for Docker
import * as http from 'http';

interface HealthCheckOptions {
  host: string;
  port: number;
  path: string;
  timeout: number;
}

const options: HealthCheckOptions = {
  host: 'localhost',
  port: 3000,
  path: '/health',
  timeout: 2000,
};

const healthCheck = http.request(options, (res: http.IncomingMessage) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

healthCheck.on('error', (err: Error) => {
  console.log('ERROR:', err.message);
  process.exit(1);
});

healthCheck.end();
