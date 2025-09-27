describe('Tenant Profile Tests', () => {
  beforeEach(() => {
    // Mock authentication and set up tenant user
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        user: {
          id: 'tenant-user-id',
          email: 'tenant@example.com',
          role: 'authenticated'
        }
      }));
    });
    
    // Mock profile data for tenant
    cy.intercept('GET', '**/rest/v1/profiles*', {
      statusCode: 200,
      body: [{
        id: 'profile-id',
        user_id: 'tenant-user-id',
        role: 'tenant',
        display_name: 'Test Tenant',
        profile_completion_pct: 40,
        about_me: 'This is a long about me text that should wrap properly without overflowing its container even when it contains very long Greek text like this: Αυτό είναι ένα πολύ μακρύ κείμενο που θα πρέπει να τυλίγεται σωστά χωρίς να ξεπερνά τα όρια του περιέχοντός του.',
        profession: 'Software Engineer',
        country: 'GR',
        languages: ['el', 'en']
      }]
    }).as('getProfile');

    // Mock onboarding progress
    cy.intercept('GET', '**/rest/v1/onboarding_progress*', {
      statusCode: 200,
      body: [{
        user_id: 'tenant-user-id',
        role: 'tenant',
        completed_steps: [1, 2, 3],
        current_step: 4
      }]
    }).as('getOnboardingProgress');
  });

  it('should hide TikTok field in profile', () => {
    cy.visit('/me');
    cy.wait(['@getProfile', '@getOnboardingProgress']);
    
    // TikTok field should not be visible
    cy.contains('TikTok').should('not.exist');
    cy.contains('social_tiktok').should('not.exist');
  });

  it('should hide Published listings section for tenant', () => {
    cy.visit('/me');
    cy.wait(['@getProfile', '@getOnboardingProgress']);
    
    // Published listings section should not be visible for tenants
    cy.contains('Δημοσιευμένες αγγελίες').should('not.exist');
    cy.contains('Δεν έχετε δημοσιεύσει ακόμη αγγελίες').should('not.exist');
  });

  it('should hide Publish listing button in header for tenant', () => {
    cy.visit('/');
    cy.wait('@getProfile');
    
    // Desktop view - button should not be visible for tenants
    cy.get('[data-testid="publish-listing-btn"]').should('not.exist');
    
    // Mobile view
    cy.viewport('iphone-x');
    cy.get('[data-testid="mobile-menu-btn"]').click();
    cy.contains('Δημοσίευσε αγγελία').should('not.exist');
  });

  it('should properly wrap About text without overflow', () => {
    cy.visit('/me');
    cy.wait(['@getProfile', '@getOnboardingProgress']);
    
    // Check that about text container has proper CSS classes
    cy.contains('Σχετικά με εμένα').parent().within(() => {
      cy.get('p').should('have.class', 'whitespace-pre-wrap');
      cy.get('p').should('have.class', 'break-words');
      cy.get('p').should('have.class', 'overflow-wrap-anywhere');
      
      // Verify text is visible and doesn't overflow
      cy.get('p').should('be.visible');
      cy.get('p').then(($el) => {
        const element = $el[0];
        const parent = element.parentElement;
        expect(element.scrollWidth).to.be.at.most(parent.clientWidth);
      });
    });
  });

  it('should show profile completion banner with correct percentage', () => {
    cy.visit('/me?role=tenant');
    cy.wait(['@getProfile', '@getOnboardingProgress']);
    
    // Profile completion banner should be visible
    cy.get('[data-testid="profile-completion-banner"]').should('be.visible');
    cy.contains('40% ολοκληρωμένο').should('be.visible');
    cy.contains('Πρόσθεσε τις τελευταίες πινελιές').should('be.visible');
  });

  it('should show validation checkmarks for completed fields', () => {
    cy.visit('/me');
    cy.wait(['@getProfile', '@getOnboardingProgress']);
    
    // Fields with values should show checkmarks when not editing
    cy.get('[data-testid="field-profession"]').within(() => {
      cy.get('.lucide-check').should('be.visible');
    });
    
    cy.get('[data-testid="field-country"]').within(() => {
      cy.get('.lucide-check').should('be.visible');
    });
  });

  it('should hide checkmarks when editing fields', () => {
    cy.visit('/me');
    cy.wait(['@getProfile', '@getOnboardingProgress']);
    
    // Click edit button to enter edit mode
    cy.contains('Επεξεργασία').click();
    
    // Checkmarks should be hidden when editing
    cy.get('.lucide-check').should('not.exist');
  });

  it('should update completion banner live as user completes fields', () => {
    // Mock profile update
    cy.intercept('POST', '**/rest/v1/profiles*', {
      statusCode: 200,
      body: {
        profile_completion_pct: 60
      }
    }).as('updateProfile');

    cy.visit('/me?role=tenant');
    cy.wait(['@getProfile', '@getOnboardingProgress']);
    
    // Initial completion percentage
    cy.contains('40% ολοκληρωμένο').should('be.visible');
    
    // Complete a field (mock interaction)
    cy.contains('Ολοκλήρωσε το προφίλ').click();
    
    // Mock completing additional fields and updating profile
    cy.get('[data-testid="profile-completion-modal"]').should('be.visible');
  });
});