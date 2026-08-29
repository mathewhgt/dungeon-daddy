export type EntityType = 
  | 'monster' 
  | 'spell' 
  | 'item' 
  | 'player' 
  | 'rollTable' 
  | 'encounter' 
  | 'campaign'
  | 'campaignNote'
  | 'feat'
  | 'map';

export type FieldDataType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'text' 
  | 'array' 
  | 'json' 
  | 'enum';

export interface SchemaField {
  key: string;
  label: string;
  type: FieldDataType;
  description?: string;
  required?: boolean;
  defaultValue?: any;
  options?: string[]; // for enum
  exampleValue?: string;
}

export interface TemplateDefinition {
  type: EntityType;
  displayName: string;
  description: string;
  primaryKey: string;
  titleKey: string;
  subtitleKey?: string;
  badgeKey?: string;
  fields: SchemaField[];
  csvHeaders: string[];
}

export interface BaseEntity {
  id: string;
  type: EntityType;
  name: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  source?: string;
  imageUrl?: string;
  avatarUrl?: string;
  tokenUrl?: string;
  customFields?: Record<string, any>;
}
