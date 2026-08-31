const http = require('http');

const routes = ['/', '/transactions', '/budgets', '/goals', '/debts', '/reports', '/settings'];

async function testRoutes() {
  console.log('Testing Next.js routes on localhost:3000...');
  for (const r of routes) {
    await new Promise((resolve) => {
      http.get('http://localhost:3000' + r, (res) => {
        console.log(`Route ${r.padEnd(16)} -> Status: ${res.statusCode}`);
        resolve();
      }).on('error', (err) => {
        console.log(`Route ${r.padEnd(16)} -> Error: ${err.message}`);
        resolve();
      });
    });
  }
}

testRoutes();
