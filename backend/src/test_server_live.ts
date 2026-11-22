import http from 'http';
import { app, server } from './server';
import { config } from './config/env';

const port = 5001;
server.listen(port, () => {
  console.log(`Test server actively listening on port ${port}...`);
  http.get(`http://localhost:${port}/health`, (res) => {
    console.log('HEALTH_HTTP_CODE:', res.statusCode);
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('HEALTH_RESPONSE_BODY:', body);
      server.close(() => {
        console.log('Server gracefully closed after successful health probe.');
        process.exit(0);
      });
    });
  }).on('error', (err) => {
    console.error('HTTP GET error:', err.message);
    server.close(() => process.exit(1));
  });
});
