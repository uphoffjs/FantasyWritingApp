/* eslint-disable @typescript-eslint/no-explicit-any */
// ! Generic type parameters in library type definitions require 'any' for flexibility

declare module 'react-window' {
  import { ComponentType, CSSProperties, ReactNode as _ReactNode, Ref } from 'react';

  export interface ListChildComponentProps<T = any> {
    index: number;
    style: CSSProperties;
    data: T;
    isScrolling?: boolean;
  }

  export interface GridChildComponentProps<T = any> {
    columnIndex: number;
    rowIndex: number;
    style: CSSProperties;
    data: T;
    isScrolling?: boolean;
  }

  export interface ListOnScrollProps {
    scrollDirection: 'forward' | 'backward';
    scrollOffset: number;
    scrollUpdateWasRequested: boolean;
  }

  export interface ListOnItemsRenderedProps {
    overscanStartIndex: number;
    overscanStopIndex: number;
    visibleStartIndex: number;
    visibleStopIndex: number;
  }

  export interface GridOnScrollProps {
    horizontalScrollDirection: 'forward' | 'backward';
    scrollLeft: number;
    scrollTop: number;
    scrollUpdateWasRequested: boolean;
    verticalScrollDirection: 'forward' | 'backward';
  }

  export interface GridOnItemsRenderedProps {
    overscanColumnStartIndex: number;
    overscanColumnStopIndex: number;
    overscanRowStartIndex: number;
    overscanRowStopIndex: number;
    visibleColumnStartIndex: number;
    visibleColumnStopIndex: number;
    visibleRowStartIndex: number;
    visibleRowStopIndex: number;
  }

  export interface FixedSizeListProps<T = any> {
    children: ComponentType<ListChildComponentProps<T>>;
    className?: string;
    direction?: 'ltr' | 'rtl';
    height: number | string;
    initialScrollOffset?: number;
    innerRef?: Ref<any>;
    innerElementType?: ComponentType<any>;
    innerTagName?: string;
    itemCount: number;
    itemData?: T;
    itemKey?: (index: number, data: T) => string | number;
    itemSize: number;
    layout?: 'horizontal' | 'vertical';
    onItemsRendered?: (props: ListOnItemsRenderedProps) => void;
    onScroll?: (props: ListOnScrollProps) => void;
    outerRef?: Ref<any>;
    outerElementType?: ComponentType<any>;
    outerTagName?: string;
    overscanCount?: number;
    style?: CSSProperties;
    useIsScrolling?: boolean;
    width?: number | string;
  }

  export interface VariableSizeListProps<T = any> {
    children: ComponentType<ListChildComponentProps<T>>;
    className?: string;
    direction?: 'ltr' | 'rtl';
    estimatedItemSize?: number;
    height: number | string;
    initialScrollOffset?: number;
    innerRef?: Ref<any>;
    innerElementType?: ComponentType<any>;
    innerTagName?: string;
    itemCount: number;
    itemData?: T;
    itemKey?: (index: number, data: T) => string | number;
    itemSize: (index: number) => number;
    layout?: 'horizontal' | 'vertical';
    onItemsRendered?: (props: ListOnItemsRenderedProps) => void;
    onScroll?: (props: ListOnScrollProps) => void;
    outerRef?: Ref<any>;
    outerElementType?: ComponentType<any>;
    outerTagName?: string;
    overscanCount?: number;
    ref?: Ref<any>;
    style?: CSSProperties;
    useIsScrolling?: boolean;
    width?: number | string;
  }

  export interface FixedSizeGridProps<T = any> {
    children: ComponentType<GridChildComponentProps<T>>;
    className?: string;
    columnCount: number;
    columnWidth: number;
    direction?: 'ltr' | 'rtl';
    height: number | string;
    initialScrollLeft?: number;
    initialScrollTop?: number;
    innerRef?: Ref<any>;
    innerElementType?: ComponentType<any>;
    innerTagName?: string;
    itemData?: T;
    itemKey?: (params: { columnIndex: number; rowIndex: number; data: T }) => string | number;
    onItemsRendered?: (props: GridOnItemsRenderedProps) => void;
    onScroll?: (props: GridOnScrollProps) => void;
    outerRef?: Ref<any>;
    outerElementType?: ComponentType<any>;
    outerTagName?: string;
    overscanColumnCount?: number;
    overscanColumnsCount?: number;
    overscanRowCount?: number;
    overscanRowsCount?: number;
    rowCount: number;
    rowHeight: number;
    style?: CSSProperties;
    useIsScrolling?: boolean;
    width: number | string;
  }

  export const FixedSizeList: ComponentType<FixedSizeListProps>;
  export const VariableSizeList: ComponentType<VariableSizeListProps>;
  export const FixedSizeGrid: ComponentType<FixedSizeGridProps>;
  
  // * Aliases for common usage
  export const List: typeof FixedSizeList;
  export const Grid: typeof FixedSizeGrid;
}