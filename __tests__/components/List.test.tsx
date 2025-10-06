/**
 * * List Component Tests (Jest + React Native Testing Library)
 * * Tests FlatList, SectionList functionality including empty states, loading, refresh
 * ! Critical: Tests list rendering, performance, and user interactions
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// Test files require 'any' type for mock flexibility and test data setup
/* eslint-disable react-native/no-inline-styles */
 

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import {
  FlatList,
  SectionList,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

// * Test data
const mockListData = [
  { id: '1', title: 'Item 1', description: 'Description 1' },
  { id: '2', title: 'Item 2', description: 'Description 2' },
  { id: '3', title: 'Item 3', description: 'Description 3' },
  { id: '4', title: 'Item 4', description: 'Description 4' },
  { id: '5', title: 'Item 5', description: 'Description 5' },
];

const mockSectionData = [
  {
    title: 'Section A',
    data: [
      { id: '1', name: 'A1' },
      { id: '2', name: 'A2' },
    ],
  },
  {
    title: 'Section B',
    data: [
      { id: '3', name: 'B1' },
      { id: '4', name: 'B2' },
      { id: '5', name: 'B3' },
    ],
  },
];

// * Test list component
const TestList = ({
  data = mockListData,
  loading = false,
  onRefresh,
  onEndReached,
  onItemPress,
}: {
  data?: typeof mockListData;
  loading?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onItemPress?: (item: any) => void;
}) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    onRefresh?.();
    setTimeout(() => setRefreshing(false), 1000);
  }, [onRefresh]);

  const renderItem = ({ item }: { item: typeof mockListData[0] }) => (
    <TouchableOpacity
      testID={`list-item-${item.id}`}
      onPress={() => onItemPress?.(item)}
      style={{ padding: 16, borderBottomWidth: 1 }}
    >
      <Text testID={`list-item-title-${item.id}`}>{item.title}</Text>
      <Text testID={`list-item-description-${item.id}`}>{item.description}</Text>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View testID="empty-list" style={{ padding: 20, alignItems: 'center' }}>
      <Text testID="empty-list-text">No items found</Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View testID="list-footer-loading" style={{ padding: 20 }}>
        <ActivityIndicator testID="loading-indicator" />
      </View>
    );
  };

  return (
    <FlatList
      testID="test-list"
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={renderFooter}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          testID="refresh-control"
        />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
    />
  );
};

describe('List Components', () => {
  // * FlatList basic rendering
  describe('FlatList Rendering', () => {
    it('should render list items', () => {
      const { getByTestId, getByText } = render(<TestList />);

      expect(getByTestId('test-list')).toBeTruthy();

      mockListData.forEach((item) => {
        expect(getByTestId(`list-item-${item.id}`)).toBeTruthy();
        expect(getByText(item.title)).toBeTruthy();
        expect(getByText(item.description)).toBeTruthy();
      });
    });

    it('should use keyExtractor for keys', () => {
      const { getByTestId } = render(<TestList />);

      const list = getByTestId('test-list');
      expect(list.props.keyExtractor({ id: 'test-id' })).toBe('test-id');
    });

    it('should render empty component when no data', () => {
      const { getByTestId, getByText } = render(<TestList data={[]} />);

      expect(getByTestId('empty-list')).toBeTruthy();
      expect(getByText('No items found')).toBeTruthy();
    });

    it('should render footer component when loading', () => {
      const { getByTestId } = render(<TestList loading={true} />);

      expect(getByTestId('list-footer-loading')).toBeTruthy();
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should not render footer when not loading', () => {
      const { queryByTestId } = render(<TestList loading={false} />);

      expect(queryByTestId('list-footer-loading')).toBeNull();
    });
  });

  // * Item interactions
  describe('Item Interactions', () => {
    it('should handle item press', () => {
      const onItemPressMock = jest.fn();
      const { getByTestId } = render(<TestList onItemPress={onItemPressMock} />);

      const firstItem = getByTestId('list-item-1');
      fireEvent.press(firstItem);

      expect(onItemPressMock).toHaveBeenCalledWith(mockListData[0]);
    });

    it('should handle multiple item presses', () => {
      const onItemPressMock = jest.fn();
      const { getByTestId } = render(<TestList onItemPress={onItemPressMock} />);

      fireEvent.press(getByTestId('list-item-1'));
      fireEvent.press(getByTestId('list-item-3'));
      fireEvent.press(getByTestId('list-item-5'));

      expect(onItemPressMock).toHaveBeenCalledTimes(3);
      expect(onItemPressMock).toHaveBeenCalledWith(mockListData[0]);
      expect(onItemPressMock).toHaveBeenCalledWith(mockListData[2]);
      expect(onItemPressMock).toHaveBeenCalledWith(mockListData[4]);
    });
  });

  // * Pull to refresh
  describe('Pull to Refresh', () => {
    it('should support pull to refresh', () => {
      const { getByTestId } = render(<TestList />);

      const refreshControl = getByTestId('refresh-control');
      expect(refreshControl).toBeTruthy();
    });

    it('should call onRefresh when pulled', async () => {
      const onRefreshMock = jest.fn();
      const { getByTestId } = render(<TestList onRefresh={onRefreshMock} />);

      const refreshControl = getByTestId('refresh-control');
      fireEvent(refreshControl, 'refresh');

      await waitFor(() => {
        expect(onRefreshMock).toHaveBeenCalled();
      });
    });

    it('should show refreshing state', async () => {
      const { getByTestId } = render(<TestList onRefresh={jest.fn()} />);

      const refreshControl = getByTestId('refresh-control');

      // * Initially not refreshing
      expect(refreshControl.props.refreshing).toBe(false);

      // * Trigger refresh
      fireEvent(refreshControl, 'refresh');

      // * Should be refreshing
      await waitFor(() => {
        expect(refreshControl.props.refreshing).toBe(true);
      });

      // * Wait for refresh to complete
      await waitFor(() => {
        expect(refreshControl.props.refreshing).toBe(false);
      }, { timeout: 2000 });
    });
  });

  // * Infinite scroll / pagination
  describe('Infinite Scroll', () => {
    it('should call onEndReached when scrolled to bottom', () => {
      const onEndReachedMock = jest.fn();
      const { getByTestId } = render(<TestList onEndReached={onEndReachedMock} />);

      const list = getByTestId('test-list');

      // * Simulate reaching end
      fireEvent(list, 'endReached');

      expect(onEndReachedMock).toHaveBeenCalled();
    });

    it('should respect onEndReachedThreshold', () => {
      const { getByTestId } = render(<TestList />);

      const list = getByTestId('test-list');
      expect(list.props.onEndReachedThreshold).toBe(0.5);
    });

    it('should show loading footer when fetching more data', async () => {
      const LoadMoreList = () => {
        const [data, setData] = React.useState(mockListData);
        const [loading, setLoading] = React.useState(false);

        const loadMore = () => {
          setLoading(true);
          setTimeout(() => {
            setData([...data, { id: '6', title: 'Item 6', description: 'Description 6' }]);
            setLoading(false);
          }, 100);
        };

        return <TestList data={data} loading={loading} onEndReached={loadMore} />;
      };

      const { getByTestId, queryByTestId, getByText } = render(<LoadMoreList />);

      const list = getByTestId('test-list');
      fireEvent(list, 'endReached');

      // * Should show loading
      await waitFor(() => {
        expect(getByTestId('list-footer-loading')).toBeTruthy();
      });

      // * Should hide loading and show new item
      await waitFor(() => {
        expect(queryByTestId('list-footer-loading')).toBeNull();
        expect(getByText('Item 6')).toBeTruthy();
      });
    });
  });

  // * SectionList tests
  describe('SectionList', () => {
    const TestSectionList = ({
      sections = mockSectionData,
    }: {
      sections?: typeof mockSectionData;
    }) => (
      <SectionList
        testID="section-list"
        sections={sections}
        renderItem={({ item }) => (
          <View testID={`section-item-${item.id}`} style={{ padding: 10 }}>
            <Text>{item.name}</Text>
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View testID={`section-header-${section.title}`} style={{ padding: 10, backgroundColor: '#f0f0f0' }}>
            <Text testID={`section-header-text-${section.title}`}>{section.title}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    );

    it('should render section headers', () => {
      const { getByTestId, getByText } = render(<TestSectionList />);

      expect(getByTestId('section-list')).toBeTruthy();
      expect(getByText('Section A')).toBeTruthy();
      expect(getByText('Section B')).toBeTruthy();
    });

    it('should render section items', () => {
      const { getByTestId, getByText } = render(<TestSectionList />);

      // * Check Section A items
      expect(getByTestId('section-item-1')).toBeTruthy();
      expect(getByTestId('section-item-2')).toBeTruthy();
      expect(getByText('A1')).toBeTruthy();
      expect(getByText('A2')).toBeTruthy();

      // * Check Section B items
      expect(getByTestId('section-item-3')).toBeTruthy();
      expect(getByTestId('section-item-4')).toBeTruthy();
      expect(getByTestId('section-item-5')).toBeTruthy();
      expect(getByText('B1')).toBeTruthy();
      expect(getByText('B2')).toBeTruthy();
      expect(getByText('B3')).toBeTruthy();
    });

    it('should render empty sections', () => {
      const emptySections = [
        { title: 'Empty Section', data: [] },
      ];

      const { getByText, queryByTestId } = render(<TestSectionList sections={emptySections} />);

      expect(getByText('Empty Section')).toBeTruthy();
      // * No items should be rendered
      expect(queryByTestId('section-item-1')).toBeNull();
    });
  });

  // * Performance optimizations
  describe('Performance Optimizations', () => {
    it('should support getItemLayout for optimization', () => {
      const getItemLayout = (data: any, index: number) => ({
        length: 50,
        offset: 50 * index,
        index,
      });

      const { getByTestId } = render(
        <FlatList
          testID="optimized-list"
          data={mockListData}
          renderItem={({ item }) => <Text>{item.title}</Text>}
          keyExtractor={(item) => item.id}
          getItemLayout={getItemLayout}
        />
      );

      const list = getByTestId('optimized-list');
      expect(list.props.getItemLayout(mockListData, 2)).toEqual({
        length: 50,
        offset: 100,
        index: 2,
      });
    });

    it('should support initialNumToRender', () => {
      const { getByTestId } = render(
        <FlatList
          testID="initial-render-list"
          data={mockListData}
          renderItem={({ item }) => <Text>{item.title}</Text>}
          keyExtractor={(item) => item.id}
          initialNumToRender={3}
        />
      );

      const list = getByTestId('initial-render-list');
      expect(list.props.initialNumToRender).toBe(3);
    });

    it('should support maxToRenderPerBatch', () => {
      const { getByTestId } = render(
        <FlatList
          testID="batch-render-list"
          data={mockListData}
          renderItem={({ item }) => <Text>{item.title}</Text>}
          keyExtractor={(item) => item.id}
          maxToRenderPerBatch={2}
        />
      );

      const list = getByTestId('batch-render-list');
      expect(list.props.maxToRenderPerBatch).toBe(2);
    });

    it('should support windowSize', () => {
      const { getByTestId } = render(
        <FlatList
          testID="window-list"
          data={mockListData}
          renderItem={({ item }) => <Text>{item.title}</Text>}
          keyExtractor={(item) => item.id}
          windowSize={10}
        />
      );

      const list = getByTestId('window-list');
      expect(list.props.windowSize).toBe(10);
    });
  });

  // * List header and footer
  describe('List Headers and Footers', () => {
    it('should render list header', () => {
      const { getByTestId } = render(
        <FlatList
          testID="header-list"
          data={mockListData}
          renderItem={({ item }) => <Text>{item.title}</Text>}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View testID="list-header">
              <Text>Header Content</Text>
            </View>
          }
        />
      );

      expect(getByTestId('list-header')).toBeTruthy();
    });

    it('should render list footer', () => {
      const { getByTestId } = render(
        <FlatList
          testID="footer-list"
          data={mockListData}
          renderItem={({ item }) => <Text>{item.title}</Text>}
          keyExtractor={(item) => item.id}
          ListFooterComponent={
            <View testID="list-footer">
              <Text>Footer Content</Text>
            </View>
          }
        />
      );

      expect(getByTestId('list-footer')).toBeTruthy();
    });

    it('should support sticky headers', () => {
      const { getByTestId } = render(
        <FlatList
          testID="sticky-list"
          data={mockListData}
          renderItem={({ item }) => <Text>{item.title}</Text>}
          keyExtractor={(item) => item.id}
          stickyHeaderIndices={[0, 2]}
        />
      );

      const list = getByTestId('sticky-list');
      expect(list.props.stickyHeaderIndices).toEqual([0, 2]);
    });
  });

  // * Horizontal lists
  describe('Horizontal Lists', () => {
    it('should support horizontal scrolling', () => {
      const { getByTestId } = render(
        <FlatList
          testID="horizontal-list"
          data={mockListData}
          renderItem={({ item }) => <Text>{item.title}</Text>}
          keyExtractor={(item) => item.id}
          horizontal={true}
        />
      );

      const list = getByTestId('horizontal-list');
      expect(list.props.horizontal).toBe(true);
    });

    it('should support inverted lists', () => {
      const { getByTestId } = render(
        <FlatList
          testID="inverted-list"
          data={mockListData}
          renderItem={({ item }) => <Text>{item.title}</Text>}
          keyExtractor={(item) => item.id}
          inverted={true}
        />
      );

      const list = getByTestId('inverted-list');
      expect(list.props.inverted).toBe(true);
    });
  });

  // * Accessibility
  describe('List Accessibility', () => {
    it('should support accessibility props on items', () => {
      const AccessibleList = () => (
        <FlatList
          testID="accessible-list"
          data={mockListData}
          renderItem={({ item }) => (
            <TouchableOpacity
              testID={`accessible-item-${item.id}`}
              accessibilityRole="button"
              accessibilityLabel={`Select ${item.title}`}
              accessibilityHint={`Double tap to select ${item.title}`}
            >
              <Text>{item.title}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      );

      const { getByTestId } = render(<AccessibleList />);

      const firstItem = getByTestId('accessible-item-1');
      expect(firstItem.props.accessibilityRole).toBe('button');
      expect(firstItem.props.accessibilityLabel).toBe('Select Item 1');
      expect(firstItem.props.accessibilityHint).toBe('Double tap to select Item 1');
    });
  });
});