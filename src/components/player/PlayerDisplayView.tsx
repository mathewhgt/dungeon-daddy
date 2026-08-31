import React, { useState, useEffect, useRef } from 'react';
import { 
  Maximize, 
  Minimize, 
  Eye, 
  EyeOff, 
  Swords, 
  Shield, 
  Heart, 
  Sparkles, 
  Flame, 
  Dices, 
  Compass,
  MapPin,
  Calendar,
  X,
  Volume2,
  FileText,
  BookOpen,
  Users,
  Footprints,
  Activity
} from 'lucide-react';
import { playerSyncService } from '../../services/playerSyncService';
import { PlayerDisplayState } from '../../types/display';
import { MapCanvas } from '../vtt/MapCanvas';
import { BattleMapEntity, MapToken } from '../../types/map';
import { Combatant } from '../../types/combat';
import { NoteContentRenderer } from '../notes/NoteEntityPopover';
import { PlayerCharacterCreationWalkthrough } from './PlayerCharacterCreationWalkthrough';
import { getMonsterBadge } from '../../utils/monsterUtils';
import { DeathSavesTracker } from '../common/DeathSavesTracker';

export const PlayerDisplayView: React.FC = () => {
  const [displayState, setDisplayState] = useState<PlayerDisplayState>(() => playerSyncService.getState());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [recentRoll, setRecentRoll] = useState<any>(null);
  const controlsTimeoutRef = useRef<any>(null);

  // Subscribe to sync service
  useEffect(() => {
    const unsubscribe = playerSyncService.subscribe((newState) => {
      setDisplayState({ ...newState });
    });
    return unsubscribe;
  }, []);

  // Handle dice rolls
  useEffect(() => {
    if (displayState.latestDiceRoll) {
      setRecentRoll(displayState.latestDiceRoll);
      const timer = setTimeout(() => {
        setRecentRoll(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [displayState.latestDiceRoll?.rollId]);

  // Mouse idle hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleToggleFullscreen = () => {
    if ((window as any).electronAPI?.playerDisplay?.toggleFullscreen) {
      (window as any).electronAPI.playerDisplay.toggleFullscreen();
      setIsFullscreen(!isFullscreen);
    } else {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      } else {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const { activeMap, camera, combatState, displaySettings, selectedTokenId, projectedMedia, characterCreation, campaignInfo } = displayState;

  // Filter player-visible tokens
  const playerVisibleMap: BattleMapEntity | null = activeMap
    ? {
        ...activeMap,
        lighting: {
          ...activeMap.lighting,
          gmVision: false,
        },
        tokens: (activeMap.tokens || []).filter((t: MapToken) => !t.hiddenFromPlayers),
        pins: [], // DM room pins are secret
      }
    : null;

  const selectedToken = playerVisibleMap?.tokens?.find((t) => t.id === selectedTokenId) || null;

  const isBlackout = displaySettings.mode === 'blackout' || displaySettings.isBlackoutActive;
  const isCharacterCreatorMode = (displaySettings.mode === 'character-creator' || Boolean(characterCreation)) && !isBlackout;
  const isCombatMode = displaySettings.mode === 'combat' && !isBlackout && !isCharacterCreatorMode;
  const isMediaMode = displaySettings.mode === 'media' && !isBlackout && !isCharacterCreatorMode;
  const isMapMode = (displaySettings.mode === 'map' || (!isCombatMode && !isMediaMode && !isCharacterCreatorMode && !isBlackout)) && !isBlackout;


  const visibleCombatants = combatState.combatants.filter((c: Combatant) => !c.isHidden);
  const activeCombatant = visibleCombatants[combatState.currentTurnIndex] || visibleCombatants[0] || null;

  return (
    <div
      onMouseMove={handleMouseMove}
      className="w-screen h-screen bg-[#090d12] text-slate-100 overflow-hidden font-sans select-none relative flex flex-col"
    >
      {/* Top Floating Ambient Header */}
      <header
        className={`absolute top-0 left-0 right-0 z-30 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 pointer-events-none ${
          showControls || combatState.isActive ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Campaign & Location Brand */}
        <div className="flex items-center space-x-3 pointer-events-auto">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20">
            DD
          </div>
          <div>
            <h1 className="font-serif font-bold text-amber-400 text-sm tracking-wide">
              {campaignInfo?.name || 'Dungeon Daddy Player Display'}
            </h1>
            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium">
              {campaignInfo?.currentLocation && (
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>{campaignInfo.currentLocation}</span>
                </span>
              )}
              {campaignInfo?.inGameDate && (
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-sky-400" />
                  <span>{campaignInfo.inGameDate}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Combat Status Banner if active */}
        {combatState.isActive && (
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700 text-red-300 text-xs font-bold shadow-lg shadow-red-950/50 animate-pulse pointer-events-auto">
            <Swords className="w-4 h-4 text-red-400" />
            <span>Combat (Round {combatState.round})</span>
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-surface-100/80 hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white transition-all shadow-md"
            title="Toggle Fullscreen (F11)"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Display Area */}
      <main className="flex-1 w-full h-full relative overflow-hidden">
        {/* ========================================================================= */}
        {/* 1. BATTLE MAP MODE */}
        {/* ========================================================================= */}
        {isMapMode && (
          <div className="w-full h-full absolute inset-0">
            {playerVisibleMap ? (
              <MapCanvas
                map={playerVisibleMap}
                isPlayerView={true}
                controlledCamera={displaySettings.followDmCamera ? camera : undefined}
                showGrid={displaySettings.showGrid}
                selectedToken={selectedToken}
                pingLocation={displayState.activePing}
                combatState={displayState.combatState}
                onSelectToken={() => {}}
                onOpenPinModal={() => {}}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-3 bg-[#090d12]">
                <Compass className="w-16 h-16 text-slate-700 animate-spin-slow" />
                <p className="font-serif text-sm tracking-wide text-slate-400">Waiting for GM to place map...</p>
              </div>
            )}

            {/* Compact Combat Tracker Overlay on Map */}
            {combatState.isActive && displaySettings.showCombatTrackerOverlay && (
              <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-center pointer-events-none">
                <div className="bg-[#121723]/90 backdrop-blur-md border border-amber-500/40 rounded-2xl p-3 shadow-2xl max-w-4xl w-full flex items-center space-x-3 overflow-x-auto pointer-events-auto">
                  <div className="flex items-center space-x-2 pr-3 border-r border-surface-border shrink-0">
                    <Swords className="w-5 h-5 text-amber-500" />
                    <span className="font-serif font-bold text-xs text-amber-400">R{combatState.round}</span>
                  </div>

                  <div className="flex items-center space-x-2 overflow-x-auto flex-1 py-1">
                    {visibleCombatants.map((c: Combatant, index: number) => {
                      const isCurrent = index === combatState.currentTurnIndex;
                      const hpPercent = c.maxHp > 0 ? Math.max(0, Math.min(100, (c.currentHp / c.maxHp) * 100)) : 100;
                      const isDeadMonster = !c.isPlayer && (c.currentHp <= 0 || c.defeated);
                      const isDownPlayer = c.isPlayer && c.currentHp <= 0;

                      return (
                        <div
                          key={c.id}
                          className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 shrink-0 transition-all ${
                            isDeadMonster
                              ? 'opacity-40 grayscale bg-black/40 border-slate-800'
                              : isDownPlayer
                              ? 'bg-red-950/30 border-red-600/80 shadow-md shadow-red-500/20'
                              : isCurrent
                              ? 'bg-amber-500/20 border-amber-500 shadow-md shadow-amber-500/20 scale-105'
                              : 'bg-surface-100/80 border-surface-border/60 text-slate-300'
                          }`}
                        >
                          {c.avatarUrl ? (
                            <img src={c.avatarUrl} alt={c.name} className="w-6 h-6 rounded-full object-cover border border-amber-500/40" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-surface-50 flex items-center justify-center text-[10px] font-bold">
                              {c.name.charAt(0)}
                            </div>
                          )}

                          <div>
                            {(() => {
                              const monsterBadge = !c.isPlayer ? (c.badge || getMonsterBadge(c, displayState.combatState?.combatants || [])) : null;
                              let combatantDisplayName = c.name;
                              if (!c.isPlayer && monsterBadge) {
                                const hasTrailingNumber = /\d+$/.test(c.name.trim());
                                if (!hasTrailingNumber) {
                                  const badgeNum = monsterBadge.replace(/^[A-Z]+/i, '');
                                  if (badgeNum) combatantDisplayName = `${c.name} ${badgeNum}`;
                                }
                              }
                              return (
                                <div className="flex items-center space-x-1.5">
                                  <span className={`text-xs font-bold truncate max-w-[90px] ${
                                    isDeadMonster
                                      ? 'line-through text-slate-500'
                                      : isDownPlayer
                                      ? 'text-red-300'
                                      : isCurrent
                                      ? 'text-amber-300'
                                      : 'text-slate-200'
                                  }`}>
                                    {combatantDisplayName}
                                  </span>
                                  {monsterBadge && (
                                    <span className="px-1 py-0.2 rounded text-[9px] font-mono font-black bg-pink-950/90 border border-pink-500/60 text-pink-300">
                                      {monsterBadge}
                                    </span>
                                  )}
                                  {isDeadMonster && (
                                    <span className="px-1 py-0.2 rounded bg-red-950 border border-red-700 text-red-300 font-bold text-[8px]">
                                      DEAD
                                    </span>
                                  )}
                                </div>
                              );
                            })()}

                            {/* Death Saves on player 0 HP */}
                            {isDownPlayer ? (
                              <div className="mt-0.5">
                                <DeathSavesTracker saves={c.deathSaves} readOnly compact lastHealAmount={c.lastHealAmount} />
                              </div>
                            ) : (
                              <>
                                {/* Health Bar if enabled */}
                                {displaySettings.monsterHpVisibility === 'bars' && (
                                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5 border border-slate-700">
                                    <div
                                      className={`h-full transition-all ${
                                        hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 20 ? 'bg-amber-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${hpPercent}%` }}
                                    />
                                  </div>
                                )}

                                {displaySettings.monsterHpVisibility === 'numbers' && (
                                  <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                                    {c.currentHp} / {c.maxHp} HP
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {c.initiative !== undefined && !isDeadMonster && (
                            <span className="px-1.5 py-0.2 rounded bg-surface-50 text-[10px] font-mono font-bold text-amber-400 ml-1">
                              {c.initiative}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. FULLSCREEN COMBAT TRACKER ARENA MODE */}
        {/* ========================================================================= */}
        {isCombatMode && (
          <div className="w-full h-full absolute inset-0 bg-[#0b0f16] flex flex-col p-8 pt-16 animate-fadeIn overflow-y-auto">
            {visibleCombatants.length > 0 ? (
              <div className="max-w-6xl w-full mx-auto space-y-6 flex-1 flex flex-col justify-center">
                {/* Arena Header */}
                <div className="flex items-center justify-between border-b border-surface-border pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-950/80 border border-red-700 flex items-center justify-center text-red-400 shadow-lg">
                      <Swords className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-serif text-xl font-bold text-slate-100">Combat Initiative Order</h2>
                      <p className="text-xs text-slate-400">Round {combatState.round} • Turn {combatState.currentTurnIndex + 1} of {visibleCombatants.length}</p>
                    </div>
                  </div>

                  <div className="px-4 py-1.5 rounded-full bg-red-950/60 border border-red-700 text-red-300 font-serif font-bold text-sm">
                    Round {combatState.round}
                  </div>
                </div>

                {/* Active Turn Spotlight Card */}
                {activeCombatant && (
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-surface-100 to-surface-50 border-2 border-amber-500 shadow-2xl flex items-center space-x-6 relative overflow-hidden">
                    <div className="absolute top-3 right-4 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500 text-amber-300 text-xs font-bold uppercase tracking-wider animate-pulse">
                      Active Turn
                    </div>

                    {/* Avatar */}
                    {activeCombatant.avatarUrl ? (
                      <img
                        src={activeCombatant.avatarUrl}
                        alt={activeCombatant.name}
                        className="w-28 h-28 rounded-3xl object-cover border-2 border-amber-400 shadow-xl"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-3xl bg-surface-50 border-2 border-amber-400 flex items-center justify-center text-4xl font-serif font-black text-amber-400 shadow-xl">
                        {activeCombatant.name.charAt(0)}
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-serif text-3xl font-bold text-slate-100">{activeCombatant.name}</h3>
                        {activeCombatant.initiative !== undefined && (
                          <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500 text-amber-400 font-mono font-black text-sm">
                            INIT {activeCombatant.initiative}
                          </span>
                        )}
                      </div>

                      {/* Health display or Death Saves */}
                      {activeCombatant.isPlayer && activeCombatant.currentHp <= 0 ? (
                        <div className="pt-2 max-w-lg">
                          <DeathSavesTracker
                            saves={activeCombatant.deathSaves}
                            readOnly
                            lastHealAmount={activeCombatant.lastHealAmount}
                            characterName={activeCombatant.name}
                          />
                        </div>
                      ) : (
                        <>
                          {displaySettings.monsterHpVisibility === 'bars' && activeCombatant.maxHp > 0 && (
                            <div className="space-y-1 max-w-md">
                              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                <div
                                  className={`h-full transition-all duration-500 ${
                                    (activeCombatant.currentHp / activeCombatant.maxHp) > 0.5
                                      ? 'bg-emerald-500'
                                      : (activeCombatant.currentHp / activeCombatant.maxHp) > 0.2
                                      ? 'bg-amber-500'
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.max(0, Math.min(100, (activeCombatant.currentHp / activeCombatant.maxHp) * 100))}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {displaySettings.monsterHpVisibility === 'numbers' && (
                            <div className="text-sm font-mono text-emerald-400 font-bold">
                              {activeCombatant.currentHp} / {activeCombatant.maxHp} HP
                            </div>
                          )}
                        </>
                      )}

                      {/* Conditions */}
                      {activeCombatant.conditions && activeCombatant.conditions.length > 0 && (
                        <div className="flex items-center space-x-2 pt-1 flex-wrap gap-y-1">
                          {activeCombatant.conditions.map((cond: any) => (
                            <span key={cond.id || cond.name || cond} className="px-2.5 py-0.5 rounded-full bg-red-950 border border-red-700 text-red-300 text-xs font-bold">
                              {cond.name || cond}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Turn Queue Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                  {visibleCombatants.map((c: Combatant, idx: number) => {
                    const isCurrent = idx === combatState.currentTurnIndex;
                    const hpPercent = c.maxHp > 0 ? Math.max(0, Math.min(100, (c.currentHp / c.maxHp) * 100)) : 100;
                    const isDeadMonster = !c.isPlayer && (c.currentHp <= 0 || c.defeated);
                    const isDownPlayer = c.isPlayer && c.currentHp <= 0;

                    return (
                      <div
                        key={c.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center space-x-3 ${
                          isDeadMonster
                            ? 'opacity-40 grayscale bg-black/40 border-slate-800'
                            : isDownPlayer
                            ? 'bg-red-950/30 border-red-700'
                            : isCurrent
                            ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/10 scale-102'
                            : idx < combatState.currentTurnIndex
                            ? 'bg-surface-50/40 border-surface-border/40 opacity-60'
                            : 'bg-surface-100 border-surface-border'
                        }`}
                      >
                        {c.avatarUrl ? (
                          <img src={c.avatarUrl} alt={c.name} className="w-10 h-10 rounded-xl object-cover border border-surface-border" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-surface-50 flex items-center justify-center font-bold text-xs text-slate-300">
                            {c.name.charAt(0)}
                          </div>
                        )}

                        <div className="flex-1 truncate">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold truncate ${isCurrent ? 'text-amber-300' : 'text-slate-200'}`}>
                              {c.name}
                            </span>
                            {c.initiative !== undefined && (
                              <span className="text-[10px] font-mono font-bold text-amber-400 ml-1">
                                #{c.initiative}
                              </span>
                            )}
                          </div>

                          {/* Health Bar if enabled */}
                          {displaySettings.monsterHpVisibility === 'bars' && (
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1 border border-slate-700">
                              <div
                                className={`h-full transition-all ${
                                  hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 20 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${hpPercent}%` }}
                              />
                            </div>
                          )}

                          {displaySettings.monsterHpVisibility === 'numbers' && (
                            <div className="text-[9px] font-mono text-emerald-400">
                              {c.currentHp} / {c.maxHp} HP
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-4 text-center">
                <div className="w-20 h-20 rounded-3xl bg-red-950/40 border border-red-700/60 flex items-center justify-center text-red-400 shadow-2xl animate-pulse">
                  <Swords className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h2 className="font-serif text-2xl font-bold text-slate-100">Combat Tracker Ready</h2>
                  <p className="text-sm text-slate-400 font-serif">Waiting for GM to begin an encounter...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. FULLSCREEN MEDIA & HANDOUT PROJECTOR MODE */}
        {/* ========================================================================= */}
        {isMediaMode && (
          <div className="w-full h-full absolute inset-0 bg-[#090d12] flex items-center justify-center p-8 animate-fadeIn">
            {projectedMedia ? (
              <div className="max-w-4xl w-full max-h-[90vh] bg-[#121723] border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4 overflow-y-auto relative">
                {projectedMedia.badge && (
                  <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700 text-amber-300 text-xs font-bold uppercase tracking-wider">
                    {projectedMedia.badge}
                  </span>
                )}

                <h2 className="font-serif text-3xl font-bold text-amber-400 tracking-wide">
                  {projectedMedia.title}
                </h2>

                {projectedMedia.subtitle && (
                  <p className="italic text-sm text-slate-400 font-serif -mt-2">
                    {projectedMedia.subtitle}
                  </p>
                )}

                {projectedMedia.imageUrl && (
                  <div className="w-full max-h-[55vh] overflow-hidden rounded-2xl border border-amber-500/30 shadow-2xl flex items-center justify-center bg-black/40">
                    <img
                      src={projectedMedia.imageUrl}
                      alt={projectedMedia.title}
                      className="max-h-[55vh] w-auto object-contain rounded-xl"
                    />
                  </div>
                )}

                {projectedMedia.content && (
                  <div className="w-full max-w-3xl text-left bg-[#0c1017]/95 p-6 rounded-2xl border border-amber-500/30 shadow-2xl overflow-y-auto max-h-[55vh]">
                    <NoteContentRenderer content={projectedMedia.content} isPlayerSafe={true} />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 space-y-4 text-center">
                <div className="w-20 h-20 rounded-3xl bg-indigo-950/40 border border-indigo-700/60 flex items-center justify-center text-sky-400 shadow-2xl animate-pulse">
                  <BookOpen className="w-10 h-10" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h2 className="font-serif text-2xl font-bold text-slate-100">Handout & Lore Projector Ready</h2>
                  <p className="text-sm text-slate-400 font-serif">
                    Click <strong>"Project to TV"</strong> on any Adventure Note or <strong>"Project Artwork"</strong> on any Monster to beam it here.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. CHARACTER CREATOR PLAYER WALKTHROUGH MODE */}
        {/* ========================================================================= */}
        {isCharacterCreatorMode && characterCreation && (
          <div className="w-full h-full absolute inset-0 bg-[#080c14] z-20">
            <PlayerCharacterCreationWalkthrough
              step={characterCreation.step}
              characterState={characterCreation.characterState}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. BLACKOUT / INTERMISSION CURTAIN */}
        {/* ========================================================================= */}
        {isBlackout && (
          <div className="absolute inset-0 z-50 bg-[#06090e] flex flex-col items-center justify-center p-8 text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-red-600/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/20 animate-pulse">
              <Sparkles className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-xl">
              <h2 className="font-serif text-3xl font-bold text-slate-100 tracking-wide">
                {campaignInfo?.name || 'Dungeon Daddy'}
              </h2>
              <p className="text-base text-amber-400 font-medium leading-relaxed font-serif">
                {displaySettings.blackoutMessage || 'Session in Progress... The Adventure Continues Soon'}
              </p>
            </div>
          </div>
        )}

        {/* Live Dice Roll Notification Toast */}
        {recentRoll && (
          <div className="absolute top-16 right-6 z-40 p-4 rounded-2xl bg-[#121723]/95 border-2 border-amber-500 shadow-2xl text-slate-100 flex items-center space-x-3 animate-bounce shadow-amber-500/20">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-mono text-xl font-black">
              {recentRoll.total}
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300">{recentRoll.label || 'Dice Roll'}</div>
              <div className="text-[11px] text-slate-400 font-mono">{recentRoll.formula}</div>
              {recentRoll.isCrit && <div className="text-[10px] font-bold text-red-400 uppercase">🔥 Critical Hit!</div>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default PlayerDisplayView;
