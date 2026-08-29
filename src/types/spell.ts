import { BaseEntity } from './entity';

export type SpellSchool = 
  | 'Abjuration' 
  | 'Conjuration' 
  | 'Divination' 
  | 'Enchantment' 
  | 'Evocation' 
  | 'Illusion' 
  | 'Necromancy' 
  | 'Transmutation';

export type SpellElement = 
  | 'fire' 
  | 'cold' 
  | 'lightning' 
  | 'thunder' 
  | 'acid' 
  | 'poison' 
  | 'radiant' 
  | 'necrotic' 
  | 'force' 
  | 'psychic' 
  | 'none';

export type SpellAoeShape = 'sphere' | 'cone' | 'line' | 'cube' | 'cylinder' | 'none';

export interface SpellAoeConfig {
  shape: SpellAoeShape;
  sizeFeet: number; // e.g. 20 for 20ft sphere, 60 for 60ft cone
  lengthFeet?: number;
  widthFeet?: number;
}

export interface SpellEntity extends BaseEntity {
  type: 'spell';
  level: number; // 0 = Cantrip, 1-9
  school: SpellSchool;
  element?: SpellElement; // Damage / visual elemental energy
  shape?: SpellAoeShape; // AOE shape directly accessible
  range: string; // "Touch", "60 feet", "150 feet", "Self (60-foot cone)"
  rangeFeet?: number; // Numeric distance in feet
  castingTime: string; // "1 action", "1 bonus action", "1 reaction", "10 minutes"
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    materialCost?: string;
  };
  duration: string; // "Instantaneous", "1 minute", "Concentration, up to 1 hour"
  concentration: boolean;
  ritual: boolean;
  classes: string[]; // ['Wizard', 'Sorcerer', 'Cleric']
  description: string;
  higherLevels?: string;
  aoe?: SpellAoeConfig;
}
