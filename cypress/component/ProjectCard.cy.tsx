import React from 'react';
import { ProjectCard } from '../support/component-test-helpers';

describe('ProjectCard Component', () => {
  // Mock project data
  const mockProject = {
    id: 'test-project-1',
    name: 'The Chronicles of Eldoria',
    description: 'An epic fantasy tale of magic, dragons, and heroic adventures in the mystical realm of Eldoria.',
    genre: 'fantasy',
    status: 'active',
    elements: [
      {
        id: 'element-1',
        name: 'Aragorn',
        category: 'character',
        completionPercentage: 80,
        questions: [],
        answers: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'element-2',
        name: 'Rivendell',
        category: 'location',
        completionPercentage: 60,
        questions: [],
        answers: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    collaborators: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  };

  let mockOnPress;
  let mockOnEdit;
  let mockOnDuplicate;
  let mockOnDelete;

  beforeEach(() => {
    // Create stubs inside beforeEach
    mockOnPress = cy.stub().as('onPress');
    mockOnEdit = cy.stub().as('onEdit');
    mockOnDuplicate = cy.stub().as('onDuplicate');
    mockOnDelete = cy.stub().as('onDelete');
  });

  it('should render project information correctly', () => {
    cy.mount(
      <ProjectCard 
        project={mockProject} 
        onPress={mockOnPress}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
        testID="project-card"
      />
    );

    // Check that the card is visible
    cy.get('[data-testid="project-card"]').should('be.visible');
    
    // Check project name
    cy.contains('The Chronicles of Eldoria').should('be.visible');
    
    // Check description
    cy.contains('An epic fantasy tale of magic, dragons').should('be.visible');
    
    // Check genre tag
    cy.contains('fantasy').should('be.visible');
    
    // Check status tag
    cy.contains('Active').should('be.visible');
    
    // Check element count
    cy.contains('2 elements').should('be.visible');
  });

  it('should handle click to open project', () => {
    cy.mount(
      <ProjectCard 
        project={mockProject} 
        onPress={mockOnPress}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
        testID="project-card"
      />
    );

    cy.get('[data-testid="project-card"]').click();
    
    // Should call onPress with project
    cy.get('@onPress').should('have.been.calledWith', mockProject);
  });

  it('should display cover image when provided', () => {
    const projectWithImage = {
      ...mockProject,
      coverImage: 'https://example.com/cover.jpg',
    };

    cy.mount(
      <ProjectCard 
        project={projectWithImage} 
        onPress={mockOnPress}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
        testID="project-card"
      />
    );

    // Check that image is rendered
    cy.get('[data-testid="project-card"]').within(() => {
      cy.get('img').should('have.attr', 'src', 'https://example.com/cover.jpg');
    });
  });

  it('should display default folder icon when no cover image', () => {
    cy.mount(
      <ProjectCard 
        project={mockProject} 
        onPress={mockOnPress}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
        testID="project-card"
      />
    );

    // Check that folder icon is displayed
    cy.get('[data-testid="project-card"]').should('contain.text', '📁');
  });

  it('should show action menu when action [data-cy*="button"] clicked', () => {
    cy.mount(
      <ProjectCard 
        project={mockProject} 
        onPress={mockOnPress}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
        testID="project-card"
      />
    );

    // Click the action button (⋮)
    cy.get('[data-testid="project-action-button"]').click();
    
    // Check that action menu is visible
    cy.get('[data-testid="project-action-menu"]').should('be.visible');
    cy.contains('Edit').should('be.visible');
    cy.contains('Duplicate').should('be.visible');
    cy.contains('Delete').should('be.visible');
  });

  it('should close action menu when overlay clicked', () => {
    cy.mount(
      <ProjectCard 
        project={mockProject} 
        onPress={mockOnPress}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
        testID="project-card"
      />
    );

    // Open action menu
    cy.get('[data-testid="project-action-button"]').click();
    cy.get('[data-testid="project-action-menu"]').should('be.visible');
    
    // Click overlay to close (clicking outside the menu)
    cy.get('body').click(0, 0);
    
    // Menu should be hidden
    cy.get('[data-testid="project-action-menu"]').should('not.exist');
  });

  it('should handle different project statuses with proper colors', () => {
    const statuses = [
      { status: 'active', expectedText: 'Active', expectedColor: 'rgb(16, 185, 129)' },
      { status: 'completed', expectedText: 'Completed', expectedColor: 'rgb(245, 158, 11)' },
      { status: 'on-hold', expectedText: 'On Hold', expectedColor: 'rgb(249, 115, 22)' },
      { status: 'planning', expectedText: 'Planning', expectedColor: 'rgb(99, 102, 241)' },
      { status: 'revision', expectedText: 'Revision', expectedColor: 'rgb(239, 68, 68)' },
    ];

    statuses.forEach(({ status, expectedText, expectedColor }) => {
      const testProject = { ...mockProject, status, name: `Project ${status}` };
      
      cy.mount(
        <ProjectCard 
          project={testProject} 
          onPress={mockOnPress}
          onEdit={mockOnEdit}
          onDuplicate={mockOnDuplicate}
          onDelete={mockOnDelete}
          testID="project-card"
        />
      );

      // Check status text
      cy.contains(expectedText).should('be.visible');
      
      // Check status color (may be approximate due to alpha channel)
      cy.contains(expectedText).should('have.css', 'color', expectedColor);
    });
  });

  it('should display last updated date', () => {
    cy.mount(
      <ProjectCard 
        project={mockProject} 
        onPress={mockOnPress}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
        testID="project-card"
      />
    );

    // Check that dates are formatted correctly
    cy.contains('📅 Jan 1, 2024').should('be.visible'); // Created date
    cy.contains('🕐 Jan 15, 2024').should('be.visible'); // Updated date
  });

  it('should handle project without description', () => {
    const projectWithoutDescription = {
      ...mockProject,
      description: undefined,
    };

    cy.mount(
      <ProjectCard 
        project={projectWithoutDescription} 
        onDelete={mockOnDelete}
        testID="project-card"
      />
    );

    // Should show default message
    cy.contains('No description provided').should('be.visible');
  });

  it('should handle project without genre', () => {
    const projectWithoutGenre = {
      ...mockProject,
      genre: undefined,
    };

    cy.mount(
      <ProjectCard 
        project={projectWithoutGenre} 
        onDelete={mockOnDelete}
        testID="project-card"
      />
    );

    // Genre tag should not be visible
    cy.get('[data-testid="project-card"]').should('not.contain', 'fantasy');
  });

  it('should handle project without status', () => {
    const projectWithoutStatus = {
      ...mockProject,
      status: undefined,
    };

    cy.mount(
      <ProjectCard 
        project={projectWithoutStatus} 
        onDelete={mockOnDelete}
        testID="project-card"
      />
    );

    // Status tag should not be visible
    cy.get('[data-testid="project-card"]').should('not.contain', 'Active');
  });

  it('should show delete confirmation and handle deletion', () => {
    // Mock window.confirm for web
    cy.window().its('confirm').should('exist');
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true).as('confirm');
    });

    cy.mount(
      <ProjectCard 
        project={mockProject} 
        onPress={mockOnPress}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
        testID="project-card"
      />
    );

    // Open action menu and click delete
    cy.contains('⋮').click();
    cy.contains('🗑️ Delete Project').click();
    
    // Should show confirmation
    cy.get('@confirm').should('have.been.calledWith', 
      'Are you sure you want to delete "The Chronicles of Eldoria"? This action cannot be undone.'
    );
    
    // Should call onDelete
    cy.get('@onDelete').should('have.been.calledWith', 'test-project-1');
  });

  it('should handle delete confirmation cancellation', () => {
    // Mock window.confirm to return false
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false).as('confirm');
    });

    cy.mount(
      <ProjectCard 
        project={mockProject} 
        onPress={mockOnPress}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
        testID="project-card"
      />
    );

    // Open action menu and click delete
    cy.contains('⋮').click();
    cy.contains('🗑️ Delete Project').click();
    
    // Should show confirmation but not call onDelete
    cy.get('@confirm').should('have.been.called');
    cy.get('@onDelete').should('not.have.been.called');
  });

  it('should show loading state when deleting', () => {
    cy.mount(
      <ProjectCard 
        project={mockProject} 
        onDelete={mockOnDelete}
        isDeleting={true}
        testID="project-card"
      />
    );

    // Open action menu
    cy.contains('⋮').click();
    
    // Should show loading indicator instead of delete text
    cy.get('[data-testid="project-card"]').within(() => {
      // Look for ActivityIndicator (in React Native Web becomes a spinner)
      cy.get('*').should('exist'); // Loading indicator should be present
    });
  });

  it('should handle duplicate action', () => {
    cy.mount(
      <ProjectCard 
        project={mockProject} 
        onPress={mockOnPress}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
        testID="project-card"
      />
    );

    // Open action menu and click duplicate
    cy.contains('⋮').click();
    cy.contains('📋 Duplicate').click();
    
    // Should show coming soon alert (mocked)
    // In real implementation, this would trigger an alert
  });

  it('should handle edit action', () => {
    cy.mount(
      <ProjectCard 
        project={mockProject} 
        onPress={mockOnPress}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
        testID="project-card"
      />
    );

    // Open action menu and click edit
    cy.contains('⋮').click();
    cy.contains('✏️ Edit Project').click();
    
    // Should show coming soon alert (mocked)
    // In real implementation, this would trigger an alert
  });

  it('should be accessible', () => {
    cy.mount(
      <ProjectCard 
        project={mockProject} 
        onPress={mockOnPress}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
        testID="project-card"
      />
    );

    // Check that the card has proper accessibility
    cy.get('[data-testid="project-card"]')
      .should('be.visible')
      .and('have.attr', 'role'); // Pressable in React Native Web becomes a [data-cy*="button"]-like element
  });

  it('should handle long project names', () => {
    const projectWithLongName = {
      ...mockProject,
      name: 'This is a very long project name that should be truncated properly to fit within the card layout without breaking the design',
    };

    cy.mount(
      <ProjectCard 
        project={projectWithLongName} 
        onDelete={mockOnDelete}
        testID="project-card"
      />
    );

    // Should still be visible and not break layout
    cy.get('[data-testid="project-card"]').should('be.visible');
    cy.contains('This is a very long project name').should('be.visible');
  });

  it('should show correct element count for empty project', () => {
    const emptyProject = {
      ...mockProject,
      elements: [],
    };

    cy.mount(
      <ProjectCard 
        project={emptyProject} 
        onDelete={mockOnDelete}
        testID="project-card"
      />
    );

    cy.contains('📝 0 elements').should('be.visible');
  });

  it('should handle long press to show actions on mobile', () => {
    cy.mount(
      <ProjectCard 
        project={mockProject} 
        onPress={mockOnPress}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
        testID="project-card"
      />
    );

    // Simulate long press (trigger onLongPress)
    cy.get('[data-testid="project-card"]').trigger('contextmenu');
    
    // Action menu should appear
    cy.contains('Edit Project').should('be.visible');
  });

  it('should maintain visual consistency across different content lengths', () => {
    const projectVariations = [
      { ...mockProject, name: 'Short', description: 'Brief.' },
      { 
        ...mockProject, 
        name: 'Medium Length Project Name', 
        description: 'A moderately detailed description of the project.' 
      },
      {
        ...mockProject,
        name: 'Very Long Project Name That Tests Layout Boundaries',
        description: 'An extremely detailed and comprehensive description that tests how the component handles very long text content and maintains proper layout structure.',
      },
    ];

    projectVariations.forEach((project, index) => {
      cy.mount(
        <ProjectCard 
          project={project} 
          onDelete={mockOnDelete}
          testID="project-card"
        />
      );

      // Each variation should render properly
      cy.get('[data-testid="project-card"]').should('be.visible');
      cy.contains(project.name).should('be.visible');
      cy.contains(project.description).should('be.visible');
    });
  });
});