import React from 'react';
import { TemplateManager } from '../../../src/components/TemplateManager';
import { TemplatePreview } from '../../../src/components/TemplatePreview';
import { TemplateSearch, TemplateFilters } from '../../../src/components/TemplateSearch';
import { TemplateImporter } from '../../../src/components/TemplateImporter';
import { TemplateMarketplace } from '../../../src/components/TemplateMarketplace';
import { QuestionnaireTemplate, ElementCategory } from '../../../src/types/models';

// * Mock the store
const mockStore = {
  projects: [
    {
      id: 'proj-1',
      name: 'Test Project',
      templates: [
        {
          id: 'template-1',
          name: 'Character Template',
          category: 'character' as ElementCategory,
          description: 'Basic character questionnaire',
          questions: [
            {
              id: 'q1',
              text: 'Character Name',
              type: 'text',
              required: true,
              category: 'general'
            },
            {
              id: 'q2',
              text: 'Age',
              type: 'number',
              required: false,
              category: 'general'
            },
            {
              id: 'q3',
              text: 'Personality Traits',
              type: 'multi[data-cy*="select"]',
              required: false,
              category: 'personality',
              options: [
                { value: 'brave', label: 'Brave' },
                { value: 'cunning', label: 'Cunning' },
                { value: 'loyal', label: 'Loyal' }
              ]
            }
          ],
          isDefault: false,
          tags: ['fantasy', 'rpg'],
          metadata: {
            version: '1.0',
            author: 'Test User',
            supportsBasicMode: true
          },
          updatedAt: new Date('2024-01-15').toISOString()
        },
        {
          id: 'template-2',
          name: 'Location Template',
          category: 'location' as ElementCategory,
          description: 'Location and place questionnaire',
          questions: [
            {
              id: 'q1',
              text: 'Location Name',
              type: 'text',
              required: true
            }
          ],
          isDefault: false,
          tags: ['geography'],
          updatedAt: new Date('2024-01-10').toISOString()
        }
      ]
    }
  ],
  createTemplate: cy.stub(),
  deleteTemplate: cy.stub(),
  importTemplates: cy.stub().resolves(true)
};

jest.mock('../../src/store/worldbuildingStore', () => ({
  useWorldbuildingStore: () => mockStore
}));

// TODO: * Mock the child components for TemplateManager tests
jest.mock('../../src/components/TemplateEditor', () => ({
  TemplateEditor: ({ onSave, onCancel }: any) => (
    <div data-testid="template-editor-mock">
      <[data-cy*="button"] onClick={() => onSave({ name: 'New Template', questions: [] })}>Save</[data-cy*="button"]>
      <[data-cy*="button"] onClick={onCancel}>Cancel</[data-cy*="button"]>
    </div>
  )
}));

describe('TemplateManager Component', () => {
  const defaultProps = {
    projectId: 'proj-1',
    onClose: cy.stub().as('onClose'),
    onSelectTemplate: cy.stub().as('onSelectTemplate')
  };

  beforeEach(() => {
    defaultProps.onClose.resetHistory();
    defaultProps.onSelectTemplate.resetHistory();
    mockStore.createTemplate.resetHistory();
    mockStore.deleteTemplate.resetHistory();
  });

  it('renders template manager with header', () => {
    cy.mount(<TemplateManager {...defaultProps} />);
    
    cy.contains('Template Manager').should('be.visible');
    cy.get('[data-testid="create-template-[data-cy*="button"]"]').should('exist');
    cy.get('[data-testid="import-template-[data-cy*="button"]"]').should('exist');
    cy.get('[data-testid="marketplace-[data-cy*="button"]"]').should('exist');
  });

  it('displays template categories', () => {
    cy.mount(<TemplateManager {...defaultProps} />);
    
    cy.get('[data-testid="category-character"]').should('exist');
    cy.get('[data-testid="category-location"]').should('exist');
    cy.get('[data-testid="category-custom"]').should('exist');
  });

  it('expands and collapses categories', () => {
    cy.mount(<TemplateManager {...defaultProps} />);
    
    cy.get('[data-testid="category-character"]').click();
    cy.get('[data-testid="template-template-1"]').should('be.visible');
    
    cy.get('[data-testid="category-character"]').click();
    cy.get('[data-testid="template-template-1"]').should('not.exist');
  });

  it('displays template details when expanded', () => {
    cy.mount(<TemplateManager {...defaultProps} />);
    
    cy.get('[data-testid="category-character"]').click();
    cy.contains('Character Template').should('be.visible');
    cy.contains('Basic character questionnaire').should('be.visible');
    cy.contains('3 questions').should('be.visible');
    cy.contains('v1.0').should('be.visible');
    cy.contains('Basic mode').should('be.visible');
  });

  it('shows template tags', () => {
    cy.mount(<TemplateManager {...defaultProps} />);
    
    cy.get('[data-testid="category-character"]').click();
    cy.contains('fantasy').should('be.visible');
    cy.contains('rpg').should('be.visible');
  });

  it('opens create template form', () => {
    cy.mount(<TemplateManager {...defaultProps} />);
    
    cy.get('[data-testid="create-template-[data-cy*="button"]"]').click();
    cy.get('[data-testid="template-editor-mock"]').should('be.visible');
  });

  it('handles template [data-cy*="select"]ion', () => {
    cy.mount(<TemplateManager {...defaultProps} />);
    
    cy.get('[data-testid="category-character"]').click();
    cy.get('[data-testid="template-template-1"]').within(() => {
      cy.get('[title="Use this template"]').click();
    });
    
    cy.get('@onSelectTemplate').should('have.been.called');
  });

  it('handles template deletion with confirmation', () => {
    cy.stub(window, 'confirm').returns(true);
    
    cy.mount(<TemplateManager {...defaultProps} />);
    
    cy.get('[data-testid="category-character"]').click();
    cy.get('[data-testid="template-template-1"]').within(() => {
      cy.get('[title="Delete template"]').click();
    });
    
    cy.wrap(null).then(() => {
      expect(window.confirm).to.have.been.calledWith('Are you sure you want to delete this template?');
      expect(mockStore.deleteTemplate).to.have.been.calledWith('proj-1', 'template-1');
    });
  });

  it('cancels deletion when user declines', () => {
    cy.stub(window, 'confirm').returns(false);
    
    cy.mount(<TemplateManager {...defaultProps} />);
    
    cy.get('[data-testid="category-character"]').click();
    cy.get('[data-testid="template-template-1"]').within(() => {
      cy.get('[title="Delete template"]').click();
    });
    
    cy.wrap(null).then(() => {
      expect(mockStore.deleteTemplate).not.to.have.been.called;
    });
  });

  it('closes modal on close [data-cy*="button"] click', () => {
    cy.mount(<TemplateManager {...defaultProps} />);
    
    cy.get('[data-testid="close-template-manager-desktop"]').click();
    cy.get('@onClose').should('have.been.called');
  });

  it('shows mobile close [data-cy*="button"] on mobile', () => {
    cy.viewport(375, 667);
    cy.mount(<TemplateManager {...defaultProps} />);
    
    cy.get('[data-testid="close-template-manager"]').should('be.visible');
    cy.get('[data-testid="close-template-manager-desktop"]').should('not.be.visible');
  });

  it('handles empty templates gracefully', () => {
    mockStore.projects[0].templates = [];
    
    cy.mount(<TemplateManager {...defaultProps} />);
    
    cy.get('[data-testid="category-character"]').click();
    cy.contains('No custom templates yet').should('be.visible');
  });

  it('shows template count per category', () => {
    cy.mount(<TemplateManager {...defaultProps} />);
    
    cy.get('[data-testid="category-character"]').contains('1');
    cy.get('[data-testid="category-location"]').contains('1');
  });
});

describe('TemplatePreview Component', () => {
  const mockTemplate: QuestionnaireTemplate = {
    id: 'template-1',
    name: 'Test Template',
    category: 'character',
    description: 'A test template for preview',
    questions: [
      {
        id: 'q1',
        text: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Enter name',
        category: 'general'
      },
      {
        id: 'q2',
        text: 'Description',
        type: 'textarea',
        required: false,
        inputSize: 'large',
        category: 'general'
      },
      {
        id: 'q3',
        text: 'Type',
        type: '[data-cy*="select"]',
        required: true,
        category: 'general',
        options: [
          { value: 'hero', label: 'Hero' },
          { value: 'villain', label: 'Villain' }
        ]
      },
      {
        id: 'q4',
        text: 'Skills',
        type: 'multi[data-cy*="select"]',
        required: false,
        category: 'abilities',
        options: [
          { value: 'magic', label: 'Magic' },
          { value: 'combat', label: 'Combat' },
          { value: 'stealth', label: 'Stealth' }
        ]
      },
      {
        id: 'q5',
        text: 'Level',
        type: 'number',
        required: false,
        category: 'stats'
      },
      {
        id: 'q6',
        text: 'Is Main Character',
        type: 'boolean',
        required: false,
        category: 'meta'
      },
      {
        id: 'q7',
        text: 'Backstory',
        type: 'textarea',
        required: false,
        dependsOn: { questionId: 'q6', value: true },
        category: 'meta'
      }
    ],
    isDefault: false,
    tags: []
  };

  const defaultProps = {
    template: mockTemplate,
    onClose: cy.stub().as('onClose')
  };

  beforeEach(() => {
    defaultProps.onClose.resetHistory();
  });

  it('renders template preview with header', () => {
    cy.mount(<TemplatePreview {...defaultProps} />);
    
    cy.contains('Template Preview: Test Template').should('be.visible');
    cy.contains('A test template for preview').should('be.visible');
  });

  it('displays question statistics', () => {
    cy.mount(<TemplatePreview {...defaultProps} />);
    
    cy.contains('7 questions').should('be.visible'); // 6 visible initially (q7 is conditional)
    cy.contains('0 answered').should('be.visible');
    cy.contains('0/2 required').should('be.visible');
  });

  it('renders text input questions', () => {
    cy.mount(<TemplatePreview {...defaultProps} />);
    
    cy.contains('Name').should('be.visible');
    cy.get('input[placeholder="Enter name"]').type('Test Character');
    cy.get('input[placeholder="Enter name"]').should('have.value', 'Test Character');
  });

  it('renders textarea questions', () => {
    cy.mount(<TemplatePreview {...defaultProps} />);
    
    cy.contains('Description').should('be.visible');
    cy.get('textarea').first().type('A detailed description');
    cy.get('textarea').first().should('have.value', 'A detailed description');
  });

  it('renders [data-cy*="select"] questions', () => {
    cy.mount(<TemplatePreview {...defaultProps} />);
    
    cy.contains('Type').should('be.visible');
    cy.get('[data-cy*="select"]').select('hero');
    cy.get('[data-cy*="select"]').should('have.value', 'hero');
  });

  it('renders multi[data-cy*="select"] questions', () => {
    cy.mount(<TemplatePreview {...defaultProps} />);
    
    cy.contains('Skills').should('be.visible');
    cy.contains('Magic').parent().find('input[type="checkbox"]').check();
    cy.contains('Combat').parent().find('input[type="checkbox"]').check();
    
    cy.contains('Magic').parent().find('input[type="checkbox"]').should('be.checked');
    cy.contains('Combat').parent().find('input[type="checkbox"]').should('be.checked');
  });

  it('renders number input questions', () => {
    cy.mount(<TemplatePreview {...defaultProps} />);
    
    cy.contains('Level').should('be.visible');
    cy.get('input[type="number"]').type('10');
    cy.get('input[type="number"]').should('have.value', '10');
  });

  it('renders boolean questions', () => {
    cy.mount(<TemplatePreview {...defaultProps} />);
    
    cy.contains('Is Main Character').should('be.visible');
    cy.contains('No').click();
    cy.contains('Yes').should('be.visible');
  });

  it('handles conditional questions', () => {
    cy.mount(<TemplatePreview {...defaultProps} />);
    
    // TODO: * Backstory should not be visible initially
    cy.contains('Backstory').should('not.exist');
    
    // * Toggle boolean to true
    cy.contains('Is Main Character').parent().find('[data-cy*="button"]').click();
    
    // TODO: * Backstory should now be visible
    cy.contains('Backstory').should('be.visible');
  });

  it('updates completion percentage', () => {
    cy.mount(<TemplatePreview {...defaultProps} />);
    
    cy.contains('0% complete').should('be.visible');
    
    // * Answer some questions
    cy.get('input[placeholder="Enter name"]').type('Test');
    cy.get('[data-cy*="select"]').select('hero');
    
    // * Check updated percentage
    cy.contains('29% complete').should('be.visible'); // 2 out of 7 questions
  });

  it('tracks required questions', () => {
    cy.mount(<TemplatePreview {...defaultProps} />);
    
    cy.contains('0/2 required').should('be.visible');
    
    // * Answer required questions
    cy.get('input[placeholder="Enter name"]').type('Test');
    cy.contains('1/2 required').should('be.visible');
    
    cy.get('[data-cy*="select"]').select('hero');
    cy.contains('2/2 required').should('be.visible');
  });

  it('groups questions by category', () => {
    cy.mount(<TemplatePreview {...defaultProps} />);
    
    cy.contains('h3', 'general').should('be.visible');
    cy.contains('h3', 'abilities').should('be.visible');
    cy.contains('h3', 'stats').should('be.visible');
  });

  it('shows required field indicators', () => {
    cy.mount(<TemplatePreview {...defaultProps} />);
    
    cy.contains('Name').parent().contains('*').should('be.visible');
    cy.contains('Type').parent().contains('*').should('be.visible');
  });

  it('closes preview on close [data-cy*="button"] click', () => {
    cy.mount(<TemplatePreview {...defaultProps} />);
    
    cy.get('[data-cy*="button"]').contains('svg').parent().click(); // X [data-cy*="button"]
    cy.get('@onClose').should('have.been.called');
  });

  it('displays help text when present', () => {
    const templateWithHelp = {
      ...mockTemplate,
      questions: [
        {
          ...mockTemplate.questions[0],
          helpText: 'Enter the character\'s full name'
        }
      ]
    };
    
    cy.mount(<TemplatePreview template={templateWithHelp} onClose={defaultProps.onClose} />);
    
    cy.contains('Enter the character\'s full name').should('be.visible');
  });

  it('shows footer disclaimer', () => {
    cy.mount(<TemplatePreview {...defaultProps} />);
    
    cy.contains('This is a preview').should('be.visible');
    cy.contains('Your test answers will not be saved').should('be.visible');
  });
});

describe('TemplateSearch Component', () => {
  const defaultProps = {
    onSearchChange: cy.stub().as('onSearchChange'),
    onFiltersChange: cy.stub().as('onFiltersChange')
  };

  beforeEach(() => {
    defaultProps.onSearchChange.resetHistory();
    defaultProps.onFiltersChange.resetHistory();
  });

  it('renders search input', () => {
    cy.mount(<TemplateSearch {...defaultProps} />);
    
    cy.get('input[placeholder*="Search"]').should('be.visible');
  });

  it('handles search input changes', () => {
    cy.mount(<TemplateSearch {...defaultProps} />);
    
    cy.get('input[placeholder*="Search"]').type('character');
    
    cy.get('@onSearchChange').should('have.been.calledWith', 'character');
  });

  it('shows filter [data-cy*="button"]', () => {
    cy.mount(<TemplateSearch {...defaultProps} />);
    
    cy.get('[data-cy*="button"]').contains('Filter').should('be.visible');
  });

  it('toggles filter dropdown', () => {
    cy.mount(<TemplateSearch {...defaultProps} />);
    
    cy.get('[data-cy*="button"]').contains('Filter').click();
    cy.contains('Basic Mode Support').should('be.visible');
    
    cy.get('[data-cy*="button"]').contains('Filter').click();
    cy.contains('Basic Mode Support').should('not.exist');
  });

  it('handles basic mode filter', () => {
    cy.mount(<TemplateSearch {...defaultProps} />);
    
    cy.get('[data-cy*="button"]').contains('Filter').click();
    cy.get('input[type="checkbox"]').first().check();
    
    cy.get('@onFiltersChange').should('have.been.calledWith', 
      Cypress.sinon.match({ hasBasicMode: true })
    );
  });

  it('handles question count filters', () => {
    cy.mount(<TemplateSearch {...defaultProps} />);
    
    cy.get('[data-cy*="button"]').contains('Filter').click();
    cy.get('input[type="number"]').first().type('5');
    cy.get('input[type="number"]').last().type('20');
    
    cy.get('@onFiltersChange').should('have.been.calledWith',
      Cypress.sinon.match({ minQuestions: 5, maxQuestions: 20 })
    );
  });

  it('handles date range filter', () => {
    cy.mount(<TemplateSearch {...defaultProps} />);
    
    cy.get('[data-cy*="button"]').contains('Filter').click();
    cy.get('[data-cy*="select"]').select('week');
    
    cy.get('@onFiltersChange').should('have.been.calledWith',
      Cypress.sinon.match({ dateRange: 'week' })
    );
  });

  it('clears filters', () => {
    cy.mount(<TemplateSearch {...defaultProps} />);
    
    cy.get('[data-cy*="button"]').contains('Filter').click();
    cy.get('input[type="checkbox"]').first().check();
    cy.contains('Clear').click();
    
    cy.get('@onFiltersChange').should('have.been.calledWith', {});
  });

  it('shows active filter count', () => {
    cy.mount(<TemplateSearch {...defaultProps} />);
    
    cy.get('[data-cy*="button"]').contains('Filter').click();
    cy.get('input[type="checkbox"]').first().check();
    cy.get('[data-cy*="select"]').select('week');
    
    cy.contains('2').should('be.visible'); // Badge showing 2 active filters
  });
});

describe('TemplateImporter Component', () => {
  const defaultProps = {
    projectId: 'proj-1',
    onClose: cy.stub().as('onClose'),
    onSuccess: cy.stub().as('onSuccess')
  };

  beforeEach(() => {
    defaultProps.onClose.resetHistory();
    defaultProps.onSuccess.resetHistory();
    mockStore.importTemplates.resetHistory();
  });

  it('renders import modal', () => {
    cy.mount(<TemplateImporter {...defaultProps} />);
    
    cy.contains('Import Templates').should('be.visible');
    cy.contains('Select a JSON file').should('be.visible');
  });

  it('handles file [data-cy*="select"]ion', () => {
    cy.mount(<TemplateImporter {...defaultProps} />);
    
    const file = new File(['{"templates": []}'], 'templates.json', { type: 'application/json' });
    cy.get('input[type="file"]').selectFile(file, { force: true });
    
    cy.contains('templates.json').should('be.visible');
  });

  it('validates file type', () => {
    cy.mount(<TemplateImporter {...defaultProps} />);
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    cy.get('input[type="file"]').selectFile(file, { force: true });
    
    cy.contains('Please [data-cy*="select"] a JSON file').should('be.visible');
  });

  it('parses and displays template preview', () => {
    cy.mount(<TemplateImporter {...defaultProps} />);
    
    const templateData = {
      templates: [
        { name: 'Template 1', category: 'character', questions: [] },
        { name: 'Template 2', category: 'location', questions: [] }
      ]
    };
    const file = new File([JSON.stringify(templateData)], 'templates.json', { type: 'application/json' });
    
    cy.get('input[type="file"]').selectFile(file, { force: true });
    
    cy.contains('2 templates found').should('be.visible');
    cy.contains('Template 1').should('be.visible');
    cy.contains('Template 2').should('be.visible');
  });

  it('imports templates successfully', () => {
    cy.mount(<TemplateImporter {...defaultProps} />);
    
    const templateData = { templates: [{ name: 'Test', category: 'character', questions: [] }] };
    const file = new File([JSON.stringify(templateData)], 'templates.json', { type: 'application/json' });
    
    cy.get('input[type="file"]').selectFile(file, { force: true });
    cy.contains('Import Templates').click();
    
    cy.wrap(null).then(() => {
      expect(mockStore.importTemplates).to.have.been.calledWith('proj-1');
      expect(defaultProps.onSuccess).to.have.been.called;
    });
  });

  it('handles import errors', () => {
    mockStore.importTemplates.rejects(new Error('Import failed'));
    
    cy.mount(<TemplateImporter {...defaultProps} />);
    
    const templateData = { templates: [] };
    const file = new File([JSON.stringify(templateData)], 'templates.json', { type: 'application/json' });
    
    cy.get('input[type="file"]').selectFile(file, { force: true });
    cy.contains('Import Templates').click();
    
    cy.contains('Failed to import templates').should('be.visible');
  });

  it('closes modal on cancel', () => {
    cy.mount(<TemplateImporter {...defaultProps} />);
    
    cy.contains('Cancel').click();
    cy.get('@onClose').should('have.been.called');
  });

  it('handles drag and drop', () => {
    cy.mount(<TemplateImporter {...defaultProps} />);
    
    const file = new File(['{"templates": []}'], 'templates.json', { type: 'application/json' });
    
    cy.get('[data-testid="drop-zone"]').trigger('dragenter');
    cy.get('[data-testid="drop-zone"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    
    cy.get('[data-testid="drop-zone"]').trigger('drop', {
      dataTransfer: { files: [file] }
    });
    
    cy.contains('templates.json').should('be.visible');
  });
});

describe('TemplateMarketplace Component', () => {
  const defaultProps = {
    projectId: 'proj-1',
    onClose: cy.stub().as('onClose')
  };

  beforeEach(() => {
    defaultProps.onClose.resetHistory();
  });

  it('renders marketplace modal', () => {
    cy.mount(<TemplateMarketplace {...defaultProps} />);
    
    cy.contains('Template Marketplace').should('be.visible');
    cy.contains('Browse community templates').should('be.visible');
  });

  it('displays featured templates', () => {
    cy.mount(<TemplateMarketplace {...defaultProps} />);
    
    cy.contains('Featured Templates').should('be.visible');
    cy.get('[data-testid="featured-template"]').should('have.length.at.least', 1);
  });

  it('shows template categories', () => {
    cy.mount(<TemplateMarketplace {...defaultProps} />);
    
    cy.contains('Character Templates').should('be.visible');
    cy.contains('Location Templates').should('be.visible');
    cy.contains('Magic System Templates').should('be.visible');
  });

  it('handles template search', () => {
    cy.mount(<TemplateMarketplace {...defaultProps} />);
    
    cy.get('input[placeholder*="Search marketplace"]').type('fantasy');
    cy.contains('Searching for "fantasy"').should('be.visible');
  });

  it('filters by category', () => {
    cy.mount(<TemplateMarketplace {...defaultProps} />);
    
    cy.get('[data-testid="category-filter"]').select('character');
    cy.contains('Character Templates').should('be.visible');
  });

  it('sorts templates', () => {
    cy.mount(<TemplateMarketplace {...defaultProps} />);
    
    cy.get('[data-testid="sort-[data-cy*="select"]"]').select('downloads');
    cy.contains('Most Downloaded').should('be.visible');
  });

  it('shows template details on hover', () => {
    cy.mount(<TemplateMarketplace {...defaultProps} />);
    
    cy.get('[data-testid="marketplace-template"]').first().trigger('mouseenter');
    cy.contains('Preview').should('be.visible');
    cy.contains('Install').should('be.visible');
  });

  it('installs template', () => {
    cy.mount(<TemplateMarketplace {...defaultProps} />);
    
    cy.get('[data-testid="install-template"]').first().click();
    cy.contains('Installing...').should('be.visible');
    
    // * Simulate successful install
    cy.contains('Installed').should('be.visible');
  });

  it('shows template rating', () => {
    cy.mount(<TemplateMarketplace {...defaultProps} />);
    
    cy.get('[data-testid="template-rating"]').should('be.visible');
    cy.get('.star-icon').should('have.length', 5);
  });

  it('displays download count', () => {
    cy.mount(<TemplateMarketplace {...defaultProps} />);
    
    cy.contains('downloads').should('be.visible');
  });

  it('shows author information', () => {
    cy.mount(<TemplateMarketplace {...defaultProps} />);
    
    cy.contains('by').should('be.visible');
    cy.get('[data-testid="author-name"]').should('be.visible');
  });

  it('handles pagination', () => {
    cy.mount(<TemplateMarketplace {...defaultProps} />);
    
    cy.get('[data-testid="next-page"]').click();
    cy.contains('Page 2').should('be.visible');
    
    cy.get('[data-testid="prev-page"]').click();
    cy.contains('Page 1').should('be.visible');
  });

  it('closes marketplace modal', () => {
    cy.mount(<TemplateMarketplace {...defaultProps} />);
    
    cy.get('[data-testid="close-marketplace"]').click();
    cy.get('@onClose').should('have.been.called');
  });

  it('shows loading state', () => {
    cy.mount(<TemplateMarketplace {...defaultProps} />);
    
    // ? * Trigger a search to show loading
    cy.get('input[placeholder*="Search marketplace"]').type('test');
    cy.get('.animate-spin').should('be.visible');
  });

  it('handles network errors gracefully', () => {
    // * Simulate network error
    cy.intercept('GET', '/api/marketplace/templates', { statusCode: 500 });
    
    cy.mount(<TemplateMarketplace {...defaultProps} />);
    
    cy.contains('Failed to load templates').should('be.visible');
    cy.contains('Retry').should('be.visible');
  });
});