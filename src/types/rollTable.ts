import { BaseEntity } from './entity';

export interface RollTableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'badge' | 'dice';
  width?: string;
}

export interface RollTableItem {
  id: string;
  rangeMin: number;
  rangeMax: number;
  result: string;
  subTableId?: string;
  values?: Record<string, any>;
  [key: string]: any;
}

export interface RollTableEntity extends BaseEntity {
  type: 'rollTable';
  diceFormula: string; // "1d20", "1d100", "1d6"
  description?: string;
  columns?: RollTableColumn[];
  items: RollTableItem[];
  theme?: string;
  category?: string;
}

