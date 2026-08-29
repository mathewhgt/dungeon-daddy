import { Point2D, MapDrawing } from '../../types/map';

export type SpellSchool = 
  | 'Evocation' 
  | 'Abjuration' 
  | 'Conjuration' 
  | 'Necromancy' 
  | 'Enchantment' 
  | 'Illusion' 
  | 'Transmutation' 
  | 'Divination';

export type SpellEffectType = 
  | 'fire' 
  | 'lightning' 
  | 'frost' 
  | 'radiant' 
  | 'poison'
  | 'abjuration'
  | 'conjuration'
  | 'necromancy'
  | 'enchantment'
  | 'illusion'
  | 'transmutation'
  | 'divination';

export interface SpellParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  life: number;
  maxLife: number;
  angle?: number;
  rotSpeed?: number;
}

export interface ActiveSpellAnimation {
  id: string;
  type: SpellEffectType;
  school?: SpellSchool | string;
  origin: Point2D;
  target?: Point2D;
  radiusPx: number;
  startTime: number;
  durationMs: number;
  particles: SpellParticle[];
  progress: number; // 0 to 1
}

/**
 * 1. EVOCATION (Fire / Lightning / Frost / Thunder)
 */
export function createFireballAnimation(origin: Point2D, radiusPx: number): ActiveSpellAnimation {
  const particles: SpellParticle[] = [];
  const count = 75;
  const colors = ['#f97316', '#ef4444', '#facc15', '#ffffff', '#b91c1c'];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 0.7 + 0.3) * (radiusPx / 22);
    const maxLife = Math.random() * 40 + 35;

    particles.push({
      x: origin.x + (Math.random() * 16 - 8),
      y: origin.y + (Math.random() * 16 - 8),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1.0,
      decay: 1 / maxLife,
      life: maxLife,
      maxLife,
    });
  }

  return {
    id: `anim-fire-${Date.now()}-${Math.random()}`,
    type: 'fire',
    school: 'Evocation',
    origin,
    radiusPx,
    startTime: performance.now(),
    durationMs: 1400,
    particles,
    progress: 0,
  };
}

export function createLightningAnimation(origin: Point2D, target: Point2D, lengthPx: number): ActiveSpellAnimation {
  const particles: SpellParticle[] = [];
  const count = 60;
  const colors = ['#38bdf8', '#06b6d4', '#60a5fa', '#ffffff', '#e0f2fe'];

  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
  const normX = dx / dist;
  const normY = dy / dist;

  for (let i = 0; i < count; i++) {
    const frac = Math.random();
    const px = origin.x + normX * lengthPx * frac + (Math.random() * 30 - 15);
    const py = origin.y + normY * lengthPx * frac + (Math.random() * 30 - 15);
    const maxLife = Math.random() * 30 + 20;

    particles.push({
      x: px,
      y: py,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1.0,
      decay: 1 / maxLife,
      life: maxLife,
      maxLife,
    });
  }

  return {
    id: `anim-lightning-${Date.now()}-${Math.random()}`,
    type: 'lightning',
    school: 'Evocation',
    origin,
    target,
    radiusPx: lengthPx,
    startTime: performance.now(),
    durationMs: 1100,
    particles,
    progress: 0,
  };
}

export function createFrostAnimation(origin: Point2D, radiusPx: number): ActiveSpellAnimation {
  const particles: SpellParticle[] = [];
  const count = 65;
  const colors = ['#93c5fd', '#bfdbfe', '#e0f2fe', '#ffffff', '#38bdf8'];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 0.6 + 0.2) * (radiusPx / 26);
    const maxLife = Math.random() * 50 + 30;

    particles.push({
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.9,
      decay: 1 / maxLife,
      life: maxLife,
      maxLife,
    });
  }

  return {
    id: `anim-frost-${Date.now()}-${Math.random()}`,
    type: 'frost',
    school: 'Evocation',
    origin,
    radiusPx,
    startTime: performance.now(),
    durationMs: 1500,
    particles,
    progress: 0,
  };
}

/**
 * 2. ABJURATION (Protective Runic Shield Barrier)
 */
export function createAbjurationAnimation(origin: Point2D, radiusPx: number): ActiveSpellAnimation {
  const particles: SpellParticle[] = [];
  const count = 45;
  const colors = ['#38bdf8', '#818cf8', '#ffffff', '#60a5fa', '#93c5fd'];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * radiusPx;
    const maxLife = Math.random() * 45 + 35;

    particles.push({
      x: origin.x + Math.cos(angle) * dist,
      y: origin.y + Math.sin(angle) * dist,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.9,
      decay: 1 / maxLife,
      life: maxLife,
      maxLife,
    });
  }

  return {
    id: `anim-abjuration-${Date.now()}-${Math.random()}`,
    type: 'abjuration',
    school: 'Abjuration',
    origin,
    radiusPx,
    startTime: performance.now(),
    durationMs: 1600,
    particles,
    progress: 0,
  };
}

/**
 * 3. CONJURATION (Dimensional Vortex / Summoning Portal)
 */
export function createConjurationAnimation(origin: Point2D, radiusPx: number): ActiveSpellAnimation {
  const particles: SpellParticle[] = [];
  const count = 55;
  const colors = ['#a855f7', '#c084fc', '#e879f9', '#ffffff', '#38bdf8'];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * radiusPx;
    const maxLife = Math.random() * 50 + 35;

    particles.push({
      x: origin.x + Math.cos(angle) * dist,
      y: origin.y + Math.sin(angle) * dist,
      vx: -Math.sin(angle) * 3, // vortex swirling motion
      vy: Math.cos(angle) * 3,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.95,
      decay: 1 / maxLife,
      life: maxLife,
      maxLife,
    });
  }

  return {
    id: `anim-conjuration-${Date.now()}-${Math.random()}`,
    type: 'conjuration',
    school: 'Conjuration',
    origin,
    radiusPx,
    startTime: performance.now(),
    durationMs: 1700,
    particles,
    progress: 0,
  };
}

/**
 * 4. NECROMANCY (Dark Shadow Tendrils & Poison Mist)
 */
export function createNecromancyAnimation(origin: Point2D, radiusPx: number): ActiveSpellAnimation {
  const particles: SpellParticle[] = [];
  const count = 65;
  const colors = ['#22c55e', '#15803d', '#1e1b4b', '#6b21a8', '#84cc16'];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 0.4 + 0.1) * (radiusPx / 25);
    const maxLife = Math.random() * 60 + 40;

    particles.push({
      x: origin.x + (Math.random() * 20 - 10),
      y: origin.y + (Math.random() * 20 - 10),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.3,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.85,
      decay: 1 / maxLife,
      life: maxLife,
      maxLife,
    });
  }

  return {
    id: `anim-necromancy-${Date.now()}-${Math.random()}`,
    type: 'necromancy',
    school: 'Necromancy',
    origin,
    radiusPx,
    startTime: performance.now(),
    durationMs: 1800,
    particles,
    progress: 0,
  };
}

/**
 * 5. ENCHANTMENT (Hypnotic Spiral Wave & Sparkles)
 */
export function createEnchantmentAnimation(origin: Point2D, radiusPx: number): ActiveSpellAnimation {
  const particles: SpellParticle[] = [];
  const count = 50;
  const colors = ['#ec4899', '#f472b6', '#fbcfe8', '#ffffff', '#a855f7'];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 0.5 + 0.2) * (radiusPx / 28);
    const maxLife = Math.random() * 55 + 35;

    particles.push({
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 5 + 2.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1.0,
      decay: 1 / maxLife,
      life: maxLife,
      maxLife,
    });
  }

  return {
    id: `anim-enchantment-${Date.now()}-${Math.random()}`,
    type: 'enchantment',
    school: 'Enchantment',
    origin,
    radiusPx,
    startTime: performance.now(),
    durationMs: 1600,
    particles,
    progress: 0,
  };
}

/**
 * 6. ILLUSION (Prismatic Chromatic Shimmer)
 */
export function createIllusionAnimation(origin: Point2D, radiusPx: number): ActiveSpellAnimation {
  const particles: SpellParticle[] = [];
  const count = 50;
  const colors = ['#06b6d4', '#ec4899', '#eab308', '#8b5cf6', '#10b981'];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * radiusPx;
    const maxLife = Math.random() * 50 + 30;

    particles.push({
      x: origin.x + Math.cos(angle) * dist,
      y: origin.y + Math.sin(angle) * dist,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.9,
      decay: 1 / maxLife,
      life: maxLife,
      maxLife,
    });
  }

  return {
    id: `anim-illusion-${Date.now()}-${Math.random()}`,
    type: 'illusion',
    school: 'Illusion',
    origin,
    radiusPx,
    startTime: performance.now(),
    durationMs: 1600,
    particles,
    progress: 0,
  };
}

/**
 * 7. TRANSMUTATION (Alchemical Glyph Circle)
 */
export function createTransmutationAnimation(origin: Point2D, radiusPx: number): ActiveSpellAnimation {
  const particles: SpellParticle[] = [];
  const count = 50;
  const colors = ['#eab308', '#facc15', '#ca8a04', '#ffffff', '#f97316'];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = radiusPx * 0.85;
    const maxLife = Math.random() * 50 + 35;

    particles.push({
      x: origin.x + Math.cos(angle) * dist,
      y: origin.y + Math.sin(angle) * dist,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 5 + 2.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.95,
      decay: 1 / maxLife,
      life: maxLife,
      maxLife,
    });
  }

  return {
    id: `anim-transmutation-${Date.now()}-${Math.random()}`,
    type: 'transmutation',
    school: 'Transmutation',
    origin,
    radiusPx,
    startTime: performance.now(),
    durationMs: 1600,
    particles,
    progress: 0,
  };
}

/**
 * 8. DIVINATION (Starlit Celestial Eye Radiance)
 */
export function createDivinationAnimation(origin: Point2D, radiusPx: number): ActiveSpellAnimation {
  const particles: SpellParticle[] = [];
  const count = 45;
  const colors = ['#67e8f9', '#a5f3fc', '#ffffff', '#38bdf8', '#818cf8'];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 0.4 + 0.1) * (radiusPx / 25);
    const maxLife = Math.random() * 55 + 35;

    particles.push({
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1.0,
      decay: 1 / maxLife,
      life: maxLife,
      maxLife,
    });
  }

  return {
    id: `anim-divination-${Date.now()}-${Math.random()}`,
    type: 'divination',
    school: 'Divination',
    origin,
    radiusPx,
    startTime: performance.now(),
    durationMs: 1600,
    particles,
    progress: 0,
  };
}

/**
 * Factory helper to create spell animation by element, school, or shape
 */
export function createSchoolSpellAnimation(
  school: string,
  origin: Point2D,
  radiusPx: number,
  spellName?: string,
  target?: Point2D,
  element?: string
): ActiveSpellAnimation {
  const s = (school || 'Evocation').toLowerCase();
  const elem = (element || '').toLowerCase();
  const name = (spellName || '').toLowerCase();

  // 1. Element-specific overrides
  if (elem === 'lightning' || name.includes('lightning') || name.includes('bolt') || name.includes('beam')) {
    const targetPt = target || { x: origin.x + radiusPx, y: origin.y };
    return createLightningAnimation(origin, targetPt, radiusPx);
  }
  if (elem === 'cold' || name.includes('cold') || name.includes('frost') || name.includes('ice')) {
    return createFrostAnimation(origin, radiusPx);
  }
  if (elem === 'fire' || name.includes('fire') || name.includes('flame')) {
    return createFireballAnimation(origin, radiusPx);
  }
  if (elem === 'poison' || elem === 'acid' || elem === 'necrotic') {
    return createNecromancyAnimation(origin, radiusPx);
  }
  if (elem === 'radiant') {
    return createDivinationAnimation(origin, radiusPx);
  }
  if (elem === 'psychic') {
    return createEnchantmentAnimation(origin, radiusPx);
  }
  if (elem === 'force') {
    return createAbjurationAnimation(origin, radiusPx);
  }

  // 2. School-specific fallback
  switch (s) {
    case 'abjuration':
      return createAbjurationAnimation(origin, radiusPx);
    case 'conjuration':
      return createConjurationAnimation(origin, radiusPx);
    case 'necromancy':
      return createNecromancyAnimation(origin, radiusPx);
    case 'enchantment':
      return createEnchantmentAnimation(origin, radiusPx);
    case 'illusion':
      return createIllusionAnimation(origin, radiusPx);
    case 'transmutation':
      return createTransmutationAnimation(origin, radiusPx);
    case 'divination':
      return createDivinationAnimation(origin, radiusPx);
    case 'evocation':
    default:
      return createFireballAnimation(origin, radiusPx);
  }
}

/**
 * Updates physics and renders active spell animations onto canvas
 */
export function updateAndRenderSpellAnimations(
  ctx: CanvasRenderingContext2D,
  animations: ActiveSpellAnimation[],
  currentTime: number
): ActiveSpellAnimation[] {
  const active: ActiveSpellAnimation[] = [];

  for (const anim of animations) {
    const elapsed = currentTime - anim.startTime;
    const progress = Math.min(1, elapsed / anim.durationMs);
    anim.progress = progress;

    if (progress >= 1) continue; // Finished

    ctx.save();
    const alpha = Math.max(0, 1 - progress);

    // 1. School Shader & Aura Effects
    if (anim.type === 'fire' || anim.school === 'Evocation') {
      const currentRadius = anim.radiusPx * Math.min(1, progress * 1.3);
      ctx.beginPath();
      ctx.arc(anim.origin.x, anim.origin.y, currentRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(249, 115, 22, ${alpha * 0.85})`;
      ctx.lineWidth = 4 * (1 - progress);
      ctx.stroke();

      const grad = ctx.createRadialGradient(
        anim.origin.x, anim.origin.y, 0,
        anim.origin.x, anim.origin.y, currentRadius
      );
      grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`);
      grad.addColorStop(0.3, `rgba(245, 158, 11, ${alpha * 0.6})`);
      grad.addColorStop(0.8, `rgba(239, 68, 68, ${alpha * 0.3})`);
      grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = grad;
      ctx.fill();
    } else if (anim.type === 'abjuration' || anim.school === 'Abjuration') {
      // Hexagonal Runic Ward
      const currentRadius = anim.radiusPx * Math.min(1, progress * 1.15);
      ctx.beginPath();
      const sides = 6;
      for (let i = 0; i <= sides; i++) {
        const a = (i / sides) * Math.PI * 2 + progress;
        const x = anim.origin.x + Math.cos(a) * currentRadius;
        const y = anim.origin.y + Math.sin(a) * currentRadius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.9})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.2})`;
      ctx.fill();
    } else if (anim.type === 'conjuration' || anim.school === 'Conjuration') {
      // Swirling Vortex Ring
      const currentRadius = anim.radiusPx * Math.min(1, progress * 1.2);
      ctx.save();
      ctx.translate(anim.origin.x, anim.origin.y);
      ctx.rotate(progress * Math.PI * 3);
      ctx.beginPath();
      ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(168, 85, 247, ${alpha * 0.85})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    } else if (anim.type === 'necromancy' || anim.school === 'Necromancy') {
      // Dark Spectral Toxic Mist
      const currentRadius = anim.radiusPx * Math.min(1, progress * 1.3);
      const grad = ctx.createRadialGradient(
        anim.origin.x, anim.origin.y, 0,
        anim.origin.x, anim.origin.y, currentRadius
      );
      grad.addColorStop(0, `rgba(34, 197, 94, ${alpha * 0.7})`);
      grad.addColorStop(0.6, `rgba(15, 23, 42, ${alpha * 0.8})`);
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(anim.origin.x, anim.origin.y, currentRadius, 0, Math.PI * 2);
      ctx.fill();
    } else if (anim.type === 'enchantment' || anim.school === 'Enchantment') {
      // Hypnotic Spiral Rings
      const currentRadius = anim.radiusPx * Math.min(1, progress * 1.25);
      ctx.beginPath();
      ctx.arc(anim.origin.x, anim.origin.y, currentRadius * 0.5, 0, Math.PI * 2);
      ctx.arc(anim.origin.x, anim.origin.y, currentRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(236, 72, 153, ${alpha * 0.85})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else if (anim.type === 'transmutation' || anim.school === 'Transmutation') {
      // Alchemical Circle & Triangle
      const currentRadius = anim.radiusPx * Math.min(1, progress * 1.15);
      ctx.beginPath();
      ctx.arc(anim.origin.x, anim.origin.y, currentRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(234, 179, 8, ${alpha * 0.9})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 2. Render and update particles
    for (const p of anim.particles) {
      if (p.life <= 0) continue;

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life -= 1;
      p.alpha = Math.max(0, p.life / p.maxLife);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, p.size * (p.life / p.maxLife)), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
    active.push(anim);
  }

  return active;
}

/**
 * Renders continuous, smooth 60fps ambient visual effects on a slow loop for placed spell drawings
 */
export function renderLoopingSpellEffect(
  ctx: CanvasRenderingContext2D,
  drawing: MapDrawing,
  timeMs: number,
  pixelsPerFoot: number
): void {
  const p0 = drawing.points[0];
  if (!p0) return;

  const radFeet = drawing.radiusFeet || drawing.lengthFeet || 20;
  const radPx = radFeet * pixelsPerFoot;
  const angle = drawing.angle || 0;
  const t = timeMs * 0.001; // in seconds

  const school = (drawing.school || 'Evocation').toLowerCase();
  const elem = (drawing.element || '').toLowerCase();
  const name = (drawing.spellName || '').toLowerCase();

  ctx.save();

  // Helper clip to shape boundary
  const setupClip = () => {
    ctx.beginPath();
    if (drawing.type === 'sphere' || drawing.type === 'circle' || drawing.type === 'cylinder') {
      ctx.arc(p0.x, p0.y, radPx, 0, Math.PI * 2);
    } else if (drawing.type === 'cube' || drawing.type === 'rect') {
      const half = radPx / 2;
      ctx.rect(p0.x - half, p0.y - half, radPx, radPx);
    } else if (drawing.type === 'cone') {
      const spread = (53.13 * Math.PI) / 180;
      ctx.moveTo(p0.x, p0.y);
      ctx.arc(p0.x, p0.y, radPx, angle - spread / 2, angle + spread / 2);
      ctx.closePath();
    } else if (drawing.type === 'line') {
      const widthPx = Math.max(10, (drawing.widthFeet || 5) * pixelsPerFoot);
      ctx.save();
      ctx.translate(p0.x, p0.y);
      ctx.rotate(angle);
      ctx.rect(0, -widthPx / 2, radPx, widthPx);
      ctx.restore();
    }
  };

  // 1. FIRE / EVOCATION (Gentle Heat Waves, Ember Pulse)
  if (elem === 'fire' || name.includes('fire') || (elem === '' && school === 'evocation')) {
    const pulse = 1 + Math.sin(t * 2) * 0.04;
    const currentRadius = radPx * pulse;

    const grad = ctx.createRadialGradient(p0.x, p0.y, 0, p0.x, p0.y, currentRadius);
    grad.addColorStop(0, 'rgba(255, 230, 150, 0.45)');
    grad.addColorStop(0.3, 'rgba(249, 115, 22, 0.28)');
    grad.addColorStop(0.7, 'rgba(239, 68, 68, 0.18)');
    grad.addColorStop(1, 'rgba(185, 28, 28, 0.02)');

    ctx.fillStyle = grad;
    setupClip();
    ctx.fill();

    // Floating Ember Sparks
    const emberCount = 14;
    for (let i = 0; i < emberCount; i++) {
      const seed = i * 137.5;
      const speed = 0.35 + (i % 5) * 0.12;
      const progress = ((t * speed + i / emberCount) % 1);
      const angleE = seed + t * 0.25;
      const dist = (progress * 0.85 + 0.1) * radPx;
      const ex = p0.x + Math.cos(angleE) * dist;
      const ey = p0.y + Math.sin(angleE) * dist - progress * 15;
      const alpha = Math.sin(progress * Math.PI) * 0.85;

      ctx.beginPath();
      ctx.arc(ex, ey, 2 + (i % 3), 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? `rgba(253, 224, 71, ${alpha})` : `rgba(249, 115, 22, ${alpha})`;
      ctx.fill();
    }
  }

  // 2. COLD / ICE (Crystalline Frost Shimmer & Rotating Snowflakes)
  else if (elem === 'cold' || name.includes('cold') || name.includes('ice') || name.includes('frost')) {
    const grad = ctx.createRadialGradient(p0.x, p0.y, 0, p0.x, p0.y, radPx);
    grad.addColorStop(0, 'rgba(224, 242, 254, 0.45)');
    grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.25)');
    grad.addColorStop(1, 'rgba(2, 132, 199, 0.05)');

    ctx.fillStyle = grad;
    setupClip();
    ctx.fill();

    // Shimmering Ice Crystals
    const crystalCount = 10;
    for (let i = 0; i < crystalCount; i++) {
      const a = (i / crystalCount) * Math.PI * 2 + t * 0.15;
      const dist = (0.35 + (i % 3) * 0.25) * radPx;
      const cx = p0.x + Math.cos(a) * dist;
      const cy = p0.y + Math.sin(a) * dist;
      const alpha = 0.4 + Math.sin(t * 3 + i) * 0.35;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.4 + i);
      ctx.strokeStyle = `rgba(186, 230, 253, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-4, 0); ctx.lineTo(4, 0);
      ctx.moveTo(0, -4); ctx.lineTo(0, 4);
      ctx.stroke();
      ctx.restore();
    }
  }

  // 3. LIGHTNING / THUNDER (Electric Arc Pulses & Spark Discharges)
  else if (elem === 'lightning' || elem === 'thunder' || name.includes('lightning')) {
    const pulse = 1 + Math.sin(t * 4) * 0.03;
    const grad = ctx.createRadialGradient(p0.x, p0.y, 0, p0.x, p0.y, radPx * pulse);
    grad.addColorStop(0, 'rgba(207, 250, 254, 0.45)');
    grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.22)');
    grad.addColorStop(1, 'rgba(14, 116, 144, 0.04)');

    ctx.fillStyle = grad;
    setupClip();
    ctx.fill();

    // Crackling Lightning Arcs (subtle periodic discharge)
    if (Math.sin(t * 7) > -0.2) {
      const numBolts = 3;
      ctx.strokeStyle = 'rgba(165, 243, 252, 0.85)';
      ctx.lineWidth = 1.6;
      for (let b = 0; b < numBolts; b++) {
        const a = (b / numBolts) * Math.PI * 2 + Math.sin(t * 2 + b);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        for (let s = 1; s <= 4; s++) {
          const segDist = (s / 4) * radPx * 0.85;
          const jitter = (Math.sin(t * 12 + b * 4 + s) * 10);
          const nx = p0.x + Math.cos(a) * segDist + Math.sin(a) * jitter;
          const ny = p0.y + Math.sin(a) * segDist - Math.cos(a) * jitter;
          ctx.lineTo(nx, ny);
        }
        ctx.stroke();
      }
    }
  }

  // 4. RADIANT (Celestial Sunburst & Rotating Holy Rays)
  else if (elem === 'radiant' || school === 'divination' || name.includes('spirit') || name.includes('moonbeam')) {
    const grad = ctx.createRadialGradient(p0.x, p0.y, 0, p0.x, p0.y, radPx);
    grad.addColorStop(0, 'rgba(254, 240, 138, 0.5)');
    grad.addColorStop(0.4, 'rgba(250, 204, 21, 0.25)');
    grad.addColorStop(1, 'rgba(234, 179, 8, 0.04)');

    ctx.fillStyle = grad;
    setupClip();
    ctx.fill();

    // Rotating Sunburst Rays
    const numRays = 8;
    ctx.save();
    ctx.translate(p0.x, p0.y);
    ctx.rotate(t * 0.2);
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.3)';
    ctx.lineWidth = 1.8;
    for (let i = 0; i < numRays; i++) {
      const a = (i / numRays) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * radPx * 0.9, Math.sin(a) * radPx * 0.9);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 5. NECROMANCY / POISON / ACID (Undulating Toxic Mist Clouds)
  else if (elem === 'necrotic' || elem === 'poison' || elem === 'acid' || school === 'necromancy') {
    const isPoison = elem === 'poison' || elem === 'acid';
    const grad = ctx.createRadialGradient(p0.x, p0.y, 0, p0.x, p0.y, radPx);
    if (isPoison) {
      grad.addColorStop(0, 'rgba(74, 222, 128, 0.45)');
      grad.addColorStop(0.5, 'rgba(22, 163, 74, 0.25)');
      grad.addColorStop(1, 'rgba(5, 46, 22, 0.04)');
    } else {
      grad.addColorStop(0, 'rgba(192, 132, 252, 0.4)');
      grad.addColorStop(0.5, 'rgba(88, 28, 135, 0.28)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.04)');
    }

    ctx.fillStyle = grad;
    setupClip();
    ctx.fill();

    // Drifting Mist Wisps
    const mistCount = 7;
    for (let i = 0; i < mistCount; i++) {
      const a = (i / mistCount) * Math.PI * 2 + t * 0.18;
      const dist = (0.2 + Math.sin(t * 0.7 + i) * 0.35 + 0.3) * radPx * 0.75;
      const mx = p0.x + Math.cos(a) * dist;
      const my = p0.y + Math.sin(a) * dist;
      const blobRadius = 12 + (i % 4) * 6;

      ctx.beginPath();
      ctx.arc(mx, my, blobRadius, 0, Math.PI * 2);
      ctx.fillStyle = isPoison ? 'rgba(74, 222, 128, 0.18)' : 'rgba(168, 85, 247, 0.16)';
      ctx.fill();
    }
  }

  // 6. ENCHANTMENT / PSYCHIC (Rotating Hypnotic Spiral Rings)
  else if (elem === 'psychic' || school === 'enchantment') {
    const grad = ctx.createRadialGradient(p0.x, p0.y, 0, p0.x, p0.y, radPx);
    grad.addColorStop(0, 'rgba(244, 114, 182, 0.45)');
    grad.addColorStop(0.6, 'rgba(219, 39, 119, 0.2)');
    grad.addColorStop(1, 'rgba(157, 23, 77, 0.04)');

    ctx.fillStyle = grad;
    setupClip();
    ctx.fill();

    // Hypnotic Spiral
    ctx.save();
    ctx.translate(p0.x, p0.y);
    ctx.rotate(t * 0.45);
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.45)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let theta = 0; theta < Math.PI * 6; theta += 0.25) {
      const r = (theta / (Math.PI * 6)) * radPx * 0.85;
      const sx = Math.cos(theta) * r;
      const sy = Math.sin(theta) * r;
      if (theta === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 7. ABJURATION / FORCE (Pulsing Runic Hexagonal Forcefield)
  else if (elem === 'force' || school === 'abjuration') {
    const pulse = 1 + Math.sin(t * 2) * 0.03;
    const curRad = radPx * pulse;

    const grad = ctx.createRadialGradient(p0.x, p0.y, 0, p0.x, p0.y, curRad);
    grad.addColorStop(0, 'rgba(186, 230, 253, 0.4)');
    grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.2)');
    grad.addColorStop(1, 'rgba(2, 132, 199, 0.04)');

    ctx.fillStyle = grad;
    setupClip();
    ctx.fill();

    // Rotating Hexagonal Ward
    ctx.save();
    ctx.translate(p0.x, p0.y);
    ctx.rotate(t * 0.18);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const hx = Math.cos(a) * radPx * 0.8;
      const hy = Math.sin(a) * radPx * 0.8;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 8. CONJURATION / TRANSMUTATION / ILLUSION (Dimensional Vortex & Glyphs)
  else {
    const grad = ctx.createRadialGradient(p0.x, p0.y, 0, p0.x, p0.y, radPx);
    grad.addColorStop(0, 'rgba(216, 180, 254, 0.45)');
    grad.addColorStop(0.6, 'rgba(147, 51, 234, 0.2)');
    grad.addColorStop(1, 'rgba(88, 28, 135, 0.04)');

    ctx.fillStyle = grad;
    setupClip();
    ctx.fill();

    // Swirling Portal Rings
    ctx.save();
    ctx.translate(p0.x, p0.y);
    ctx.rotate(-t * 0.35);
    ctx.strokeStyle = 'rgba(216, 180, 254, 0.5)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, radPx * 0.65, 0, Math.PI * 1.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, radPx * 0.35, Math.PI * 0.5, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

