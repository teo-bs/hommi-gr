describe('Profile Completion Tests', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          role: 'authenticated'
        }
      }));
    });
  });

  it('should show completion banner when profile is incomplete', () => {
    // Mock incomplete profile
    cy.intercept('GET', '**/rest/v1/profiles*', {
      statusCode: 200,
      body: [{
        id: 'profile-id',
        user_id: 'test-user-id',
        role: 'tenant',
        display_name: 'Test User',
        profile_completion_pct: 40,
        first_name: 'Test',
        last_name: 'User'
      }]
    }).as('getIncompleteProfile');

    // Mock onboarding progress - basic onboarding done
    cy.intercept('GET', '**/rest/v1/onboarding_progress*', {
      statusCode: 200,
      body: [{
        user_id: 'test-user-id',
        role: 'tenant',
        completed_steps: [1, 2, 3],
        current_step: 4
      }]
    }).as('getOnboardingProgress');

    cy.visit('/me?role=tenant');
    cy.wait(['@getIncompleteProfile', '@getOnboardingProgress']);
    
    // Completion banner should be visible
    cy.get('[data-testid="profile-completion-banner"]').should('be.visible');
    cy.contains('40% ολοκληρωμένο').should('be.visible');
    cy.contains('Πρόσθεσε τις τελευταίες πινελιές').should('be.visible');
  });

  it('should hide completion banner when profile is complete', () => {
    // Mock complete profile
    cy.intercept('GET', '**/rest/v1/profiles*', {
      statusCode: 200,
      body: [{
        id: 'profile-id',
        user_id: 'test-user-id',
        role: 'tenant',
        display_name: 'Test User',
        profile_completion_pct: 100,
        first_name: 'Test',
        last_name: 'User',
        profession: 'Engineer',
        country: 'GR',
        date_of_birth: '1990-01-01'
      }]
    }).as('getCompleteProfile');

    cy.intercept('GET', '**/rest/v1/onboarding_progress*', {
      statusCode: 200,
      body: [{
        user_id: 'test-user-id',
        role: 'tenant',
        completed_steps: [1, 2, 3],
        current_step: 4
      }]
    }).as('getOnboardingProgress');

    cy.visit('/me?role=tenant');
    cy.wait(['@getCompleteProfile', '@getOnboardingProgress']);
    
    // Completion banner should NOT be visible
    cy.get('[data-testid="profile-completion-banner"]').should('not.exist');
  });

  it('should open completion modal when banner button is clicked', () => {
    // Mock incomplete profile
    cy.intercept('GET', '**/rest/v1/profiles*', {
      statusCode: 200,
      body: [{
        id: 'profile-id',
        user_id: 'test-user-id',
        role: 'tenant',
        display_name: 'Test User',
        profile_completion_pct: 40,
        first_name: 'Test',
        last_name: 'User'
      }]
    }).as('getIncompleteProfile');

    cy.intercept('GET', '**/rest/v1/onboarding_progress*', {
      statusCode: 200,
      body: [{
        user_id: 'test-user-id',
        role: 'tenant',
        completed_steps: [1, 2, 3],
        current_step: 4
      }]
    }).as('getOnboardingProgress');

    cy.visit('/me?role=tenant');
    cy.wait(['@getIncompleteProfile', '@getOnboardingProgress']);
    
    // Click completion banner button
    cy.contains('Ολοκλήρωσε το προφίλ').click();
    
    // Completion modal should open
    cy.get('[data-testid="profile-completion-modal"]').should('be.visible');
    cy.contains('Ολοκληρώστε το προφίλ σας').should('be.visible');
  });

  it('should show missing fields in completion banner', () => {
    // Mock profile with missing fields
    cy.intercept('GET', '**/rest/v1/profiles*', {
      statusCode: 200,
      body: [{
        id: 'profile-id',
        user_id: 'test-user-id',
        role: 'tenant',
        display_name: 'Test User',
        profile_completion_pct: 40,
        first_name: 'Test',
        last_name: 'User',
        profile_extras: {
          what_you_do: 'study_work'
          // Missing study_level and work_profession
        }
      }]
    }).as('getProfileWithMissingFields');

    cy.intercept('GET', '**/rest/v1/onboarding_progress*', {
      statusCode: 200,
      body: [{
        user_id: 'test-user-id',
        role: 'tenant',
        completed_steps: [1, 2, 3],
        current_step: 4
      }]
    }).as('getOnboardingProgress');

    cy.visit('/me?role=tenant');
    cy.wait(['@getProfileWithMissingFields', '@getOnboardingProgress']);
    
    // Banner should show missing fields
    cy.get('[data-testid="profile-completion-banner"]').should('be.visible');
    cy.contains('Λείπουν:').should('be.visible');
    cy.contains('Σπουδές').should('be.visible');
    cy.contains('Επάγγελμα').should('be.visible');
  });

  it('should allow editing all behavioral characteristics', () => {
    cy.intercept('GET', '**/rest/v1/profiles*', {
      statusCode: 200,
      body: [{
        id: 'profile-id',
        user_id: 'test-user-id',
        role: 'tenant',
        display_name: 'Test User',
        profile_completion_pct: 80,
        first_name: 'Test',
        last_name: 'User',
        profile_extras: {
          personality: ['Εξωστρεφής', 'Ήσυχος/η'],
          lifestyle: ['Πρωινός τύπος'],
          music: ['Pop', 'Rock'],
          sports: ['Ποδόσφαιρο'],
          movies: ['Κωμωδία']
        }
      }]
    }).as('getProfile');

    cy.intercept('GET', '**/rest/v1/onboarding_progress*', {
      statusCode: 200,
      body: []
    }).as('getOnboardingProgress');

    cy.visit('/me');
    cy.wait(['@getProfile', '@getOnboardingProgress']);
    
    // Click edit button in profile details section
    cy.get('[data-testid="profile-details-edit-btn"]').click();
    
    // Edit modal should open
    cy.get('[data-testid="profile-edit-modal"]').should('be.visible');
    
    // All behavioral characteristics sections should be editable
    cy.contains('Προσωπικότητα').should('be.visible');
    cy.contains('Στυλ ζωής').should('be.visible');
    cy.contains('Μουσική').should('be.visible');
    cy.contains('Σπορ').should('be.visible');
    cy.contains('Ταινίες').should('be.visible');
    
    // Should be able to modify existing selections
    cy.contains('Εξωστρεφής').parent().find('[data-testid="remove-chip"]').should('exist');
    cy.contains('Pop').parent().find('[data-testid="remove-chip"]').should('exist');
  });
});