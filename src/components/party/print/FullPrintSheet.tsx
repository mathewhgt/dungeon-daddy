import React from 'react';
import { PlayerEntity } from '../../../types/player';
import { AbilityKey } from '../../../types/characterCreator';
import { SKILL_DEFINITIONS, CLASSES_2024 } from '../../../services/characterCreationService';

interface FullPrintSheetProps {
  player: PlayerEntity;
}

export const FullPrintSheet: React.FC<FullPrintSheetProps> = ({ player }) => {
  const abilities = player.abilities || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const level = player.level || 1;
  const pb = Math.floor((level - 1) / 4) + 2;

  const getMod = (score: number) => Math.floor((score - 10) / 2);
  const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

  const mods: Record<AbilityKey, number> = {
    str: getMod(abilities.str),
    dex: getMod(abilities.dex),
    con: getMod(abilities.con),
    int: getMod(abilities.int),
    wis: getMod(abilities.wis),
    cha: getMod(abilities.cha),
  };

  const profSaves = (player.proficiencies?.savingThrows || []).map((s) => s.toLowerCase());
  const profSkills = player.proficiencies?.skills || [];

  // Determine Class Details (Hit Die, Spellcasting)
  const normClass = (player.characterClass || '').toLowerCase();
  const matchedClass = CLASSES_2024.find((c) => normClass.includes(c.id) || normClass.includes(c.name.toLowerCase()));
  const hitDie = matchedClass ? matchedClass.hitDie : (normClass.includes('barbarian') ? 12 : normClass.includes('fighter') || normClass.includes('paladin') || normClass.includes('ranger') ? 10 : normClass.includes('sorcerer') || normClass.includes('wizard') ? 6 : 8);
  
  const spellAbility: AbilityKey | undefined = matchedClass?.spellcasting?.ability || 
    (normClass.includes('bard') || normClass.includes('sorcerer') || normClass.includes('warlock') || normClass.includes('paladin') ? 'cha' :
     normClass.includes('cleric') || normClass.includes('druid') || normClass.includes('ranger') ? 'wis' :
     normClass.includes('wizard') ? 'int' : undefined);

  const spellAbilityMod = spellAbility ? mods[spellAbility] : 0;
  const spellSaveDc = player.spellSaveDc || (spellAbility ? 8 + pb + spellAbilityMod : undefined);
  const spellAtkBonus = spellAbility ? pb + spellAbilityMod : undefined;

  // Spell Slots fallback if spellcaster
  const activeSpellSlots = (player.spellSlots && player.spellSlots.length > 0)
    ? player.spellSlots
    : (spellAbility ? [{ level: 1, total: 2, used: 0 }] : []);

  // Saving Throws with Full Labels
  const saves: { key: AbilityKey; label: string; mod: number; isProf: boolean }[] = [
    { key: 'str', label: 'Strength', mod: mods.str + (profSaves.includes('str') ? pb : 0), isProf: profSaves.includes('str') },
    { key: 'dex', label: 'Dexterity', mod: mods.dex + (profSaves.includes('dex') ? pb : 0), isProf: profSaves.includes('dex') },
    { key: 'con', label: 'Constitution', mod: mods.con + (profSaves.includes('con') ? pb : 0), isProf: profSaves.includes('con') },
    { key: 'int', label: 'Intelligence', mod: mods.int + (profSaves.includes('int') ? pb : 0), isProf: profSaves.includes('int') },
    { key: 'wis', label: 'Wisdom', mod: mods.wis + (profSaves.includes('wis') ? pb : 0), isProf: profSaves.includes('wis') },
    { key: 'cha', label: 'Charisma', mod: mods.cha + (profSaves.includes('cha') ? pb : 0), isProf: profSaves.includes('cha') },
  ];

  // Skills List
  const skillsList = SKILL_DEFINITIONS.map((def) => {
    const isProf = profSkills.includes(def.name);
    const mod = mods[def.ability] + (isProf ? pb : 0);
    return {
      name: def.name,
      ability: def.ability.toUpperCase(),
      mod,
      isProf,
    };
  });

  return (
    <div className="bg-white text-black font-serif text-[9.5px] leading-tight p-3 max-w-[820px] mx-auto print:p-0 print:max-w-none">
      {/* 1-PAGE COMPLETE D&D 2024 / 5E CHARACTER SHEET */}
      <div className="print-page border-2 border-black rounded-lg p-3 space-y-2 bg-white">
        {/* Character Sheet Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-2 gap-3">
          <div className="flex items-center space-x-3">
            {player.avatarUrl ? (
              <img
                src={player.avatarUrl}
                alt={player.name}
                className="w-12 h-12 rounded-md object-cover border border-black"
              />
            ) : (
              <div className="w-12 h-12 rounded-md border border-black flex items-center justify-center font-bold text-base bg-slate-100">
                {player.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold tracking-tight uppercase leading-none">{player.name}</h1>
              <div className="text-[9.5px] italic text-slate-700 mt-0.5">
                {player.playerName ? `Player: ${player.playerName}` : 'D&D 2024 Hero'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-x-3 gap-y-0.5 text-[9.5px] text-right border-l border-slate-300 pl-3">
            <div><strong>Class & Lvl:</strong> {player.characterClass} {level}</div>
            <div><strong>Species:</strong> {player.race || player.species || 'Human'}</div>
            <div><strong>Background:</strong> {player.background || 'Hero'}</div>
            <div><strong>Alignment:</strong> {player.alignment || 'Neutral Good'}</div>
            <div><strong>Prof. Bonus:</strong> +{pb}</div>
            <div><strong>Speed:</strong> {player.speed || '30 ft.'}</div>
          </div>
        </div>

        {/* Combat Vitals Strip (5 Equal Boxes) */}
        <div className="grid grid-cols-5 gap-2 text-center">
          {/* Armor Class */}
          <div className="border border-black rounded p-1 bg-slate-50">
            <div className="text-[8.5px] font-bold uppercase tracking-wider text-slate-600">Armor Class</div>
            <div className="text-lg font-bold leading-tight">{player.armorClass}</div>
            <div className="text-[7.5px] text-slate-600 truncate">
              {player.equippedArmor || 'Unarmored'}{player.equippedShield ? ' + Shield' : ''}
            </div>
          </div>

          {/* Initiative */}
          <div className="border border-black rounded p-1 bg-slate-50">
            <div className="text-[8.5px] font-bold uppercase tracking-wider text-slate-600">Initiative</div>
            <div className="text-lg font-bold font-mono leading-tight">
              {formatMod(player.initiativeBonus ?? mods.dex)}
            </div>
            <div className="text-[7.5px] text-slate-600">Dex {formatMod(mods.dex)}</div>
          </div>

          {/* Hit Points */}
          <div className="border border-black rounded p-1 bg-slate-50">
            <div className="text-[8.5px] font-bold uppercase tracking-wider text-slate-600">Hit Points</div>
            <div className="text-lg font-bold font-mono leading-tight">{player.currentHp} / {player.maxHp}</div>
            <div className="text-[7.5px] text-slate-600">Max HP: {player.maxHp}</div>
          </div>

          {/* Hit Dice */}
          <div className="border border-black rounded p-1 bg-slate-50">
            <div className="text-[8.5px] font-bold uppercase tracking-wider text-slate-600">Hit Dice</div>
            <div className="text-lg font-bold font-mono leading-tight">1d{hitDie}</div>
            <div className="text-[7.5px] text-slate-600">Total: {level}d{hitDie}</div>
          </div>

          {/* Passive Senses */}
          <div className="border border-black rounded p-1 bg-slate-50">
            <div className="text-[8.5px] font-bold uppercase tracking-wider text-slate-600">Passive Perc.</div>
            <div className="text-lg font-bold font-mono leading-tight">
              {player.passivePerception || 10 + mods.wis}
            </div>
            <div className="text-[7.5px] text-slate-600">Wis {formatMod(mods.wis)}</div>
          </div>
        </div>

        {/* 3-Column Core Body */}
        <div className="grid grid-cols-12 gap-2.5">
          {/* COLUMN 1: 6 Ability Scores & Death Saves (width 3/12) */}
          <div className="col-span-3 space-y-1.5">
            {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as AbilityKey[]).map((key) => {
              const score = abilities[key];
              const mod = mods[key];
              return (
                <div
                  key={key}
                  className="border border-black rounded p-1 text-center bg-slate-50 flex items-center justify-between px-2"
                >
                  <div className="text-left">
                    <div className="font-bold text-[9.5px] uppercase tracking-wide">{key}</div>
                    <div className="text-[8px] text-slate-600 font-mono">Score: {score}</div>
                  </div>
                  <div className="text-sm font-bold font-mono bg-white border border-black rounded px-1.5 py-0.2 shadow-sm">
                    {formatMod(mod)}
                  </div>
                </div>
              );
            })}

            {/* Death Saves Box */}
            <div className="border border-black rounded p-1.5 text-center text-[8.5px] bg-slate-50 space-y-0.5">
              <div className="font-bold uppercase tracking-wider text-[8px] text-slate-700">Death Saves</div>
              <div className="flex items-center justify-between px-1">
                <span>Success:</span>
                <span className="font-mono font-bold text-[9px] tracking-wider">○ ○ ○</span>
              </div>
              <div className="flex items-center justify-between px-1">
                <span>Failure:</span>
                <span className="font-mono font-bold text-[9px] tracking-wider">○ ○ ○</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Saving Throws, Skills & Proficiencies (width 4.5/12) */}
          <div className="col-span-5 space-y-1.5">
            {/* Saving Throws (Single Column with Full Names) */}
            <div className="border border-black rounded p-1.5 bg-slate-50">
              <div className="font-bold text-[8.5px] uppercase border-b border-black pb-0.5 mb-1 tracking-wider">
                Saving Throws
              </div>
              <div className="space-y-0.5">
                {saves.map((s) => (
                  <div key={s.key} className="flex items-center justify-between text-[8.5px]">
                    <span className="flex items-center space-x-1">
                      <span className="text-[9px]">{s.isProf ? '●' : '○'}</span>
                      <span className={s.isProf ? 'font-bold' : ''}>{s.label}</span>
                    </span>
                    <strong className="font-mono text-[9px]">{formatMod(s.mod)}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills (All 18 Skills with Full Names) */}
            <div className="border border-black rounded p-1.5 bg-slate-50">
              <div className="font-bold text-[8.5px] uppercase border-b border-black pb-0.5 mb-1 tracking-wider">
                Skills
              </div>
              <div className="space-y-0.2">
                {skillsList.map((sk) => (
                  <div key={sk.name} className="flex items-center justify-between text-[8px] leading-tight">
                    <span className="flex items-center space-x-1 truncate pr-1">
                      <span className="text-[8.5px]">{sk.isProf ? '●' : '○'}</span>
                      <span className={`truncate ${sk.isProf ? 'font-bold' : ''}`}>{sk.name}</span>
                      <span className="text-[7px] text-slate-500 font-mono">({sk.ability})</span>
                    </span>
                    <strong className="font-mono text-[8.5px]">{formatMod(sk.mod)}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Proficiencies & Languages */}
            <div className="border border-black rounded p-1.5 bg-slate-50 text-[8px] space-y-0.5">
              <div className="font-bold uppercase border-b border-black pb-0.5 tracking-wider text-[8px]">
                Proficiencies & Languages
              </div>
              <div><strong>Armor:</strong> {player.proficiencies?.armor?.join(', ') || 'Light Armor'}</div>
              <div><strong>Weapons:</strong> {player.proficiencies?.weapons?.join(', ') || 'Simple Weapons'}</div>
              {player.proficiencies?.tools && player.proficiencies.tools.length > 0 && (
                <div><strong>Tools:</strong> {player.proficiencies.tools.join(', ')}</div>
              )}
              <div><strong>Languages:</strong> {player.proficiencies?.languages?.join(', ') || 'Common'}</div>
            </div>
          </div>

          {/* COLUMN 3: Attacks, Spellcasting, Features & Equipment (width 4.5/12) */}
          <div className="col-span-4 space-y-1.5">
            {/* Weapons & Attacks */}
            <div className="border border-black rounded p-1.5 bg-slate-50 space-y-0.5">
              <div className="font-bold text-[8.5px] uppercase border-b border-black pb-0.5 tracking-wider flex items-center justify-between">
                <span>Weapons & Attacks</span>
                <span className="text-[7.5px] text-slate-500 font-normal">Bonus / Dmg</span>
              </div>

              <table className="w-full text-left text-[8px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-[7.5px] text-slate-600">
                    <th className="py-0.2">Weapon</th>
                    <th className="py-0.2 text-center">Atk</th>
                    <th className="py-0.2">Damage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {player.weaponMasteries && player.weaponMasteries.length > 0 ? (
                    player.weaponMasteries.map((w, idx) => (
                      <tr key={idx}>
                        <td className="py-0.5 font-sans font-semibold truncate max-w-[70px]">{w}</td>
                        <td className="py-0.5 text-center font-bold">+{mods.str + pb}</td>
                        <td className="py-0.5 text-[7.5px]">1d8+{mods.str}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-0.5 font-sans font-semibold">Unarmed</td>
                      <td className="py-0.5 text-center font-bold">+{mods.str + pb}</td>
                      <td className="py-0.5 text-[7.5px]">1+{mods.str}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Spellcasting & Spell Slots Tracker */}
            {spellAbility && (
              <div className="border border-black rounded p-1.5 bg-slate-50 space-y-1">
                <div className="font-bold text-[8.5px] uppercase border-b border-black pb-0.5 tracking-wider flex items-center justify-between">
                  <span>Spellcasting ({spellAbility.toUpperCase()})</span>
                  <div className="space-x-1.5 font-mono text-[7.5px]">
                    {spellSaveDc && <span>DC: <strong>{spellSaveDc}</strong></span>}
                    {spellAtkBonus && <span>Atk: <strong>+{spellAtkBonus}</strong></span>}
                  </div>
                </div>

                {/* Spell Slots Boxes */}
                <div className="bg-white border border-slate-300 rounded p-1 space-y-0.5">
                  <div className="text-[7.5px] font-bold uppercase text-slate-600">Spell Slots Tracker</div>
                  <div className="flex flex-wrap gap-1 text-[8px]">
                    {activeSpellSlots.map((slot) => (
                      <div key={slot.level} className="flex items-center space-x-1 border border-slate-300 px-1 py-0.2 rounded bg-slate-50">
                        <span className="font-bold font-mono">Lvl {slot.level}:</span>
                        <span className="font-mono font-bold tracking-widest text-[8.5px]">
                          {Array(slot.total).fill('[ ]').join(' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {player.cantrips && player.cantrips.length > 0 && (
                  <div className="text-[8px] leading-tight">
                    <strong>Cantrips:</strong> {player.cantrips.join(', ')}
                  </div>
                )}

                {player.spellsKnown && player.spellsKnown.length > 0 && (
                  <div className="text-[8px] leading-tight">
                    <strong>Prepared:</strong> {player.spellsKnown.join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* Origin Feats & Features */}
            <div className="border border-black rounded p-1.5 bg-slate-50 space-y-0.5">
              <div className="font-bold text-[8.5px] uppercase border-b border-black pb-0.5 tracking-wider">
                Origin Feats & Features
              </div>
              <div className="space-y-0.5 text-[8px] text-slate-800 leading-tight">
                {player.originFeat && (
                  <div><strong>Origin Feat:</strong> {player.originFeat}</div>
                )}
                {player.feats && player.feats.filter((f) => f !== player.originFeat).map((f, i) => (
                  <div key={i}><strong>Feat:</strong> {f}</div>
                ))}
              </div>
            </div>

            {/* Equipment & Gold */}
            <div className="border border-black rounded p-1.5 bg-slate-50 space-y-0.5 text-[8px]">
              <div className="font-bold uppercase border-b border-black pb-0.5 tracking-wider flex items-center justify-between">
                <span>Equipment & Gold</span>
                <span className="font-mono text-[7.5px]">Gold: {player.currency?.gp ?? 10} gp</span>
              </div>
              <p className="text-slate-800 line-clamp-2 leading-tight">
                {player.notes || 'Adventurer’s Pack, Rations (10 days), Waterskin, Bedroll, Rope (50 ft).'}
              </p>
            </div>

            {/* Personality & Lore */}
            {(player.personalityTraits || player.ideals || player.backstory) && (
              <div className="border border-black rounded p-1.5 bg-slate-50 space-y-0.5 text-[8px]">
                <div className="font-bold uppercase border-b border-black pb-0.5 tracking-wider">
                  Personality & Lore
                </div>
                {player.personalityTraits && (
                  <p className="italic text-slate-700 line-clamp-2 leading-tight">{player.personalityTraits}</p>
                )}
                {player.ideals && (
                  <p className="text-slate-700 line-clamp-1 leading-tight"><strong>Ideals:</strong> {player.ideals}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
