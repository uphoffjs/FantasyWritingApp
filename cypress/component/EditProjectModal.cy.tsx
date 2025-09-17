import { EditProjectModal } from '../../src/components/EditProjectModal';
import { mountWithProviders } from '../support/mount-helpers';
import { mockProject, mockProjectWithElements } from '../support/test-data';
import { waitForAnimation, setMobileViewport, setTabletViewport, setDesktopViewport } from '../support/test-utils';

describe('EditProjectModal Component', () => {
  let onCloseSpy: any;
  let updateProjectStub: any;
  let duplicateProjectStub: any;
  let deleteProjectStub: any;

  const defaultProject = {
    ...mockProject,
    name: 'Middle Earth Chronicles',
    description: 'A fantasy world with hobbits and wizards',
    genre: 'Fantasy',
    status: 'active',
    isArchived: false,
    coverImage: null
  };

  beforeEach(() => {
    onCloseSpy = cy.spy();
    cy.clearLocalStorage();
  });

  describe('Rendering', () => {
    it('renders with all form fields populated from project data', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />
      );

      // Check header
      cy.get('h2').should('contain', 'Edit Project');
      cy.get('[data-cy="close-modal"]').should('be.visible');

      // Check form fields are populated
      cy.get('[data-cy="project-name-input"]').should('have.value', 'Middle Earth Chronicles');
      cy.get('[data-cy="project-description-input"]').should('have.value', 'A fantasy world with hobbits and wizards');
      cy.get('[data-cy="project-genre-select"]').should('have.value', 'Fantasy');
      cy.get('[data-cy="project-status-select"]').should('have.value', 'active');

      // Check action buttons
      cy.get('[data-cy="archive-project-button"]').should('contain', 'Archive Project');
      cy.get('[data-cy="duplicate-project-button"]').should('contain', 'Duplicate Project');
      cy.get('[data-cy="delete-project-button"]').should('contain', 'Delete Project');

      // Check footer buttons
      cy.get('[data-cy="cancel-button"]').should('be.visible');
      cy.get('[data-cy="save-project-button"]').should('be.visible');
    });

    it('shows all genre options in dropdown', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />
      );

      cy.get('[data-cy="project-genre-select"]').click();
      
      const expectedGenres = [
        'Fantasy', 'Sci-Fi', 'Urban Fantasy', 'Dystopian', 
        'Post-Apocalyptic', 'Steampunk', 'Cyberpunk', 'Historical',
        'Alternate History', 'Mythology', 'Horror', 'Mystery', 'Other'
      ];

      expectedGenres.forEach(genre => {
        cy.get('[data-cy="project-genre-select"] option').should('contain', genre);
      });
    });

    it('shows all status options in dropdown', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />
      );

      cy.get('[data-cy="project-status-select"]').click();
      
      const expectedStatuses = [
        'Planning', 'Active Development', 'Under Revision',
        'Completed', 'Archived', 'On Hold'
      ];

      expectedStatuses.forEach(status => {
        cy.get('[data-cy="project-status-select"] option').should('contain', status);
      });
    });

    it('displays project cover image if present', () => {
      const projectWithImage = {
        ...defaultProject,
        coverImage: 'data:image/png;base64,iVBORw0KGgoAAAANS'
      };

      mountWithProviders(
        <EditProjectModal project={projectWithImage} onClose={onCloseSpy} />
      );

      cy.get('img[alt="Project cover"]').should('be.visible');
      cy.get('button[title="Remove image"]').should('be.visible');
    });

    it('shows restore button for archived projects', () => {
      const archivedProject = {
        ...defaultProject,
        isArchived: true
      };

      mountWithProviders(
        <EditProjectModal project={archivedProject} onClose={onCloseSpy} />
      );

      cy.get('[data-cy="archive-project-button"]')
        .should('contain', 'Restore Project')
        .and('have.class', 'bg-flame-600');
    });
  });

  describe('Form Validation', () => {
    it('shows error when name is empty', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />,
        {
          initialState: {
            updateProject: updateProjectStub = cy.stub()
          }
        }
      );

      cy.get('[data-cy="project-name-input"]').clear();
      cy.get('[data-cy="save-project-button"]').click();

      cy.get('.text-blood-500').should('contain', 'Project name is required');
      cy.wrap(updateProjectStub).should('not.have.been.called');
    });

    it('shows error when description is empty', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />,
        {
          initialState: {
            updateProject: updateProjectStub = cy.stub()
          }
        }
      );

      cy.get('[data-cy="project-description-input"]').clear();
      cy.get('[data-cy="save-project-button"]').click();

      cy.get('.text-blood-500').should('contain', 'Project description is required');
      cy.wrap(updateProjectStub).should('not.have.been.called');
    });

    it('shows multiple validation errors', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />,
        {
          initialState: {
            updateProject: updateProjectStub = cy.stub()
          }
        }
      );

      cy.get('[data-cy="project-name-input"]').clear();
      cy.get('[data-cy="project-description-input"]').clear();
      cy.get('[data-cy="save-project-button"]').click();

      cy.get('.text-blood-500').should('have.length', 2);
      cy.wrap(updateProjectStub).should('not.have.been.called');
    });

    it('clears error when field is corrected', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />
      );

      cy.get('[data-cy="project-name-input"]').clear();
      cy.get('[data-cy="save-project-button"]').click();
      cy.get('.text-blood-500').should('contain', 'Project name is required');

      cy.get('[data-cy="project-name-input"]').type('New Name');
      cy.get('.text-blood-500').should('not.exist');
    });

    it('trims whitespace from inputs', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />,
        {
          initialState: {
            updateProject: updateProjectStub = cy.stub()
          }
        }
      );

      cy.get('[data-cy="project-name-input"]').clear().type('  Trimmed Name  ');
      cy.get('[data-cy="project-description-input"]').clear().type('  Trimmed Description  ');
      cy.get('[data-cy="save-project-button"]').click();

      cy.wrap(updateProjectStub).should('have.been.calledWith', 
        defaultProject.id,
        Cypress.sinon.match({
          name: 'Trimmed Name',
          description: 'Trimmed Description'
        })
      );
    });
  });

  describe('Save Functionality', () => {
    it('saves changes and closes modal', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />,
        {
          initialState: {
            updateProject: updateProjectStub = cy.stub()
          }
        }
      );

      cy.get('[data-cy="project-name-input"]').clear().type('Updated Name');
      cy.get('[data-cy="project-description-input"]').clear().type('Updated Description');
      cy.get('[data-cy="project-genre-select"]').select('Sci-Fi');
      cy.get('[data-cy="project-status-select"]').select('completed');
      
      cy.get('[data-cy="save-project-button"]').click();

      cy.wrap(updateProjectStub).should('have.been.calledWith',
        defaultProject.id,
        {
          name: 'Updated Name',
          description: 'Updated Description',
          genre: 'Sci-Fi',
          status: 'completed',
          isArchived: false,
          coverImage: ''
        }
      );

      cy.wrap(onCloseSpy).should('have.been.called');
    });

    it('preserves existing data when updating single field', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />,
        {
          initialState: {
            updateProject: updateProjectStub = cy.stub()
          }
        }
      );

      cy.get('[data-cy="project-name-input"]').clear().type('Only Name Changed');
      cy.get('[data-cy="save-project-button"]').click();

      cy.wrap(updateProjectStub).should('have.been.calledWith',
        defaultProject.id,
        Cypress.sinon.match({
          name: 'Only Name Changed',
          description: 'A fantasy world with hobbits and wizards',
          genre: 'Fantasy',
          status: 'active'
        })
      );
    });
  });

  describe('Image Upload', () => {
    it('handles valid image upload', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />
      );

      const fileName = 'test-image.png';
      const fileContent = 'data:image/png;base64,iVBORw0KGgoAAAANS';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(fileContent),
        fileName: fileName,
        mimeType: 'image/png'
      }, { force: true });

      // Image preview should be visible
      cy.get('img[alt="Project cover"]').should('be.visible');
      cy.get('button[title="Remove image"]').should('be.visible');
    });

    it('shows error for non-image files', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />
      );

      const fileName = 'test.pdf';
      
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('PDF content'),
        fileName: fileName,
        mimeType: 'application/pdf'
      }, { force: true });

      cy.get('.text-blood-500').should('contain', 'Please upload an image file');
    });

    it('shows error for large files', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />
      );

      // Create a file larger than 2MB
      const largeContent = new Uint8Array(3 * 1024 * 1024);
      
      cy.get('input[type="file"]').selectFile({
        contents: largeContent,
        fileName: 'large-image.png',
        mimeType: 'image/png'
      }, { force: true });

      cy.get('.text-blood-500').should('contain', 'Image size must be less than 2MB');
    });

    it('removes uploaded image', () => {
      const projectWithImage = {
        ...defaultProject,
        coverImage: 'data:image/png;base64,iVBORw0KGgoAAAANS'
      };

      mountWithProviders(
        <EditProjectModal project={projectWithImage} onClose={onCloseSpy} />
      );

      cy.get('img[alt="Project cover"]').should('be.visible');
      cy.get('button[title="Remove image"]').click();
      
      cy.get('img[alt="Project cover"]').should('not.exist');
      cy.get('.text-ink-light').should('contain', 'Click to upload cover image');
    });
  });

  describe('Project Actions', () => {
    it('toggles archive status', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />,
        {
          initialState: {
            updateProject: updateProjectStub = cy.stub()
          }
        }
      );

      cy.get('[data-cy="archive-project-button"]').click();

      cy.wrap(updateProjectStub).should('have.been.calledWith',
        defaultProject.id,
        { isArchived: true }
      );

      // Button should now show "Restore Project"
      cy.get('[data-cy="archive-project-button"]').should('contain', 'Restore Project');
    });

    it('handles project duplication with confirmation', () => {
      // Mock the platform dialog
      cy.window().then((win: any) => {
        win.electronAPI = {
          dialog: {
            confirm: cy.stub().resolves(true)
          }
        };
      });

      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />,
        {
          initialState: {
            duplicateProject: duplicateProjectStub = cy.stub()
          }
        }
      );

      cy.get('[data-cy="duplicate-project-button"]').click();
      waitForAnimation();

      cy.wrap(duplicateProjectStub).should('have.been.calledWith', defaultProject.id);
      cy.wrap(onCloseSpy).should('have.been.called');
    });

    it('cancels duplication when user declines', () => {
      // Mock the platform dialog
      cy.window().then((win: any) => {
        win.electronAPI = {
          dialog: {
            confirm: cy.stub().resolves(false)
          }
        };
      });

      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />,
        {
          initialState: {
            duplicateProject: duplicateProjectStub = cy.stub()
          }
        }
      );

      cy.get('[data-cy="duplicate-project-button"]').click();
      waitForAnimation();

      cy.wrap(duplicateProjectStub).should('not.have.been.called');
      cy.wrap(onCloseSpy).should('not.have.been.called');
    });

    it('shows delete confirmation before deleting', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />,
        {
          initialState: {
            deleteProject: deleteProjectStub = cy.stub()
          }
        }
      );

      // First click shows confirmation
      cy.get('[data-cy="delete-project-button"]').click();
      
      cy.get('.bg-blood-light\\/20').should('be.visible');
      cy.get('.text-blood-400').should('contain', 'Are you sure?');
      cy.get('[data-cy="confirm-delete-button"]').should('be.visible');
      cy.get('[data-cy="cancel-delete-button"]').should('be.visible');

      // Project should not be deleted yet
      cy.wrap(deleteProjectStub).should('not.have.been.called');
    });

    it('deletes project after confirmation', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />,
        {
          initialState: {
            deleteProject: deleteProjectStub = cy.stub()
          }
        }
      );

      cy.get('[data-cy="delete-project-button"]').click();
      cy.get('[data-cy="confirm-delete-button"]').click();

      cy.wrap(deleteProjectStub).should('have.been.calledWith', defaultProject.id);
      cy.wrap(onCloseSpy).should('have.been.called');
    });

    it('cancels delete when cancel is clicked', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />,
        {
          initialState: {
            deleteProject: deleteProjectStub = cy.stub()
          }
        }
      );

      cy.get('[data-cy="delete-project-button"]').click();
      cy.get('[data-cy="cancel-delete-button"]').click();

      // Confirmation should be hidden
      cy.get('.bg-blood-light\\/20').should('not.exist');
      cy.get('[data-cy="delete-project-button"]').should('be.visible');

      cy.wrap(deleteProjectStub).should('not.have.been.called');
    });
  });

  describe('Modal Interactions', () => {
    it('closes modal when close button is clicked', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />
      );

      cy.get('[data-cy="close-modal"]').click();
      cy.wrap(onCloseSpy).should('have.been.called');
    });

    it('closes modal when cancel button is clicked', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />
      );

      cy.get('[data-cy="cancel-button"]').click();
      cy.wrap(onCloseSpy).should('have.been.called');
    });

    it('does not close modal on background click', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />
      );

      // Click on the backdrop
      cy.get('.fixed.inset-0.bg-black').click({ force: true });
      cy.wrap(onCloseSpy).should('not.have.been.called');
    });

    it('handles form submission with Enter key', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />,
        {
          initialState: {
            updateProject: updateProjectStub = cy.stub()
          }
        }
      );

      cy.get('[data-cy="project-name-input"]').clear().type('Enter Key Test{enter}');

      cy.wrap(updateProjectStub).should('have.been.called');
      cy.wrap(onCloseSpy).should('have.been.called');
    });
  });

  describe('Status Indicator', () => {
    it('displays correct color for each status', () => {
      const statusColors = [
        { value: 'planning', color: 'text-sapphire-400' },
        { value: 'active', color: 'text-forest-400' },
        { value: 'revision', color: 'text-flame-400' },
        { value: 'completed', color: 'text-metals-gold' },
        { value: 'archived', color: 'text-ink-light' },
        { value: 'on-hold', color: 'text-orange-400' }
      ];

      statusColors.forEach(({ value, color }) => {
        const projectWithStatus = { ...defaultProject, status: value };
        
        mountWithProviders(
          <EditProjectModal project={projectWithStatus} onClose={onCloseSpy} />
        );

        cy.get('[data-cy="project-status-select"]').select(value);
        cy.get(`.${color}`).should('be.visible');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles extremely long project names', () => {
      const longName = 'A'.repeat(200);
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />,
        {
          initialState: {
            updateProject: updateProjectStub = cy.stub()
          }
        }
      );

      cy.get('[data-cy="project-name-input"]').clear().type(longName);
      cy.get('[data-cy="save-project-button"]').click();

      cy.wrap(updateProjectStub).should('have.been.calledWith',
        defaultProject.id,
        Cypress.sinon.match({ name: longName })
      );
    });

    it('handles special characters in inputs', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />,
        {
          initialState: {
            updateProject: updateProjectStub = cy.stub()
          }
        }
      );

      const specialName = '<script>alert("XSS")</script>';
      const specialDesc = '!@#$%^&*()_+-=[]{}|;:",.<>?/`~';

      cy.get('[data-cy="project-name-input"]').clear().type(specialName);
      cy.get('[data-cy="project-description-input"]').clear().type(specialDesc);
      cy.get('[data-cy="save-project-button"]').click();

      cy.wrap(updateProjectStub).should('have.been.calledWith',
        defaultProject.id,
        Cypress.sinon.match({
          name: specialName,
          description: specialDesc
        })
      );
    });

    it('handles rapid button clicks', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />,
        {
          initialState: {
            updateProject: updateProjectStub = cy.stub()
          }
        }
      );

      // Click save button multiple times rapidly
      for (let i = 0; i < 5; i++) {
        cy.get('[data-cy="save-project-button"]').click();
      }

      // Should only update once
      cy.wrap(updateProjectStub).should('have.been.calledOnce');
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for form fields', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />
      );

      cy.get('label[for="project-name"]').should('contain', 'Project Name');
      cy.get('label[for="project-genre"]').should('contain', 'Genre');
      cy.get('label[for="project-description"]').should('contain', 'Description');
      cy.get('label[for="project-status"]').should('contain', 'Project Status');
    });

    it('shows required field indicators', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />
      );

      cy.get('label[for="project-name"] .text-blood-500').should('contain', '*');
      cy.get('label[for="project-description"] .text-blood-500').should('contain', '*');
    });

    it('supports keyboard navigation', () => {
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />
      );

      cy.get('[data-cy="project-name-input"]').focus();
      cy.focused().should('have.attr', 'data-cy', 'project-name-input');

      // Tab through form fields
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'project-genre-select');

      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'project-description-input');

      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'project-status-select');
    });
  });

  describe('Responsive Design', () => {
    it('adapts layout for mobile viewports', () => {
      setMobileViewport();
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />
      );

      // Modal should be at bottom on mobile
      cy.get('.flex.items-end').should('be.visible');
      cy.get('.rounded-t-2xl').should('be.visible');
    });

    it('adapts layout for tablet viewports', () => {
      setTabletViewport();
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />
      );

      cy.get('.md\\:items-center').should('be.visible');
      cy.get('.md\\:rounded-lg').should('be.visible');
    });

    it('shows full layout on desktop', () => {
      setDesktopViewport();
      mountWithProviders(
        <EditProjectModal project={defaultProject} onClose={onCloseSpy} />
      );

      cy.get('.md\\:max-w-2xl').should('be.visible');
      cy.get('.md\\:p-6').should('be.visible');
    });
  });
});