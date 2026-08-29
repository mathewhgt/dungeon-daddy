import { BaseEntity } from './entity';

export interface RollTableItem {
  id: string;
  rangeMin: number;
  rangeMax: number;
  result: string;
  subTableId?: string;
}

export interface RollTableEntity extends BaseEntity {
  type: 'rollTable';
  diceFormula: string; // "1d20", "1d100", "1d6"
  description?: string;
  items: RollTableItem[];
}
