import React from 'react';
import { PlayerEntity } from '../../../types/player';
import { AbilityKey } from '../../../types/characterCreator';
import { CLASSES_2024 } from '../../../services/characterCreationService';

interface KidFriendlyPrintSheetProps {
  player: PlayerEntity;
}

export const KidFriendlyPrintSheet: React.FC<KidFriendlyPrintSheetProps> = ({ player }) => {
  const abilities = player.abilities || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const level = player.level || 1;
  const pb = Math.floor((level - 1) / 4) + 2;

  const getMod = (score: number) => Math.floor((score - 10) / 2);
  const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

  const strMod = getMod(abilities.str);
  const dexMod = getMod(abilities.dex);
  const conMod = getMod(abilities.con);
  const intMod = getMod(abilities.int);
  const wisMod = getMod(abilities.wis);
  const chaMod = getMod(abilities.cha);

  // Class details
  const normClass = (player.characterClass || '').toLowerCase();
  const matchedClass = CLASSES_2024.find((c) => normClass.includes(c.id) || normClass.includes(c.name.toLowerCase()));
  const hitDie = matchedClass ? matchedClass.hitDie : (normClass.includes('barbarian') ? 12 : normClass.includes('fighter') || normClass.includes('paladin') || normClass.includes('ranger') ? 10 : normClass.includes('sorcerer') || normClass.includes('wizard') ? 6 : 8);
  
  const spellAbility: AbilityKey | undefined = matchedClass?.spellcasting?.ability || 
    (normClass.includes('bard') || normClass.includes('sorcerer') || normClass.includes('warlock') || normClass.includes('paladin') ? 'cha' :
     normClass.includes('cleric') || normClass.includes('druid') || normClass.includes('ranger') ? 'wis' :
     normClass.includes('wizard') ? 'int' : undefined);

  const activeSpellSlots = (player.spellSlots && player.spellSlots.length > 0)
    ? player.spellSlots
    : (spellAbility ? [{ level: 1, total: 2, used: 0 }] : []);

  const totalSlotsCount = activeSpellSlots.reduce((acc, s) => acc + s.total, 0);

  const hpBoxes = Math.min(24, Math.max(1, player.maxHp));

  return (
    <div className="bg-white text-slate-900 font-sans text-[11px] leading-tight p-4 max-w-[800px] mx-auto space-y-3 print:p-0 print:max-w-none">
      {/* 1-Page Kid-Friendly Hero Sheet Container */}
      <div className="print-page border-4 border-amber-500 rounded-3xl p-4 bg-amber-50/20 space-y-2.5">
        {/* Header: My Hero */}
        <div className="flex items-center justify-between border-b-2 border-amber-400 pb-2 gap-3">
          <div className="flex items-center space-x-3">
            {player.avatarUrl ? (
              <img
                src={player.avatarUrl}
                alt={player.name}
                className="w-14 h-14 rounded-xl object-cover border-2 border-amber-500 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl border-2 border-amber-500 flex items-center justify-center font-bold text-2xl bg-amber-100 text-amber-800 shadow-sm">
                🧙
              </div>
            )}
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-amber-700">
                ⭐ HERO CHARACTER SHEET ⭐
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{player.name}</h1>
              <div className="text-[10px] font-semibold text-slate-600 flex items-center space-x-2 mt-0.5">
                <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 font-bold">
                  Level {level} {player.characterClass}
                </span>
                <span>·</span>
                <span>{player.race || player.species || 'Human'}</span>
                {player.playerName && (
                  <>
                    <span>·</span>
                    <span className="text-slate-500">Player: <strong>{player.playerName}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-right space-y-0.5">
            <div className="inline-block px-2.5 py-0.5 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-900 font-black text-[10px]">
              ⚡ Bonus to Rolls: +{pb}
            </div>
            <div className="text-[9px] text-slate-500">
              Alignment: <strong>{player.alignment || 'Good Hero'}</strong>
            </div>
          </div>
        </div>

        {/* Big Vitals Bar: Health, Defense, Speed & Hit Dice */}
        <div className="grid grid-cols-4 gap-2">
          {/* Health Hearts */}
          <div className="col-span-2 border-2 border-red-300 rounded-xl p-2 bg-red-50/60 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-red-700 font-black text-xs">
                <span>❤️ HEALTH (HP)</span>
              </div>
              <div className="text-xs font-black font-mono text-red-900">
                {player.currentHp} / {player.maxHp} HP
              </div>
            </div>

            {/* Visual HP boxes */}
            <div className="mt-1 flex flex-wrap gap-1">
              {Array.from({ length: hpBoxes }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-4 h-4 rounded border-2 border-red-400 bg-white flex items-center justify-center font-bold text-[8px] text-red-700 font-mono"
                >
                  {idx + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Defense & Speed */}
          <div className="border-2 border-blue-300 rounded-xl p-1.5 bg-blue-50/60 flex flex-col justify-between items-center text-center">
            <div className="text-[8px] font-black text-blue-900 uppercase">Defense (AC)</div>
            <div className="text-lg font-black text-blue-950 font-mono leading-none">{player.armorClass}</div>
            <div className="text-[7.5px] text-blue-700">Roll {player.armorClass}+ to hit</div>
          </div>

          {/* Rest Dice (Hit Dice) */}
          <div className="border-2 border-purple-300 rounded-xl p-1.5 bg-purple-50/60 flex flex-col justify-between items-center text-center">
            <div className="text-[8px] font-black text-purple-900 uppercase">Rest Dice (HP)</div>
            <div className="text-sm font-black text-purple-950 font-mono leading-none">1d{hitDie}</div>
            <div className="text-[7.5px] text-purple-700 font-mono">Roll to heal on rest</div>
          </div>
        </div>

        {/* Turn Helper Box */}
        <div className="border-2 border-purple-300 rounded-xl p-2 bg-purple-50/50">
          <div className="font-black text-purple-900 text-[10px] flex items-center space-x-1 mb-1">
            <span>🎲 WHAT CAN I DO ON MY TURN? (Choose in any order)</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[9px] leading-tight">
            <div className="bg-white p-1.5 rounded-lg border border-purple-200 shadow-sm">
              <strong className="text-purple-800 block font-bold">1. 🏃 MOVE ({player.speed || '30 ft'})</strong>
              <p className="text-slate-600 mt-0.5">Walk, run, or jump up to 6 squares.</p>
            </div>
            <div className="bg-white p-1.5 rounded-lg border border-purple-200 shadow-sm">
              <strong className="text-purple-800 block font-bold">2. ⚔️ ACTION</strong>
              <p className="text-slate-600 mt-0.5">Attack with weapon, cast magic, or help a friend.</p>
            </div>
            <div className="bg-white p-1.5 rounded-lg border border-purple-200 shadow-sm">
              <strong className="text-purple-800 block font-bold">3. ✨ BONUS & REACTION</strong>
              <p className="text-slate-600 mt-0.5">Use quick spells or react when attacked!</p>
            </div>
          </div>
        </div>

        {/* 6 Hero Powers / Ability Scores */}
        <div className="space-y-1">
          <div className="font-black text-slate-800 text-[10px] uppercase tracking-wider">
            💪 MY 6 HERO ABILITIES (Add this bonus to your 20-sided die!)
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { name: 'STRENGTH', icon: '💪', mod: strMod, desc: 'Swinging weapons, climbing, jumping' },
              { name: 'DEXTERITY', icon: '🏃', mod: dexMod, desc: 'Sneaking, dodging, shooting bows' },
              { name: 'CONSTITUTION', icon: '❤️', mod: conMod, desc: 'Toughness, resisting poison & fatigue' },
              { name: 'INTELLIGENCE', icon: '🧠', mod: intMod, desc: 'Remembering lore, magic puzzles' },
              { name: 'WISDOM', icon: '🦉', mod: wisMod, desc: 'Spotting traps, noticing danger' },
              { name: 'CHARISMA', icon: '✨', mod: chaMod, desc: 'Persuading people, making friends' },
            ].map((ab) => (
              <div
                key={ab.name}
                className="p-1.5 rounded-xl border border-slate-300 bg-white shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="text-base shrink-0">{ab.icon}</span>
                  <div className="truncate">
                    <div className="font-black text-[9.5px] text-slate-900 truncate">{ab.name}</div>
                    <div className="text-[7.5px] text-slate-500 leading-none truncate">{ab.desc}</div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-400 flex items-center justify-center font-black text-xs text-amber-900 font-mono shrink-0 ml-1">
                  {formatMod(ab.mod)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attacks & Magic Spell Slots */}
        <div className="space-y-1">
          <div className="font-black text-slate-800 text-[10px] uppercase tracking-wider">
            ⚔️ MY ATTACKS & MAGIC SPELL SLOTS
          </div>
          <div className="grid grid-cols-2 gap-2">
            {/* Weapon attack */}
            {player.weaponMasteries && player.weaponMasteries.length > 0 ? (
              player.weaponMasteries.slice(0, 1).map((w, idx) => (
                <div key={idx} className="p-2 rounded-xl border-2 border-amber-300 bg-amber-50/50 shadow-sm space-y-0.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 text-[10px] flex items-center space-x-1 truncate">
                      <span>⚔️</span>
                      <span className="truncate">{w}</span>
                    </strong>
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] font-mono shrink-0">
                      Roll d20 + {strMod + pb}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-700 font-medium">
                    Deals <strong>1d8 + {strMod}</strong> Physical Damage on a hit!
                  </div>
                </div>
              ))
            ) : (
              <div className="p-2 rounded-xl border-2 border-amber-300 bg-amber-50/50 shadow-sm space-y-0.5">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 text-[10px]">⚔️ Hero Attack</strong>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] font-mono">
                    Roll d20 + {strMod + pb}
                  </span>
                </div>
                <div className="text-[9px] text-slate-700 font-medium">
                  Deals <strong>1d8 + {strMod}</strong> Damage on a hit!
                </div>
              </div>
            )}

            {/* Spell Slots & Spells Card */}
            {spellAbility ? (
              <div className="p-2 rounded-xl border-2 border-purple-300 bg-purple-50/50 shadow-sm space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-purple-950 text-[10px] flex items-center space-x-1">
                    <span>✨</span>
                    <span>Spell Magic Slots</span>
                  </strong>
                  <span className="px-1.5 py-0.2 rounded bg-purple-600 text-white font-black text-[8.5px] font-mono">
                    Save DC {player.spellSaveDc || 13}
                  </span>
                </div>

                {/* Interactive / Printable Spell Slot Checkboxes */}
                <div className="flex items-center space-x-1.5 bg-white p-1 rounded-lg border border-purple-200">
                  <span className="text-[8px] font-bold text-purple-900 uppercase">Lvl 1 Slots:</span>
                  <div className="flex space-x-1 font-mono font-bold text-[9px] text-purple-700">
                    {Array.from({ length: totalSlotsCount || 2 }).map((_, i) => (
                      <span key={i} className="px-1 border border-purple-300 rounded bg-purple-50">
                        [ ]
                      </span>
                    ))}
                  </div>
                </div>

                {player.cantrips && player.cantrips.length > 0 && (
                  <div className="text-[8.5px] text-purple-900 font-medium truncate">
                    Spells: {player.cantrips.join(', ')}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2 rounded-xl border-2 border-slate-200 bg-white shadow-sm space-y-0.5">
                <strong className="text-slate-900 text-[10px]">🛡️ Hero Defense Reaction</strong>
                <div className="text-[9px] text-slate-600">
                  Help an ally or take Opportunity Attack when enemies retreat!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Special Powers & Backpack */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          {/* Super Powers */}
          <div className="p-2 rounded-xl border-2 border-slate-200 bg-white space-y-0.5 text-[9px]">
            <div className="font-black text-slate-900 text-[9.5px] flex items-center space-x-1">
              <span>⭐</span>
              <span>SPECIAL POWERS & TRAITS</span>
            </div>
            <ul className="text-slate-700 list-disc list-inside space-y-0.5">
              {player.originFeat && (
                <li><strong>Feat:</strong> {player.originFeat}</li>
              )}
              {player.feats && player.feats.slice(0, 2).map((f, i) => (
                <li key={i}>{f}</li>
              ))}
              <li><strong>Languages:</strong> {player.proficiencies?.languages?.join(', ') || 'Common'}</li>
            </ul>
          </div>

          {/* Backpack & Treasure */}
          <div className="p-2 rounded-xl border-2 border-slate-200 bg-white space-y-0.5 text-[9px]">
            <div className="flex items-center justify-between">
              <div className="font-black text-slate-900 text-[9.5px] flex items-center space-x-1">
                <span>🎒</span>
                <span>BACKPACK & TREASURE</span>
              </div>
              <div className="px-1.5 py-0.2 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-black text-[9px]">
                💰 {player.currency?.gp ?? 10} Gold
              </div>
            </div>
            <p className="text-slate-700 leading-tight">
              {player.notes || 'Adventurer’s Pack, Bedroll, Torches, Rations (Yummy Snacks), 50 ft Rope.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
