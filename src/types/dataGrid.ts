import type { ReactNode } from 'react';

/** Cell render params compatible with former MUI DataGrid renderCell */
export interface GridRenderCellParams<
  R extends Record<string, unknown> = Record<string, unknown>,
  V = unknown,
> {
  row: R;
  value: V;
  /** Same as row (for compatibility) */
  id?: string | number;
}

/** Column definition for admin data grids (replaces @mui/x-data-grid GridColDef) */
export interface GridColDef<
  R extends Record<string, unknown> = Record<string, unknown>,
  V = unknown,
> {
  field: string;
  headerName: string;
  flex?: number;
  minWidth?: number;
  width?: number;
  sortable?: boolean;
  /** Optional class for the cell (e.g. for alignment) */
  cellClassName?: string;
  /** Ignored, for API compatibility */
  type?: string;
  filterable?: boolean;
  renderCell?: (params: GridRenderCellParams<R, V>) => ReactNode;
  valueGetter?: (params: GridRenderCellParams<R, V>) => unknown;
}

export type GridPaginationModel = { page: number; pageSize: number };

/** Row selection model (array of row ids). Replaces @mui/x-data-grid GridRowSelectionModel. */
export type GridRowSelectionModel = (string | number)[];
