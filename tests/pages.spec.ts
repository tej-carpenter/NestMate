import { test, expect } from '@playwright/test';

const PAGES = [
  { url: '/', title: 'Nestmate' },
  { url: '/search', title: 'Search' },
  { url: '/auth/login', title: 'Login' },
  { url: '/auth/signup', title: 'Sign up' },
  { url: '/host/dashboard', title: 'Host Dashboard' },
  { url: '/host/listings/new', title: 'Add a property' },
  { url: '/about', title: 'About' }
];

test.describe('Page Availability Tests', () => {
  for (const page of PAGES) {
    test(`should load ${page.url} successfully`, async ({ page: browserPage }) => {
      const response = await browserPage.goto(page.url);
      expect(response?.status()).toBe(200);
    });
  }
});
