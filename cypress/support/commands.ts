/// <reference types="cypress" />

// Custom command to mock Supabase authentication
Cypress.Commands.add('loginAsTenant', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: 'mock-tenant-token',
      refresh_token: 'mock-refresh',
      user: {
        id: 'tenant-user-id',
        email: 'tenant@example.com',
        role: 'authenticated'
      }
    }));
  });

  cy.intercept('GET', '**/rest/v1/profiles*', {
    statusCode: 200,
    body: [{
      id: 'profile-id',
      user_id: 'tenant-user-id',
      role: 'tenant',
      display_name: 'Test Tenant',
      first_name: 'Test',
      last_name: 'Tenant',
      profile_completion_pct: 40,
      about_me: 'This is a long about me text that should wrap properly without overflowing its container.',
      profession: 'Software Engineer',
      country: 'GR',
      languages: ['el', 'en']
    }]
  }).as('getTenantProfile');
});

Cypress.Commands.add('loginAsLister', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: 'mock-lister-token',
      refresh_token: 'mock-refresh',
      user: {
        id: 'lister-user-id',
        email: 'lister@example.com',
        role: 'authenticated'
      }
    }));
  });

  cy.intercept('GET', '**/rest/v1/profiles*', {
    statusCode: 200,
    body: [{
      id: 'profile-id',
      user_id: 'lister-user-id',
      role: 'lister',
      display_name: 'Test Lister',
      first_name: 'Test',
      last_name: 'Lister',
      profile_completion_pct: 80,
      profession: 'Property Manager',
      country: 'GR',
      languages: ['el', 'en']
    }]
  }).as('getListerProfile');
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsTenant(): Chainable<void>;
      loginAsLister(): Chainable<void>;
    }
  }
}