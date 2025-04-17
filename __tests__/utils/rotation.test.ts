import {
  calculateTargetFieldMinutes,
  generatePlayerList,
  initializeFieldMinutes,
  assignBenchPeriods,
  buildRotationSchedule,
  formatSchedule,
  RotationConfig,
  DEFAULT_CONFIG,
} from '../../src/cli/rotation';

describe('Player rotation functionality', () => {
  describe('generatePlayerList', () => {
    it('should generate a list of players with the correct length', () => {
      expect(generatePlayerList(5)).toHaveLength(5);
      expect(generatePlayerList(10)).toHaveLength(10);
    });

    it('should generate player names with the correct format', () => {
      const players = generatePlayerList(3);
      expect(players).toEqual(['Player 1', 'Player 2', 'Player 3']);
    });
  });

  describe('calculateTargetFieldMinutes', () => {
    const config: RotationConfig = {
      numPeriods: 3,
      periodLength: 20,
      fieldPlayersOnPitch: 6,
    };

    it('should calculate correct minutes for fixed goalie mode', () => {
      // Fixed goalie: total field minutes / (total players - 1)
      const totalFieldMinutes =
        config.numPeriods * config.periodLength * config.fieldPlayersOnPitch;
      const totalPlayers = 8;

      expect(calculateTargetFieldMinutes(config, totalPlayers, true)).toBe(
        totalFieldMinutes / (totalPlayers - 1)
      );
    });

    it('should calculate correct minutes for rotating goalie mode', () => {
      // Rotating goalie: total field minutes / total players
      const totalFieldMinutes =
        config.numPeriods * config.periodLength * config.fieldPlayersOnPitch;
      const totalPlayers = 8;

      expect(calculateTargetFieldMinutes(config, totalPlayers, false)).toBe(
        totalFieldMinutes / totalPlayers
      );
    });
  });

  describe('initializeFieldMinutes', () => {
    it('should initialize field minutes to zero for all players', () => {
      const players = ['Player 1', 'Player 2', 'Player 3'];
      const fieldMinutes = initializeFieldMinutes(players);

      expect(fieldMinutes).toEqual({
        'Player 1': 0,
        'Player 2': 0,
        'Player 3': 0,
      });
    });
  });

  describe('assignBenchPeriods', () => {
    it('should assign bench periods correctly for a balanced team size', () => {
      const players = generatePlayerList(8);
      const goalies = ['Player 3', 'Player 4', 'Player 8'];
      const benchAssignment = assignBenchPeriods(
        players,
        goalies,
        players.length,
        DEFAULT_CONFIG.fieldPlayersOnPitch,
        DEFAULT_CONFIG.numPeriods
      );

      // Check if each non-goalie player is either assigned a bench period or not assigned
      const nonGoalies = players.filter(p => !goalies.includes(p));

      // Count how many non-goalies have bench assignments
      let assignedPlayers = 0;
      nonGoalies.forEach(player => {
        if (benchAssignment[player]) {
          assignedPlayers++;
          expect(benchAssignment[player]).toBeGreaterThanOrEqual(1);
          expect(benchAssignment[player]).toBeLessThanOrEqual(DEFAULT_CONFIG.numPeriods);
        }
      });

      // Calculate the expected number of bench slots
      const benchCountPerPeriod = players.length - 1 - DEFAULT_CONFIG.fieldPlayersOnPitch;
      const totalBenchSlots = DEFAULT_CONFIG.numPeriods * benchCountPerPeriod;

      // There should be as many assigned players as there are bench slots
      expect(assignedPlayers).toBe(Math.min(nonGoalies.length, totalBenchSlots));

      // Check if bench assignments are evenly distributed
      const benchCounts = [0, 0, 0];
      Object.values(benchAssignment).forEach(period => {
        benchCounts[period - 1]++;
      });

      // The bench count distribution should be as even as possible
      expect(Math.max(...benchCounts) - Math.min(...benchCounts)).toBeLessThanOrEqual(1);
    });
  });

  describe('buildRotationSchedule', () => {
    it('should create a valid schedule for fixed goalie', () => {
      const players = generatePlayerList(8);
      const goalies = ['Player 1']; // Fixed goalie
      const config: RotationConfig = { ...DEFAULT_CONFIG };

      const result = buildRotationSchedule(players, goalies, config);

      // Check schedule length
      expect(result.schedule).toHaveLength(config.numPeriods);

      // Check correct goalie assignment
      result.schedule.forEach(period => {
        expect(period.goalie).toBe(goalies[0]);
      });

      // Check that field minutes are properly tracked
      const expectedTotalFieldMinutes =
        config.numPeriods * config.periodLength * config.fieldPlayersOnPitch;
      const actualTotalFieldMinutes = Object.values(result.fieldMinutes).reduce(
        (sum, minutes) => sum + minutes,
        0
      );
      expect(actualTotalFieldMinutes).toBe(expectedTotalFieldMinutes);
    });

    it('should create a valid schedule for rotating goalies', () => {
      const players = generatePlayerList(8);
      const goalies = ['Player 1', 'Player 2', 'Player 3']; // Rotating goalies
      const config: RotationConfig = { ...DEFAULT_CONFIG };

      // Pre-assign bench periods
      const benchAssignment = assignBenchPeriods(
        players,
        goalies,
        players.length,
        config.fieldPlayersOnPitch,
        config.numPeriods
      );

      const result = buildRotationSchedule(players, goalies, config, benchAssignment);

      // Check schedule length
      expect(result.schedule).toHaveLength(config.numPeriods);

      // Check rotating goalie assignment
      for (let i = 0; i < config.numPeriods; i++) {
        expect(result.schedule[i].goalie).toBe(goalies[i % goalies.length]);
      }

      // Check that all players are either goalie, on field, or on bench in each period
      result.schedule.forEach(period => {
        players.forEach(player => {
          const isGoalie = period.goalie === player;
          const isOnField = period.fieldPlayers.includes(player);
          const isOnBench = period.benchPlayers.includes(player);

          // Each player should be in exactly one position
          expect(isGoalie || isOnField || isOnBench).toBeTruthy();
          expect((isGoalie ? 1 : 0) + (isOnField ? 1 : 0) + (isOnBench ? 1 : 0)).toBe(1);
        });
      });
    });

    it('should distribute field minutes as equally as possible among players', () => {
      const players = generatePlayerList(8);
      const goalies = ['Player 1', 'Player 2', 'Player 3']; // Rotating goalies
      const config: RotationConfig = { ...DEFAULT_CONFIG };

      const benchAssignment = assignBenchPeriods(
        players,
        goalies,
        players.length,
        config.fieldPlayersOnPitch,
        config.numPeriods
      );

      const result = buildRotationSchedule(players, goalies, config, benchAssignment);

      // Get all field minutes values
      const minuteValues = Object.values(result.fieldMinutes);

      // Calculate the difference between max and min minutes
      const maxMinutes = Math.max(...minuteValues);
      const minMinutes = Math.min(...minuteValues);
      const difference = maxMinutes - minMinutes;

      // The difference should be small (at most one period's worth)
      expect(difference).toBeLessThanOrEqual(config.periodLength);

      // Check that the average is close to the target
      const averageMinutes = minuteValues.reduce((sum, val) => sum + val, 0) / minuteValues.length;
      expect(Math.abs(averageMinutes - result.targetFieldMinutes)).toBeLessThan(1);
    });
  });

  describe('formatSchedule', () => {
    it('should format the schedule correctly', () => {
      const players = generatePlayerList(4);
      const goalies = ['Player 1'];
      const config: RotationConfig = {
        numPeriods: 2,
        periodLength: 10,
        fieldPlayersOnPitch: 2,
      };

      const result = buildRotationSchedule(players, goalies, config);
      const formatted = formatSchedule(result);

      // Basic check that format contains expected sections
      expect(formatted).toContain('Rotation Schedule:');
      expect(formatted).toContain('Period 1:');
      expect(formatted).toContain('Period 2:');
      expect(formatted).toContain('Goalie:');
      expect(formatted).toContain('Field Players:');
      expect(formatted).toContain('Bench:');
      expect(formatted).toContain('Accumulated Field Minutes per Player:');
    });
  });

  describe('Regression tests', () => {
    it('should correctly balance field minutes for 8 players with 3 rotating goalies', () => {
      // This test replicates the specific issue where players weren't getting equal minutes
      const players = generatePlayerList(8);
      const goalies = ['Player 3', 'Player 4', 'Player 8']; // Rotating goalies
      const config: RotationConfig = { ...DEFAULT_CONFIG };
      const targetMinutes = calculateTargetFieldMinutes(config, players.length, false);

      // Pre-assign bench periods
      const benchAssignment = assignBenchPeriods(
        players,
        goalies,
        players.length,
        config.fieldPlayersOnPitch,
        config.numPeriods
      );

      const result = buildRotationSchedule(players, goalies, config, benchAssignment);

      // Check that the target is correctly calculated to 45 minutes
      expect(Math.round(result.targetFieldMinutes)).toBe(45);

      // Get all field minutes values
      const minuteValues = Object.values(result.fieldMinutes);

      // Check that no player deviates from target by more than half a period
      minuteValues.forEach(minutes => {
        expect(Math.abs(minutes - targetMinutes)).toBeLessThanOrEqual(config.periodLength / 2);
      });

      // Check that the difference between max and min playing time is minimal
      const maxMinutes = Math.max(...minuteValues);
      const minMinutes = Math.min(...minuteValues);
      const difference = maxMinutes - minMinutes;

      // The difference should be at most half a period
      expect(difference).toBeLessThanOrEqual(config.periodLength / 2);

      // Calculate the number of players with balanced minutes
      const playersWithExpectedMinutes = minuteValues.filter(
        minutes => Math.abs(minutes - targetMinutes) <= 5
      ).length;

      // At least 6 out of 8 players should have minutes within 5 minutes of target
      expect(playersWithExpectedMinutes).toBeGreaterThanOrEqual(6);
    });

    // Add tests for different team sizes and goalie configurations
    const teamSizesToTest = [7, 8, 9, 10];
    const goalieConfigurations = [
      { description: 'fixed goalie', goalies: 1 },
      { description: '2 rotating goalies', goalies: 2 },
      { description: '3 rotating goalies', goalies: 3 },
    ];

    teamSizesToTest.forEach(teamSize => {
      goalieConfigurations.forEach(({ description, goalies: goalieCount }) => {
        it(`should balance minutes properly for ${teamSize} players with ${description}`, () => {
          const players = generatePlayerList(teamSize);
          const goalies = players.slice(0, goalieCount); // Use first N players as goalies
          const config: RotationConfig = { ...DEFAULT_CONFIG };
          const isFixedGoalie = goalieCount === 1;

          let benchAssignment = {};
          if (!isFixedGoalie) {
            benchAssignment = assignBenchPeriods(
              players,
              goalies,
              teamSize,
              config.fieldPlayersOnPitch,
              config.numPeriods
            );
          }

          const result = buildRotationSchedule(players, goalies, config, benchAssignment);
          const targetMinutes = result.targetFieldMinutes;

          // Get all field minutes values
          const minuteValues = Object.values(result.fieldMinutes);

          // For large teams, the max difference should be at most half a period
          const maxAllowedDifference = config.periodLength / 2;

          const maxMinutes = Math.max(...minuteValues);
          const minMinutes = Math.min(...minuteValues);
          const difference = maxMinutes - minMinutes;

          expect(difference).toBeLessThanOrEqual(maxAllowedDifference);

          // Check that the average is close to the target
          const averageMinutes =
            minuteValues.reduce((sum, val) => sum + val, 0) / minuteValues.length;
          expect(Math.abs(averageMinutes - targetMinutes)).toBeLessThan(1);

          // Verify substitutions are reasonable (no more than 2 per period)
          result.schedule.forEach(period => {
            if (period.substitutions) {
              expect(period.substitutions.length).toBeLessThanOrEqual(2);
            }
          });
        });
      });
    });

    it('should handle granular substitutions at 5, 10, and 15 minutes', () => {
      const players = generatePlayerList(8);
      const goalies = ['Player 1', 'Player 2'];
      const config: RotationConfig = { ...DEFAULT_CONFIG };

      const benchAssignment = assignBenchPeriods(
        players,
        goalies,
        players.length,
        config.fieldPlayersOnPitch,
        config.numPeriods
      );

      const result = buildRotationSchedule(players, goalies, config, benchAssignment);

      // Verify we have at least some substitutions recorded
      let hasSubstitutions = false;
      const allowedMinutes = [5, 10, 15]; // The only allowed substitution times

      result.schedule.forEach(period => {
        if (period.substitutions && period.substitutions.length > 0) {
          hasSubstitutions = true;
          period.substitutions.forEach(sub => {
            expect(allowedMinutes).toContain(sub.minute);
          });
        }
      });

      expect(hasSubstitutions).toBe(true);

      // Verify minutes are balanced
      const minuteValues = Object.values(result.fieldMinutes);
      const maxMinutes = Math.max(...minuteValues);
      const minMinutes = Math.min(...minuteValues);
      const difference = maxMinutes - minMinutes;

      expect(difference).toBeLessThanOrEqual(10);
    });
  });
});
