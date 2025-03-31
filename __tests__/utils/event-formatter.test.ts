import { formatEventTitle } from '../../src/utils/event-formatter';
import { Match } from '../../src/types/types';

describe('formatEventTitle', () => {
  it('formats training events with soccer ball emoji', () => {
    expect(formatEventTitle('A-lag Herrar', 'Träning', 'Träning')).toBe('⚽ A-lag Herrar');
    expect(formatEventTitle('P2015 Blå', 'Some training', 'Träning')).toBe('⚽ P2015 Blå');
  });

  it('formats home matches with vs and home emoji', () => {
    expect(formatEventTitle('Team A', 'Match details', undefined, 'Home', 'Team B')).toBe(
      '⚽🏠 Team A (vs Team B)'
    );
    expect(formatEventTitle('Team A', 'Match details', undefined, 'Home')).toBe('⚽🏠 Team A');
  });

  it('formats away matches with vs and bus emoji', () => {
    expect(formatEventTitle('Team A', 'Match details', undefined, 'Away', 'Team B')).toBe(
      '⚽🚍 Team A (vs Team B)'
    );
    expect(formatEventTitle('Team A', 'Match details', undefined, 'Away')).toBe('⚽🚍 Team A');
  });

  it('formats external matches with both team names', () => {
    expect(
      formatEventTitle(
        'Team A',
        'Match details',
        undefined,
        'External',
        undefined,
        'Home Team',
        'Away Team'
      )
    ).toBe('⚽ External (Home Team vs Away Team)');
    expect(formatEventTitle('Team A', 'Original title', undefined, 'External')).toBe(
      '⚽ External (Original title)'
    );
  });

  it('formats generic matches with vs emoji', () => {
    expect(formatEventTitle('Team A', 'Match details', undefined, 'match' as Match, 'Team B')).toBe(
      '⚽ Team A (vs Team B)'
    );
    expect(formatEventTitle('Team A', 'Match details', undefined, 'match' as Match)).toBe(
      '⚽ Team A'
    );
  });

  it('removes "Match" prefix from opponent names', () => {
    expect(
      formatEventTitle('P2015 Blå', 'Original title', undefined, 'Home', 'Match AIK FF 3')
    ).toBe('⚽🏠 P2015 Blå (vs AIK FF 3)');
    expect(
      formatEventTitle('P2015 Blå', 'Original title', undefined, 'Away', 'Match Opponent Team')
    ).toBe('⚽🚍 P2015 Blå (vs Opponent Team)');
  });

  it('combines team name and original title when appropriate', () => {
    expect(formatEventTitle('Team A', 'Additional info')).toBe('Team A (Additional info)');
  });

  it('uses only team name when original title contains the team name', () => {
    expect(formatEventTitle('Team A', 'Team A game')).toBe('Team A');
  });

  it('formats "Övrigt" activities without match emojis despite match property', () => {
    expect(formatEventTitle('Team A', 'Event Title', 'Övrigt', 'Home', 'Team B')).toBe(
      'Team A (Event Title)'
    );
    expect(formatEventTitle('Team A', 'Team A Event', 'Övrigt', 'Away', 'Team B')).toBe('Team A');
  });

  it('returns only team name when no other parameters are provided', () => {
    expect(formatEventTitle('Team A', '')).toBe('Team A');
  });

  it('handles undefined inputs gracefully', () => {
    expect(formatEventTitle('Team A', undefined)).toBe('Team A');
    expect(formatEventTitle('Team A', 'Title', undefined, undefined)).toBe('Team A (Title)');
  });

  it('handles empty string inputs correctly', () => {
    expect(formatEventTitle('Team A', '')).toBe('Team A');
    expect(formatEventTitle('', 'Title')).toBe(' (Title)');
    expect(formatEventTitle('', '')).toBe('');
  });

  it('formats the title correctly when opponent name starts with special characters', () => {
    expect(formatEventTitle('Team A', 'Match details', undefined, 'Home', '- Opponent')).toBe(
      '⚽🏠 Team A (vs - Opponent)'
    );
    expect(formatEventTitle('Team A', 'Match details', undefined, 'Home', '_Opponent')).toBe(
      '⚽🏠 Team A (vs _Opponent)'
    );
  });

  it('formats the title correctly for unusual match status values', () => {
    expect(
      formatEventTitle('Team A', 'Match details', undefined, 'unknown' as Match, 'Team B')
    ).toBe('⚽ Team A (vs Team B)');
    expect(formatEventTitle('Team A', 'Match details', undefined, '' as Match, 'Team B')).toBe(
      '⚽ Team A (vs Team B)'
    );
  });

  it('formats external matches correctly with a single team name', () => {
    expect(formatEventTitle('Team A', 'Team B vs Team C', undefined, 'External')).toBe(
      '⚽ External (Team B vs Team C)'
    );
  });

  it('formats with extra whitespace in opponent name', () => {
    expect(formatEventTitle('Team A', 'Match details', undefined, 'Home', '  Team B  ')).toBe(
      '⚽🏠 Team A (vs Team B)'
    );
  });
});
