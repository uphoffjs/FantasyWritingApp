import React from 'react';
import { VirtualizedProjectList } from '../../../src/components/VirtualizedProjectList';
import { VirtualizedQuestionList } from '../../../src/components/VirtualizedQuestionList';
import { InfiniteScrollList } from '../../support/component-test-helpersInfiniteScrollList';
import { Project } from '../../../src/types/models';

// * Mock react-window for all tests
const mockFixedSizeGrid = ({ children, itemData, rowCount, columnCount }: any) => {
  const cells = [];
  for (let row = 0; row < Math.min(rowCount, 3); row++) {
    for (let col = 0; col < columnCount; col++) {
      cells.push(
        <div key={`${row}-${col}`}>
          {children({ rowIndex: row, columnIndex: col, style: {}, data: itemData })}
        </div>
      );
    }
  }
  return <div className="scrollbar-thin scrollbar-thumb-parchment-dark">{cells}</div>;
};

jest.mock('react-window', () => ({
  FixedSizeGrid: mockFixedSizeGrid,
  FixedSizeList: ({ children, itemData, itemCount }: any) => {
    const items = [];
    for (let i = 0; i < Math.min(itemCount, 10); i++) {
      items.push(
        <div key={i}>
          {children({ index: i, style: {}, data: itemData })}
        </div>
      );
    }
    return <div className="scrollbar-thin">{items}</div>;
  }
}));

// Mock ProjectCard
jest.mock('../../src/components/ProjectCard', () => ({
  ProjectCard: ({ project, onDelete, isDeleting }: any) => (
    <div 
      data-testid="project-card"
      data-project-id={project.id}
      onClick={() => onDelete(project.id)}
    >
      <div data-testid="project-name">{project.name}</div>
      {isDeleting && <div data-testid="deleting">Deleting...</div>}
    </div>
  )
}));

describe('VirtualizedProjectList Component', () => {
  const mockProject = (id: string): Project => ({
    id,
    name: `Project ${id}`,
    description: 'Test project',
    genre: 'fantasy',
    elements: [],
    templates: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const onDeleteSpy = cy.stub().as('onDelete');

  beforeEach(() => {
    onDeleteSpy.reset();
    onDeleteSpy.resolves();
  });

  it('renders projects in virtualized grid', () => {
    const projects = Array.from({ length: 6 }, (_, i) => mockProject(`${i + 1}`));
    
    cy.mount(
      <VirtualizedProjectList
        projects={projects}
        onDeleteProject={onDeleteSpy}
        deletingProjectId={null}
      />
    );
    
    cy.get('[data-testid="project-card"]').should('exist');
    cy.get('[data-testid="project-name"]').first().should('contain', 'Project 1');
  });

  it('handles empty projects array', () => {
    cy.mount(
      <VirtualizedProjectList
        projects={[]}
        onDeleteProject={onDeleteSpy}
        deletingProjectId={null}
      />
    );
    
    // TODO: * Should return null for empty array
    cy.get('[data-testid="project-card"]').should('not.exist');
  });

  it('shows deleting state for specific project', () => {
    const projects = [mockProject('1'), mockProject('2')];
    
    cy.mount(
      <VirtualizedProjectList
        projects={projects}
        onDeleteProject={onDeleteSpy}
        deletingProjectId="1"
      />
    );
    
    cy.get('[data-project-id="1"]').find('[data-testid="deleting"]').should('exist');
    cy.get('[data-project-id="2"]').find('[data-testid="deleting"]').should('not.exist');
  });

  it('calls onDeleteProject when project is deleted', () => {
    const projects = [mockProject('1')];
    
    cy.mount(
      <VirtualizedProjectList
        projects={projects}
        onDeleteProject={onDeleteSpy}
        deletingProjectId={null}
      />
    );
    
    cy.get('[data-testid="project-card"]').first().click();
    cy.get('@onDelete').should('have.been.calledWith', '1');
  });

  it('adjusts columns based on viewport width', () => {
    const projects = Array.from({ length: 9 }, (_, i) => mockProject(`${i + 1}`));
    
    // * Test mobile viewport (1 column)
    cy.viewport(375, 667);
    cy.mount(
      <VirtualizedProjectList
        projects={projects}
        onDeleteProject={onDeleteSpy}
        deletingProjectId={null}
      />
    );
    cy.get('[data-testid="project-card"]').should('exist');
    
    // * Test tablet viewport (2 columns)
    cy.viewport(768, 1024);
    cy.mount(
      <VirtualizedProjectList
        projects={projects}
        onDeleteProject={onDeleteSpy}
        deletingProjectId={null}
      />
    );
    cy.get('[data-testid="project-card"]').should('exist');
    
    // * Test desktop viewport (3 columns)
    cy.viewport(1920, 1080);
    cy.mount(
      <VirtualizedProjectList
        projects={projects}
        onDeleteProject={onDeleteSpy}
        deletingProjectId={null}
      />
    );
    cy.get('[data-testid="project-card"]').should('exist');
  });
});

describe('InfiniteScrollList Component', () => {
  // * Mock intersection observer
  beforeEach(() => {
    cy.window().then((win) => {
      const mockIntersectionObserver = cy.stub();
      mockIntersectionObserver.returns({
        observe: cy.stub(),
        unobserve: cy.stub(),
        disconnect: cy.stub()
      });
      (win as any).IntersectionObserver = mockIntersectionObserver;
    });
  });

  const renderItem = (item: any, index: number) => (
    <div data-testid="list-item" key={index}>{item}</div>
  );

  it('renders initial items', () => {
    const items = Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`);
    const loadMore = cy.stub();
    
    cy.mount(
      <InfiniteScrollList
        items={items}
        renderItem={renderItem}
        loadMore={loadMore}
        hasMore={true}
        loading={false}
      />
    );
    
    cy.get('[data-testid="list-item"]').should('have.length', 10);
    cy.get('[data-testid="list-item"]').first().should('contain', 'Item 1');
  });

  it('shows loading indicator when loading', () => {
    const items = Array.from({ length: 5 }, (_, i) => `Item ${i + 1}`);
    const loadMore = cy.stub();
    
    cy.mount(
      <InfiniteScrollList
        items={items}
        renderItem={renderItem}
        loadMore={loadMore}
        hasMore={true}
        loading={true}
      />
    );
    
    cy.get('[data-testid="loading-spinner"]').should('exist');
  });

  it('shows no more items message when hasMore is false', () => {
    const items = Array.from({ length: 5 }, (_, i) => `Item ${i + 1}`);
    const loadMore = cy.stub();
    
    cy.mount(
      <InfiniteScrollList
        items={items}
        renderItem={renderItem}
        loadMore={loadMore}
        hasMore={false}
        loading={false}
      />
    );
    
    cy.contains('No more items').should('be.visible');
  });

  it('handles empty items array', () => {
    const loadMore = cy.stub();
    
    cy.mount(
      <InfiniteScrollList
        items={[]}
        renderItem={renderItem}
        loadMore={loadMore}
        hasMore={false}
        loading={false}
        emptyMessage="No items found"
      />
    );
    
    cy.contains('No items found').should('be.visible');
  });

  it('applies custom className', () => {
    const items = ['Item 1'];
    const loadMore = cy.stub();
    
    cy.mount(
      <InfiniteScrollList
        items={items}
        renderItem={renderItem}
        loadMore={loadMore}
        hasMore={false}
        loading={false}
        className="custom-class"
      />
    );
    
    cy.get('.custom-class').should('exist');
  });

  it('handles error state', () => {
    const items = ['Item 1'];
    const loadMore = cy.stub();
    
    cy.mount(
      <InfiniteScrollList
        items={items}
        renderItem={renderItem}
        loadMore={loadMore}
        hasMore={true}
        loading={false}
        error="Failed to load items"
      />
    );
    
    cy.contains('Failed to load items').should('be.visible');
    cy.get('[data-testid="retry-[data-cy*="button"]"]').should('exist');
  });

  it('calls loadMore on retry [data-cy*="button"] click', () => {
    const items = ['Item 1'];
    const loadMore = cy.stub().as('loadMore');
    
    cy.mount(
      <InfiniteScrollList
        items={items}
        renderItem={renderItem}
        loadMore={loadMore}
        hasMore={true}
        loading={false}
        error="Failed to load"
      />
    );
    
    cy.get('[data-testid="retry-[data-cy*="button"]"]').click();
    cy.get('@loadMore').should('have.been.called');
  });
});

// * Simplified tests for VirtualizedQuestionList since it follows similar patterns
describe('VirtualizedQuestionList Component', () => {
  const mockQuestion = (id: string) => ({
    id,
    text: `Question ${id}`,
    type: 'text' as const,
    category: 'general',
    required: false
  });

  const renderQuestion = cy.stub().returns(<div data-testid="question">Question</div>);
  const onReorder = cy.stub();

  it('renders questions in virtualized list', () => {
    const questions = Array.from({ length: 10 }, (_, i) => mockQuestion(`${i + 1}`));
    
    cy.mount(
      <VirtualizedQuestionList
        questions={questions}
        renderItem={renderQuestion}
        onReorder={onReorder}
        height={400}
      />
    );
    
    cy.get('[data-testid="question"]').should('exist');
  });

  it('handles empty questions array', () => {
    cy.mount(
      <VirtualizedQuestionList
        questions={[]}
        renderItem={renderQuestion}
        onReorder={onReorder}
      />
    );
    
    cy.contains('No questions').should('be.visible');
  });

  it('supports drag and drop reordering', () => {
    const questions = Array.from({ length: 5 }, (_, i) => mockQuestion(`${i + 1}`));
    
    cy.mount(
      <VirtualizedQuestionList
        questions={questions}
        renderItem={renderQuestion}
        onReorder={onReorder}
        enableReorder={true}
      />
    );
    
    // TODO: * Drag handles should be visible
    cy.get('[data-testid="drag-handle"]').should('exist');
  });

  it('disables reordering when enableReorder is false', () => {
    const questions = Array.from({ length: 5 }, (_, i) => mockQuestion(`${i + 1}`));
    
    cy.mount(
      <VirtualizedQuestionList
        questions={questions}
        renderItem={renderQuestion}
        onReorder={onReorder}
        enableReorder={false}
      />
    );
    
    // TODO: * Drag handles should not be visible
    cy.get('[data-testid="drag-handle"]').should('not.exist');
  });
});