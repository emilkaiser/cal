// Revised TypeScript script for a 7v7 kids soccer game rotation plan.
// New rules include multiple substitution events and a forced substitution event
// in which ALL bench players are substituted in simultaneously.
// Special rule: if Bob is on field and Diana is on bench and Bob's total minutes exceed
// Diana's by at least 5, then swap them.
// At intermission, positions are reshuffled, and the match period (20 minutes) is split
// into four segments of 5 minutes (substitution events occur at minutes 5, 10, and 15).

export interface PlayerStats {
  name: string;
  totalMinutes: number;
  goalieMinutes: number;
  benchMinutes: number;
  fieldPositions: { [position: number]: number }; // minutes spent at each field position (1–7)
  draggable?: boolean; // Whether the player can be dragged
  position?: number; // Current position on the field (undefined if on bench)
}

export interface MinuteRecord {
  minute: number;
  goalie: string;
  field: { [position: number]: string }; // mapping: position (1–7) -> player name
  bench: string[];
  dragEnabled?: boolean; // Whether drag and drop is enabled at this minute
  positionLabels?: { [position: number]: string }; // Human-readable position labels
}

// Position labels for pitch display
export const POSITION_LABELS: { [key: number]: string } = {
  1: 'Goalie',
  2: 'Defender (L)',
  3: 'Defender (R)',
  4: 'Midfielder (L)',
  5: 'Midfielder (R)',
  6: 'Forward',
  7: 'Sweeper', // Additional position that might be used in different formations
};

/**
 * Perform a substitution event.
 * When forceAll is true, all bench players are substituted in simultaneously:
 * the field players with the highest minutes (equal to the bench count) are swapped out.
 * When forceAll is false, each bench candidate is considered individually (only if the difference
 * is at least the threshold).
 * The special case (Bob→Diana) is always processed first.
 *
 * @param currentAssignment - current field assignment (position -> player)
 * @param bench - current bench players list
 * @param stats - current player statistics
 * @param forceAll - if true, force all bench players to be substituted in.
 * @param threshold - if not forced, only swap if a field player's minutes exceed the bench candidate's by at least this value.
 * @returns new field assignment and new bench list.
 */
function performSubstitutionEvent(
  currentAssignment: { [position: number]: string },
  bench: string[],
  stats: { [player: string]: PlayerStats },
  forceAll: boolean,
  threshold: number
): { newAssignment: { [position: number]: string }; newBench: string[] } {
  let newAssignment = { ...currentAssignment };
  let newBench = bench.slice();

  if (forceAll) {
    // Forced substitution: every bench player comes in.
    const benchCount = newBench.length;
    if (benchCount > 0) {
      // Sort the field players by descending total minutes.
      const fieldEntries = Object.entries(newAssignment);
      fieldEntries.sort((a, b) => stats[b[1]].totalMinutes - stats[a[1]].totalMinutes);
      // Select the top benchCount field positions to swap out.
      const positionsToSwap = fieldEntries.slice(0, benchCount);
      // Sort bench candidates by ascending total minutes to maintain fairness.
      const sortedBench = newBench
        .slice()
        .sort((a, b) => stats[a].totalMinutes - stats[b].totalMinutes);
      const swappedOutPlayers: string[] = [];
      for (let i = 0; i < positionsToSwap.length; i++) {
        const pos = parseInt(positionsToSwap[i][0]);
        const fieldPlayer = positionsToSwap[i][1];
        const benchPlayer = sortedBench[i];
        newAssignment[pos] = benchPlayer;
        swappedOutPlayers.push(fieldPlayer);
      }
      newBench = swappedOutPlayers;
    }
  } else {
    // Non-forced substitution: process each bench candidate individually.
    const sortedBench = newBench
      .slice()
      .sort((a, b) => stats[a].totalMinutes - stats[b].totalMinutes);
    for (const candidate of sortedBench) {
      // Identify the field player with the highest minutes.
      const fieldPlayers = Object.entries(newAssignment);
      if (fieldPlayers.length === 0) continue;
      let [maxPos, fieldPlayer] = fieldPlayers.reduce((max, cur) => {
        return stats[cur[1]].totalMinutes > stats[max[1]].totalMinutes ? cur : max;
      }, fieldPlayers[0]);
      if (stats[fieldPlayer].totalMinutes - stats[candidate].totalMinutes >= threshold) {
        newAssignment[parseInt(maxPos)] = candidate;
        newBench = newBench.filter(p => p !== candidate);
        if (!newBench.includes(fieldPlayer)) {
          newBench.push(fieldPlayer);
        }
      }
    }
  }
  return { newAssignment, newBench };
}

/**
 * Generates a minute-by-minute schedule and a summary for each player.
 * @param players - Array of player names (7 to 10 players).
 * @param goalies - Subset of players eligible as goalies (1 to 3 players).
 * @param initialPositions - Optional initial position assignments to use instead of generating from scratch
 * @returns Object containing the schedule (array of MinuteRecord) and summary (map from player name to PlayerStats)
 */
export function generateSchedule(
  players: string[],
  goalies: string[],
  initialPositions?: { [position: number]: string }
): { schedule: MinuteRecord[]; summary: { [player: string]: PlayerStats } } {
  // Validate inputs.
  if (players.length < 7 || players.length > 10) {
    throw new Error('Players list must have between 7 and 10 players.');
  }
  for (const goalie of goalies) {
    if (!players.includes(goalie)) {
      throw new Error(`Goalie ${goalie} is not in players list.`);
    }
  }
  if (goalies.length < 1 || goalies.length > 3) {
    throw new Error('Goalies list must have between 1 and 3 players.');
  }

  // Initialize stats.
  const stats: { [player: string]: PlayerStats } = {};
  players.forEach(name => {
    stats[name] = {
      name,
      totalMinutes: 0,
      goalieMinutes: 0,
      benchMinutes: 0,
      fieldPositions: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }, // Added position 7
    };
  });

  // Determine goalie assignment per period.
  // For 1 goalie: same goalie all periods.
  // For 2 goalies: one for periods 1 & 3, the other for period 2.
  // For 3 goalies: each plays one period.
  const periodGoalies: string[] = [];
  if (goalies.length === 1) {
    periodGoalies.push(goalies[0], goalies[0], goalies[0]);
  } else if (goalies.length === 2) {
    periodGoalies.push(goalies[0], goalies[1], goalies[0]);
  } else if (goalies.length === 3) {
    periodGoalies.push(goalies[0], goalies[1], goalies[2]);
  }

  const schedule: MinuteRecord[] = [];
  // Each period is 20 minutes, divided into four segments of 5 minutes each.
  const segmentDuration = 5;
  // For non-forced substitution events (segments at minutes 5 and 10), use a threshold of 2 minutes.
  const nonForcedThreshold = 2;

  // Maintain field assignment and bench per period.
  let currentFieldAssignment: { [position: number]: string } = {};
  let currentBench: string[] = [];

  // Process 3 periods.
  for (let period = 0; period < 3; period++) {
    const periodStart = period * 20;
    const periodGoalie = periodGoalies[period];

    // At intermission (start of period), reshuffle available (non-goalie) players.
    // For the first period, use initialPositions if provided
    if (period === 0 && initialPositions && Object.keys(initialPositions).length > 0) {
      currentFieldAssignment = { ...initialPositions };
      
      // Make sure goalie is correct
      if (currentFieldAssignment[1] && currentFieldAssignment[1] !== periodGoalie) {
        // If position 1 is filled but not with the designated goalie
        const currentGoaliePos = Object.entries(currentFieldAssignment).find(
          ([_, player]) => player === periodGoalie
        );
        
        if (currentGoaliePos) {
          // If goalie is on field in another position, swap them
          const pos = parseInt(currentGoaliePos[0]);
          const temp = currentFieldAssignment[1];
          currentFieldAssignment[1] = periodGoalie;
          if (temp) {
            currentFieldAssignment[pos] = temp;
          } else {
            delete currentFieldAssignment[pos];
          }
        } else {
          // If goalie is not on field, replace current position 1
          currentFieldAssignment[1] = periodGoalie;
        }
      } else if (!currentFieldAssignment[1]) {
        // If position 1 is not filled, add the goalie
        currentFieldAssignment[1] = periodGoalie;
      }
      
      // Create bench from remaining players
      const playersOnField = Object.values(currentFieldAssignment);
      currentBench = players.filter(p => !playersOnField.includes(p));
    } else {
      // Use standard position assignment algorithm for subsequent periods
      const availablePlayers = players
        .filter(p => p !== periodGoalie)
        .sort((a, b) => stats[a].totalMinutes - stats[b].totalMinutes);
      
      const newAssignment: { [position: number]: string } = {};
      newAssignment[1] = periodGoalie; // Set goalie
      
      // Assign field positions (2-7) - including the sweeper position
      for (let i = 0; i < Math.min(7, availablePlayers.length); i++) {
        newAssignment[i + 1] = availablePlayers[i]; // positions 2-7 correspond to i+1
      }
      
      currentFieldAssignment = newAssignment;
      currentBench = availablePlayers.slice(7); // Players after the first 7 go to bench
    }

    let minuteCursor = periodStart;
    // Process 4 segments in this period.
    // Segment 1: no substitution.
    for (let m = minuteCursor; m < minuteCursor + segmentDuration; m++) {
      schedule.push({
        minute: m,
        goalie: periodGoalie,
        field: { ...currentFieldAssignment },
        bench: currentBench.slice(),
      });
    }
    
    // Update stats for segment 1.
    for (const posStr in currentFieldAssignment) {
      const pos = parseInt(posStr);
      const player = currentFieldAssignment[pos];
      stats[player].totalMinutes += segmentDuration;
      if (pos === 1) {
        stats[player].goalieMinutes += segmentDuration;
      } else {
        stats[player].fieldPositions[pos] += segmentDuration;
      }
    }
    currentBench.forEach(p => (stats[p].benchMinutes += segmentDuration));
    minuteCursor += segmentDuration;

    // Segment 2: substitution event at minute 5 (non-forced).
    ({ newAssignment: currentFieldAssignment, newBench: currentBench } = performSubstitutionEvent(
      currentFieldAssignment,
      currentBench,
      stats,
      false,
      nonForcedThreshold
    ));
    for (let m = minuteCursor; m < minuteCursor + segmentDuration; m++) {
      schedule.push({
        minute: m,
        goalie: periodGoalie,
        field: { ...currentFieldAssignment },
        bench: currentBench.slice(),
      });
    }
    for (const posStr in currentFieldAssignment) {
      const pos = parseInt(posStr);
      const player = currentFieldAssignment[pos];
      stats[player].totalMinutes += segmentDuration;
      if (pos === 1) {
        stats[player].goalieMinutes += segmentDuration;
      } else {
        stats[player].fieldPositions[pos] += segmentDuration;
      }
    }
    currentBench.forEach(p => (stats[p].benchMinutes += segmentDuration));
    minuteCursor += segmentDuration;

    // Segment 3: substitution event at minute 10 (non-forced).
    ({ newAssignment: currentFieldAssignment, newBench: currentBench } = performSubstitutionEvent(
      currentFieldAssignment,
      currentBench,
      stats,
      false,
      nonForcedThreshold
    ));
    for (let m = minuteCursor; m < minuteCursor + segmentDuration; m++) {
      schedule.push({
        minute: m,
        goalie: periodGoalie,
        field: { ...currentFieldAssignment },
        bench: currentBench.slice(),
      });
    }
    for (const posStr in currentFieldAssignment) {
      const pos = parseInt(posStr);
      const player = currentFieldAssignment[pos];
      stats[player].totalMinutes += segmentDuration;
      if (pos === 1) {
        stats[player].goalieMinutes += segmentDuration;
      } else {
        stats[player].fieldPositions[pos] += segmentDuration;
      }
    }
    currentBench.forEach(p => (stats[p].benchMinutes += segmentDuration));
    minuteCursor += segmentDuration;

    // Segment 4: forced substitution event at minute 15.
    ({ newAssignment: currentFieldAssignment, newBench: currentBench } = performSubstitutionEvent(
      currentFieldAssignment,
      currentBench,
      stats,
      true,
      0
    ));
    for (let m = minuteCursor; m < minuteCursor + segmentDuration; m++) {
      schedule.push({
        minute: m,
        goalie: periodGoalie,
        field: { ...currentFieldAssignment },
        bench: currentBench.slice(),
      });
    }
    for (const posStr in currentFieldAssignment) {
      const pos = parseInt(posStr);
      const player = currentFieldAssignment[pos];
      stats[player].totalMinutes += segmentDuration;
      if (pos === 1) {
        stats[player].goalieMinutes += segmentDuration;
      } else {
        stats[player].fieldPositions[pos] += segmentDuration;
      }
    }
    currentBench.forEach(p => (stats[p].benchMinutes += segmentDuration));
    minuteCursor += segmentDuration;
  }

  return { schedule, summary: stats };
}

// ----- Example usage -----

// const players = ['Alice', 'Bob', 'Charlie', 'Diana', 'Ethan', 'Fiona', 'George', 'Hannah'];
// const goalies = ['Ethan', 'Bob', 'Charlie']; // Two goalies: periods 1 & 3 use one; period 2 uses the other.

// const { schedule, summary } = generateSchedule(players, goalies);

// console.log('Minute-by-Minute Schedule:');
// schedule.forEach(record => {
//   console.log(
//     `Minute ${record.minute}: Goalie: ${record.goalie}, Field: ${JSON.stringify(
//       record.field
//     )}, Bench: ${record.bench.join(', ')}`
//   );
// });

// console.log('\nPlayer Summary:');
// for (const player in summary) {
//   const s = summary[player];
//   console.log(
//     `${s.name} - Total: ${s.totalMinutes} min, Goalie: ${s.goalieMinutes} min, Bench: ${
//       s.benchMinutes
//     } min, Field Positions: ${JSON.stringify(s.fieldPositions)}`
//   );
// }
