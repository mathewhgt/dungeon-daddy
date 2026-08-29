export interface RollBreakdown {
  expression: string;
  total: number;
  rolls: {
    dice: string; // e.g. "2d6"
    results: number[];
    subtotal: number;
  }[];
  modifier: number;
  isCrit?: boolean;
  isFumble?: boolean;
  details: string; // e.g. "[18] + 5 = 23"
}

export function rollDice(
  formula: string,
  options?: {
    advantage?: boolean;
    disadvantage?: boolean;
    isCrit?: boolean;
  }
): RollBreakdown {
  const cleanFormula = formula.replace(/\s+/g, '');
  
  // Check if it's a d20 roll with advantage/disadvantage
  if (options?.advantage || options?.disadvantage) {
    const d20Roll1 = Math.floor(Math.random() * 20) + 1;
    const d20Roll2 = Math.floor(Math.random() * 20) + 1;
    
    let chosenRoll = options.advantage ? Math.max(d20Roll1, d20Roll2) : Math.min(d20Roll1, d20Roll2);
    
    // Extract static modifier
    let mod = 0;
    const modMatch = cleanFormula.match(/([+-]\d+)$/);
    if (modMatch) {
      mod = parseInt(modMatch[1], 10);
    }

    const total = chosenRoll + mod;
    const isCrit = chosenRoll === 20;
    const isFumble = chosenRoll === 1;

    const advText = options.advantage ? 'Advantage' : 'Disadvantage';
    const droppedRoll = options.advantage ? Math.min(d20Roll1, d20Roll2) : Math.max(d20Roll1, d20Roll2);

    return {
      expression: `${formula} (${advText})`,
      total,
      rolls: [
        {
          dice: '1d20',
          results: [chosenRoll],
          subtotal: chosenRoll,
        },
      ],
      modifier: mod,
      isCrit,
      isFumble,
      details: `[${chosenRoll} (dropped ${droppedRoll})] ${mod >= 0 ? `+ ${mod}` : `- ${Math.abs(mod)}`} = ${total}`,
    };
  }

  // Parse standard dice notation: e.g. "3d6 + 1d4 + 5" or "1d20+7"
  const terms = cleanFormula.match(/[+-]?[^+-]+/g) || ['1d20'];
  let total = 0;
  let modifier = 0;
  const rolls: RollBreakdown['rolls'] = [];
  const detailsParts: string[] = [];

  let isD20Single = false;
  let d20NaturalRoll = 0;

  for (const term of terms) {
    const isNegative = term.startsWith('-');
    const cleanTerm = term.replace(/^[+-]/, '');

    // Dice term: "2d6"
    const diceMatch = cleanTerm.match(/^(\d*)d(\d+)/i);
    if (diceMatch) {
      let count = parseInt(diceMatch[1] || '1', 10);
      const sides = parseInt(diceMatch[2], 10);

      // Crit doubles dice count
      if (options?.isCrit) {
        count *= 2;
      }

      const results: number[] = [];
      let subtotal = 0;

      for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        results.push(roll);
        subtotal += roll;
      }

      if (sides === 20 && count === 1) {
        isD20Single = true;
        d20NaturalRoll = results[0];
      }

      if (isNegative) {
        total -= subtotal;
        detailsParts.push(`-[${results.join(', ')}]`);
      } else {
        total += subtotal;
        detailsParts.push(`[${results.join(', ')}]`);
      }

      rolls.push({
        dice: `${count}d${sides}`,
        results,
        subtotal: isNegative ? -subtotal : subtotal,
      });
    } else {
      // Flat number
      const num = parseInt(cleanTerm, 10);
      if (!isNaN(num)) {
        if (isNegative) {
          modifier -= num;
          total -= num;
          detailsParts.push(`- ${num}`);
        } else {
          modifier += num;
          total += num;
          detailsParts.push(`+ ${num}`);
        }
      }
    }
  }

  const isCrit = isD20Single && d20NaturalRoll === 20;
  const isFumble = isD20Single && d20NaturalRoll === 1;

  return {
    expression: formula + (options?.isCrit ? ' (CRIT!)' : ''),
    total,
    rolls,
    modifier,
    isCrit,
    isFumble,
    details: `${detailsParts.join(' ')} = ${total}`,
  };
}
