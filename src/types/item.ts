import { BaseEntity } from './entity';

export interface ItemEntity extends BaseEntity {
  type: 'item';
  itemType: 'Weapon' | 'Armor' | 'Wondrous Item' | 'Potion' | 'Scroll' | 'Ring' | 'Rod' | 'Staff' | 'Wand' | 'Adventuring Gear' | (string & {});
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary' | 'Artifact' | 'Mundane' | (string & {});
  attunement: boolean;
  attunementRequirement?: string;
  value?: string; // "50 gp", "500 gp"
  weight?: string; // "3 lbs."
  damage?: string; // "1d8 slashing"
  armorClassBonus?: number;
  properties?: string[]; // ['Finesse', 'Light', 'Versatile']
  description: string;
}
