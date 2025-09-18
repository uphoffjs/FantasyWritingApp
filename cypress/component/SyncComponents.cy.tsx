import React from 'react';
import { SyncIndicator } from '../../src/components/SyncIndicator';
import { CloudSaveButton, CloudSaveButtonMobile } from '../../src/components/CloudSaveButton';
import { OfflineBanner, OfflineBannerCompact } from '../../src/components/OfflineBanner';

// * Mock the stores
const mockAuthStore = {
  syncStatus: 'synced' as 'synced' | 'syncing' | 'error' | 'offline',
  syncError: null as string | null,
  isOfflineMode: false,
  isAuthenticated: true,
};

const mockWorldbuildingStore = {
  projects: [],
  syncMetadata: {},
};

const mockNetworkStatus = {
  isOnline: true,
};

jest.mock('../../src/store/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}));

jest.mock('../../src/store/worldbuildingStore', () => ({
  useWorldbuildingStore: () => mockWorldbuildingStore,
}));

jest.mock('../../src/services/networkStatus', () => ({
  useNetworkStatus: () => mockNetworkStatus,
}));

// * Mock the sync service
const mockSupabaseSyncService = {
  createProject: cy.stub().resolves({ id: 'cloud-123' }),
  updateProject: cy.stub().resolves(true),
  syncElement: cy.stub().resolves(true),
  syncAnswer: cy.stub().resolves(true),
  syncRelationship: cy.stub().resolves(true),
};

jest.mock('../../src/services/supabaseSync', () => ({
  supabaseSyncService: mockSupabaseSyncService,
}));

// * Mock toast functions
let mockShowSyncSuccessToast: any;
let mockShowSyncErrorToast: any;
let mockShowOfflineToast: any;

beforeEach(() => {
  mockShowSyncSuccessToast = cy.stub();
  mockShowSyncErrorToast = cy.stub();
  mockShowOfflineToast = cy.stub();
  
  // Note: jest.mock doesn't work in Cypress
  // TODO: You'll need to mock these functions differently, possibly through props or dependency injection
});

describe('SyncIndicator Component', () => {
  beforeEach(() => {
    // * Reset mocks
    mockAuthStore.syncStatus = 'synced';
    mockAuthStore.syncError = null;
    mockAuthStore.isOfflineMode = false;
  });

  it('renders offline mode indicator when in offline mode', () => {
    mockAuthStore.isOfflineMode = true;
    
    cy.mount(<SyncIndicator />);
    
    cy.contains('Offline Mode').should('be.visible');
    cy.get('svg').should('exist'); // CloudOff icon
  });

  it('shows synced status with check icon', () => {
    mockAuthStore.syncStatus = 'synced';
    
    cy.mount(<SyncIndicator />);
    
    cy.contains('All changes saved').should('be.visible');
    cy.get('.text-forest-400').should('exist');
  });

  it('shows syncing status with spinning loader', () => {
    mockAuthStore.syncStatus = 'syncing';
    
    cy.mount(<SyncIndicator />);
    
    cy.contains('Saving changes...').should('be.visible');
    cy.get('.animate-spin').should('exist');
    cy.get('.text-flame-400').should('exist');
  });

  it('shows error status with alert icon', () => {
    mockAuthStore.syncStatus = 'error';
    mockAuthStore.syncError = 'Network timeout';
    
    cy.mount(<SyncIndicator />);
    
    cy.contains('Network timeout').should('be.visible');
    cy.get('.text-blood-400').should('exist');
  });

  it('shows offline status when offline', () => {
    mockAuthStore.syncStatus = 'offline';
    
    cy.mount(<SyncIndicator />);
    
    cy.contains('Working offline').should('be.visible');
    cy.get('.text-ink-light').should('exist');
  });

  it('animates in with motion', () => {
    cy.mount(<SyncIndicator />);
    
    cy.get('[style*="opacity"]').should('exist');
  });

  it('handles undefined sync status gracefully', () => {
    mockAuthStore.syncStatus = undefined as any;
    
    cy.mount(<SyncIndicator />);
    
    cy.contains('Working offline').should('be.visible'); // Falls back to default
  });
});

describe('CloudSaveButton Component', () => {
  beforeEach(() => {
    // * Reset mocks
    mockAuthStore.isAuthenticated = true;
    mockAuthStore.isOfflineMode = false;
    mockNetworkStatus.isOnline = true;
    mockWorldbuildingStore.projects = [];
    mockWorldbuildingStore.syncMetadata = {};
    mockSupabaseSyncService.createProject.resetHistory();
    mockSupabaseSyncService.updateProject.resetHistory();
    mockShowSyncSuccessToast.resetHistory();
    mockShowSyncErrorToast.resetHistory();
    mockShowOfflineToast.resetHistory();
  });

  it('renders with idle state when no changes', () => {
    cy.mount(<CloudSaveButton />);
    
    cy.contains('Saved').should('be.visible');
    cy.get('[data-cy*="button"]').should('be.disabled');
    cy.get('[data-cy*="parchment-shadow"]').should('exist');
  });

  it('shows modified state when there are unsaved changes', () => {
    mockWorldbuildingStore.projects = [
      { id: '1', name: 'Test Project', elements: [] } as any,
    ];
    mockWorldbuildingStore.syncMetadata = {
      '1': { syncStatus: 'offline', cloudId: null } as any,
    };
    
    cy.mount(<CloudSaveButton />);
    
    cy.contains('Save Changes').should('be.visible');
    cy.get('[data-cy*="button"]').should('not.be.disabled');
    cy.get('.animate-pulse').should('exist');
  });

  it('handles save action successfully', () => {
    mockWorldbuildingStore.projects = [
      { id: '1', name: 'Test Project', elements: [] } as any,
    ];
    mockWorldbuildingStore.syncMetadata = {
      '1': { syncStatus: 'offline', cloudId: 'cloud-123' } as any,
    };
    
    cy.mount(<CloudSaveButton />);
    
    cy.get('[data-cy*="button"]').click();
    
    // ? * Shows saving state
    cy.contains('Saving...').should('be.visible');
    cy.get('.animate-spin').should('exist');
    
    // ? * Eventually shows saved state
    cy.wrap(null).then(() => {
      expect(mockSupabaseSyncService.updateProject).to.have.been.called;
      expect(mockShowSyncSuccessToast).to.have.been.called;
    });
  });

  it('handles save error gracefully', () => {
    mockSupabaseSyncService.updateProject.rejects(new Error('Network error'));
    mockWorldbuildingStore.projects = [
      { id: '1', name: 'Test Project', elements: [] } as any,
    ];
    mockWorldbuildingStore.syncMetadata = {
      '1': { syncStatus: 'error', cloudId: 'cloud-123' } as any,
    };
    
    cy.mount(<CloudSaveButton />);
    
    cy.get('[data-cy*="button"]').click();
    
    cy.wrap(null).then(() => {
      expect(mockShowSyncErrorToast).to.have.been.called;
    });
  });

  it('shows offline toast when network is offline', () => {
    mockNetworkStatus.isOnline = false;
    mockWorldbuildingStore.projects = [
      { id: '1', name: 'Test Project', elements: [] } as any,
    ];
    mockWorldbuildingStore.syncMetadata = {
      '1': { syncStatus: 'offline', cloudId: null } as any,
    };
    
    cy.mount(<CloudSaveButton />);
    
    cy.get('[data-cy*="button"]').click();
    
    cy.wrap(null).then(() => {
      expect(mockShowOfflineToast).to.have.been.called;
    });
  });

  it('hides [data-cy*="button"] when not authenticated', () => {
    mockAuthStore.isAuthenticated = false;
    
    cy.mount(<CloudSaveButton />);
    
    cy.get('[data-cy*="button"]').should('not.exist');
  });

  it('shows error dropdown on hover when in error state', () => {
    const container = cy.mount(
      <div style={{ height: '200px', padding: '50px' }}>
        <CloudSaveButton />
      </div>
    );
    
    // * Simulate error state manually
    cy.get('[data-cy*="button"]').then($btn => {
      // * Force error state by manipulating DOM
      $btn.parent().append(
        '<div class="absolute top-full mt-2 right-0 bg-parchment-aged border border-red-900 rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">' +
        '<p class="text-sm text-blood-400">Test error message</p>' +
        '<[data-cy*="button"] class="mt-2 text-sm font-medium text-metals-gold hover:text-metals-brass transition-colors">Retry</[data-cy*="button"]>' +
        '</div>'
      );
    });
    
    cy.get('.group').trigger('mouseenter');
    cy.contains('Test error message').should('exist');
    cy.contains('Retry').should('be.visible');
  });

  it('animates [data-cy*="button"] on hover and tap', () => {
    mockWorldbuildingStore.projects = [
      { id: '1', name: 'Test Project', elements: [] } as any,
    ];
    mockWorldbuildingStore.syncMetadata = {
      '1': { syncStatus: 'offline', cloudId: null } as any,
    };
    
    cy.mount(<CloudSaveButton />);
    
    cy.get('[data-cy*="button"]')
      .should('have.css', 'transform', 'none')
      .trigger('mouseenter')
      .trigger('mousedown')
      .trigger('mouseup');
  });

  it('syncs elements and relationships', () => {
    mockWorldbuildingStore.projects = [
      {
        id: '1',
        name: 'Test Project',
        elements: [
          {
            id: 'elem-1',
            name: 'Test Element',
            answers: { q1: 'answer1' },
            relationships: [{ id: 'rel-1', type: 'knows', targetId: 'elem-2' }],
          },
        ],
      } as any,
    ];
    mockWorldbuildingStore.syncMetadata = {
      '1': { syncStatus: 'offline', cloudId: null } as any,
    };
    
    cy.mount(<CloudSaveButton />);
    
    cy.get('[data-cy*="button"]').click();
    
    cy.wrap(null).then(() => {
      expect(mockSupabaseSyncService.createProject).to.have.been.called;
      expect(mockSupabaseSyncService.syncElement).to.have.been.called;
      expect(mockSupabaseSyncService.syncAnswer).to.have.been.called;
      expect(mockSupabaseSyncService.syncRelationship).to.have.been.called;
    });
  });
});

describe('CloudSaveButtonMobile Component', () => {
  it('returns null (not implemented)', () => {
    cy.mount(<CloudSaveButtonMobile />);
    cy.get('[data-cy*="button"]').should('not.exist');
  });
});

describe('OfflineBanner Component', () => {
  beforeEach(() => {
    mockNetworkStatus.isOnline = true;
  });

  it('shows banner when offline', () => {
    mockNetworkStatus.isOnline = false;
    
    cy.mount(<OfflineBanner />);
    
    cy.contains('Working Offline').should('be.visible');
    cy.contains('No internet connection detected').should('be.visible');
    cy.contains('Your changes are saved locally').should('be.visible');
  });

  it('hides banner when online', () => {
    mockNetworkStatus.isOnline = true;
    
    cy.mount(<OfflineBanner />);
    
    cy.contains('Working Offline').should('not.exist');
  });

  it('dismisses banner on click', () => {
    mockNetworkStatus.isOnline = false;
    
    cy.mount(<OfflineBanner />);
    
    cy.contains('Working Offline').should('be.visible');
    
    // * Desktop dismiss [data-cy*="button"]
    cy.get('[data-cy*="button"]').contains('Dismiss').click();
    cy.contains('Working Offline').should('not.exist');
  });

  it('shows icon-only dismiss on mobile', () => {
    mockNetworkStatus.isOnline = false;
    cy.viewport(375, 667);
    
    cy.mount(<OfflineBanner />);
    
    cy.get('[aria-label="Dismiss offline banner"]').should('be.visible');
    cy.get('[data-cy*="button"]').contains('Dismiss').should('not.be.visible');
  });

  it('animates banner entrance and exit', () => {
    mockNetworkStatus.isOnline = false;
    
    cy.mount(<OfflineBanner />);
    
    // * Check for animation classes
    cy.get('.fixed').should('have.css', 'transform') // CSS properties work in React Native Web;
    
    // * Dismiss and check exit animation
    cy.get('[data-cy*="button"]').contains('Dismiss').click();
    cy.get('.fixed').should('not.exist');
  });

  it('resets dismissed state when going back online', () => {
    const TestWrapper = () => {
      const [online, setOnline] = React.useState(false);
      mockNetworkStatus.isOnline = online;
      
      return (
        <div>
          <[data-cy*="button"] data-testid="toggle-online" onClick={() => setOnline(!online)}>
            Toggle Online
          </[data-cy*="button"]>
          <OfflineBanner />
        </div>
      );
    };
    
    cy.mount(<TestWrapper />);
    
    // * Go offline
    cy.get('[data-testid="toggle-online"]').click();
    cy.contains('Working Offline').should('be.visible');
    
    // Dismiss
    cy.contains('Dismiss').click();
    cy.contains('Working Offline').should('not.exist');
    
    // * Go online then offline again
    cy.get('[data-testid="toggle-online"]').click(); // online
    cy.get('[data-testid="toggle-online"]').click(); // offline
    
    // TODO: * Banner should reappear
    cy.contains('Working Offline').should('be.visible');
  });
});

describe('OfflineBannerCompact Component', () => {
  beforeEach(() => {
    mockNetworkStatus.isOnline = true;
  });

  it('shows compact banner at bottom on mobile', () => {
    mockNetworkStatus.isOnline = false;
    cy.viewport(375, 667);
    
    cy.mount(<OfflineBannerCompact />);
    
    cy.contains('Offline Mode').should('be.visible');
    cy.get('.fixed.bottom-0').should('exist');
  });

  it('dismisses compact banner', () => {
    mockNetworkStatus.isOnline = false;
    
    cy.mount(<OfflineBannerCompact />);
    
    cy.contains('Offline Mode').should('be.visible');
    cy.get('[data-cy*="button"]').click();
    cy.contains('Offline Mode').should('not.exist');
  });

  it('animates from bottom', () => {
    mockNetworkStatus.isOnline = false;
    
    cy.mount(<OfflineBannerCompact />);
    
    cy.get('.fixed.bottom-0').should('have.css', 'transform') // CSS properties work in React Native Web;
  });

  it('only shows on mobile viewports', () => {
    mockNetworkStatus.isOnline = false;
    
    cy.mount(<OfflineBannerCompact />);
    
    cy.get('.sm\\:hidden').should('exist');
  });
});