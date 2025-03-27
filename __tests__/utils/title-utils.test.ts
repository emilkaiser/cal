import { Match } from '../../src/types/types';
import { formatEventTitle } from '../../src/utils/title-utils';

describe('formatEventTitle', () => {
  it('formats training events with soccer ball emoji', () => {
    expect(formatEventTitle('A-lag Herrar', 'Träning', 'Träning')).toBe('⚽ A-lag Herrar');
    expect(formatEventTitle('P2015 Blå', 'Some training', 'Träning')).toBe('⚽ P2015 Blå');
  });

  it('formats home matches with vs and home emoji', () => {
    expect(formatEventTitle('Team A', 'Match details', undefined, 'Home', 'Team B')).toBe(
      '🆚🏠 Team A (vs Team B)'
    );
    expect(formatEventTitle('Team A', 'Match details', undefined, 'Home')).toBe('🆚🏠 Team A');
  });

  it('formats away matches with vs and bus emoji', () => {
    expect(formatEventTitle('Team A', 'Match details', undefined, 'Away', 'Team B')).toBe(
      '🆚🚍 Team A (vs Team B)'
    );
    expect(formatEventTitle('Team A', 'Match details', undefined, 'Away')).toBe('🆚🚍 Team A');
  });

  it('formats generic matches with vs emoji', () => {
    expect(formatEventTitle('Team A', 'Match details', undefined, 'match' as Match, 'Team B')).toBe(
      '🆚 Team A (vs Team B)'
    );
    expect(formatEventTitle('Team A', 'Match details', undefined, 'match' as Match)).toBe(
      '🆚 Team A'
    );
  });

  it('removes "Match" prefix from opponent names', () => {
    expect(
      formatEventTitle('P2015 Blå', 'Original title', undefined, 'Home', 'Match AIK FF 3')
    ).toBe('🆚🏠 P2015 Blå (vs AIK FF 3)');
    expect(
      formatEventTitle('P2015 Blå', 'Original title', undefined, 'Away', 'Match Opponent Team')
    ).toBe('🆚🚍 P2015 Blå (vs Opponent Team)');
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
});
