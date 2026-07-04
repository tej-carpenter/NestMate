const http = require('http');

const pages = [
  '/',
  '/search',
  '/host/dashboard',
  '/host/listings/new',
  '/auth/login',
  '/auth/signup',
  '/about'
];

async function checkPage(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      resolve({ path, status: res.statusCode });
    }).on('error', (e) => {
      resolve({ path, status: 'error', error: e.message });
    });
  });
}

async function run() {
  console.log('Testing pages...');
  let hasErrors = false;
  for (const page of pages) {
    const result = await checkPage(page);
    console.log(`${result.path}: ${result.status}`);
    if (result.status !== 200) {
      hasErrors = true;
    }
  }
  if (hasErrors) {
    console.log('\nSome pages returned non-200 status codes. This might indicate a Next.js cache issue.');
  } else {
    console.log('\nAll pages returned 200 OK.');
  }
}

run();
