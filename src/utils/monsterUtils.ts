/**
 * Utilities for monster token identification, badges (e.g. G1, G2), auto-numbering,
 * and 1-to-1 active turn token resolution.
 */

import { CombatState } from '../types/combat';
import { MapToken } from '../types/map';

export interface EntityWithIdentity {
  id?: string;
  entityId?: string;
  name: string;
  isPlayer?: boolean;
  badge?: string;
}

/**
 * Extracts a concise identifier badge (e.g. "G1", "G2", "DW3", "ARD1")
 * from a monster's name, token, or combatant.
 * If multiple monsters of the same type exist in contextList, automatically
 * assigns sequential numbers (G1, G2) even if the source name was unnumbered.
 */
export function getMonsterBadge(
  input: string | EntityWithIdentity | null | undefined,
  contextList?: EntityWithIdentity[]
): string | null {
  if (!input) return null;

  let isPlayer = false;
  let explicitBadge: string | undefined;
  let name = '';
  let entityId: string | undefined;
  let entityObj: EntityWithIdentity | null = null;

  if (typeof input === 'object') {
    isPlayer = !!input.isPlayer;
    explicitBadge = input.badge;
    name = input.name || '';
    entityId = input.entityId;
    entityObj = input;
  } else {
    name = input;
  }

  if (isPlayer) return null;

  // If explicit badge already contains digits (e.g. "G1", "DW2"), return it
  if (explicitBadge && /\d/.test(explicitBadge)) {
    return explicitBadge;
  }

  const trimmed = (name || '').trim();
  // Check if name has trailing number like "Goblin 1", "Goblin #2", "Goblin (3)"
  const match = trimmed.match(/^(.*?)(?:\s+(?:#|\()?(\d+)\)?)?$/i);
  const baseName = match && match[1] ? match[1].trim() : trimmed;
  const numStr = match && match[2] ? match[2] : '';

  // Extract letters (e.g. "Goblin" -> "G", "Dire Wolf" -> "DW", "Adult Red Dragon" -> "ARD")
  const letters = getAcronymLetters(baseName);

  if (numStr) {
    return `${letters}${numStr}`;
  }

  // If no number in name, check if contextList allows disambiguation
  if (contextList && contextList.length > 0 && entityObj) {
    const cleanBase = baseName.toLowerCase();
    const matchingInContext = contextList.filter((e) => {
      if (e.isPlayer) return false;
      if (entityId && e.entityId && e.entityId === entityId) return true;
      const otherCleanBase = (e.name || '').replace(/(?:\s+(?:#|\()?(\d+)\)?)?$/i, '').trim().toLowerCase();
      return otherCleanBase === cleanBase;
    });

    if (matchingInContext.length > 1) {
      const idx = matchingInContext.findIndex((e) => e === entityObj || (e.id && entityObj && e.id === entityObj.id));
      const sequenceNum = idx >= 0 ? idx + 1 : 1;
      return `${letters}${sequenceNum}`;
    }
  }

  // Fallback: Default to index 1 (e.g. "G1") to avoid unnumbered ambiguity
  return `${letters}1`;
}

function getAcronymLetters(baseName: string): string {
  const words = baseName.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'M';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  if (words.length === 2) return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  return words.slice(0, 3).map((w) => w.charAt(0).toUpperCase()).join('');
}

/**
 * Given a base monster name (e.g. "Goblin") and a list of existing tokens/combatants,
 * calculates the next sequential name (e.g. "Goblin 1", "Goblin 2", "Goblin 3").
 */
export function getNextMonsterName(
  baseMonsterName: string,
  existingEntities: { name: string; entityId?: string }[] = []
): { name: string; number: number; badge: string } {
  const cleanBase = baseMonsterName.replace(/(?:\s+(?:#|\()?(\d+)\)?)?$/i, '').trim();

  // Find all existing entities that match this base monster name
  const existingNumbers = new Set<number>();

  for (const entity of existingEntities) {
    const entName = (entity.name || '').trim();
    const match = entName.match(new RegExp(`^${escapeRegExp(cleanBase)}(?:\\s+(?:#|\\()?(\\d+)\\)?)?$`, 'i'));
    if (match) {
      if (match[1]) {
        existingNumbers.add(parseInt(match[1], 10));
      } else {
        existingNumbers.add(1);
      }
    }
  }

  // Find lowest available positive integer starting from 1
  let nextNum = 1;
  while (existingNumbers.has(nextNum)) {
    nextNum++;
  }

  const name = `${cleanBase} ${nextNum}`;
  const badge = `${getAcronymLetters(cleanBase)}${nextNum}`;

  return { name, number: nextNum, badge };
}

/**
 * Resolves exactly ONE active MapToken ID that corresponds to the active combatant.
 * Prevents multiple duplicate monsters from simultaneously receiving the active turn indicator.
 */
export function getActiveTurnTokenId(
  combatState: CombatState | null | undefined,
  tokens: MapToken[] | null | undefined
): string | null {
  if (!combatState || !combatState.isActive || !combatState.combatants || combatState.combatants.length === 0) {
    return null;
  }
  if (!tokens || tokens.length === 0) {
    return null;
  }

  const activeCombatant = combatState.combatants[combatState.currentTurnIndex];
  if (!activeCombatant) return null;

  // 1. Direct match by exact combatantId / tokenId
  const directMatch = tokens.find(
    (t) =>
      t.combatantId === activeCombatant.id ||
      t.id === activeCombatant.id ||
      (activeCombatant.id && activeCombatant.id.includes(t.id)) ||
      (t.id && t.id.includes(activeCombatant.id))
  );
  if (directMatch) {
    return directMatch.id;
  }

  // 2. Match by exact entityId or name
  const cleanActiveName = (activeCombatant.name || '').trim().toLowerCase();
  const matchingTokens = tokens.filter(
    (t) =>
      (!!activeCombatant.entityId && !!t.entityId && t.entityId === activeCombatant.entityId) ||
      (t.name || '').trim().toLowerCase() === cleanActiveName
  );

  if (matchingTokens.length === 1) {
    return matchingTokens[0].id;
  }

  if (matchingTokens.length > 1) {
    // Disambiguate duplicate monsters by matching index in combatant list
    const matchingCombatants = combatState.combatants.filter(
      (c) =>
        (!!activeCombatant.entityId && !!c.entityId && c.entityId === activeCombatant.entityId) ||
        (c.name || '').trim().toLowerCase() === cleanActiveName
    );

    const combatantIndex = matchingCombatants.findIndex((c) => c.id === activeCombatant.id);
    if (combatantIndex >= 0 && combatantIndex < matchingTokens.length) {
      return matchingTokens[combatantIndex].id;
    }
    return matchingTokens[0].id;
  }

  return null;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
