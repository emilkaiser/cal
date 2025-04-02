import { Gender } from '../../src/types/types';
import { extractTeamInfo, createFormattedTeamName } from '../../src/scrapers/utils/team-parser';

describe('Team Parser Utilities', () => {
  describe('extractTeamInfo', () => {
    it('extracts team info from match title format', () => {
      const result = extractTeamInfo('Match IFK Aspudden-Tellus Blå 1 - Hammarby IF FF 4 grön');
      expect(result.rawTeam).toBe('IFK Aspudden-Tellus Blå 1');
    });

    it('extracts team info from vs format', () => {
      const result = extractTeamInfo('IFK Aspudden-Tellus Röd vs Team B');
      expect(result.rawTeam).toBe('IFK Aspudden-Tellus Röd');
    });

    it('extracts team info from age group format', () => {
      const result = extractTeamInfo('P2014 Blå vs Team B');
      expect(result.rawTeam).toBe('P2014 Blå');
    });

    it('creates formatted team name from raw team when age and gender are present', () => {
      const result = extractTeamInfo('P2014 Blå vs Team B');
      expect(result.formattedTeam).toBe('P2014 Blå');
    });

    it('creates formatted team name from provided gender and age group', () => {
      const result = extractTeamInfo('Some title with IFK Aspudden-Tellus', 'Pojkar', '2015');
      expect(result.formattedTeam).toBe('P2015');
    });

    it('extracts team info from titles with special characters', () => {
      const result = extractTeamInfo('IFK Aspudden-Tellus Blå/Svart vs Team B');
      expect(result.rawTeam).toBe('IFK Aspudden-Tellus Blå/Svart');
    });

    it('handles titles with no recognizable team pattern', () => {
      const result = extractTeamInfo('General meeting about football');
      expect(result.rawTeam).toBeUndefined();
    });

    it('handles empty title', () => {
      const result = extractTeamInfo('');
      expect(result.rawTeam).toBeUndefined();
      expect(result.formattedTeam).toBeUndefined();
    });

    it('creates formatted team name using provided gender, age group and color from title', () => {
      const result = extractTeamInfo('Something with Röd in it', 'Pojkar', '2015');
      expect(result.formattedTeam).toBe('P2015 Röd');
    });

    it('creates formatted team name using provided gender, age group and color from title', () => {
      const result = extractTeamInfo('"Träning - IFK Aspudden-Tellus P19 (herrjuniorer)"');
      expect(result.formattedTeam).toBe('IFK Aspudden-Tellus P19');
    });

    it('extracts both team and color when available', () => {
      const result = extractTeamInfo('P2015 Blå vs Team B');
      expect(result.rawTeam).toBe('P2015 Blå');
      expect(result.formattedTeam).toBe('P2015 Blå');
    });
  });

  describe('createFormattedTeamName', () => {
    it('creates formatted team name from gender, age group, and color', () => {
      expect(createFormattedTeamName('Pojkar', '2015', 'Blå')).toBe('P2015 Blå');
      expect(createFormattedTeamName('Flickor', '2014', 'Röd')).toBe('F2014 Röd');
    });

    it('handles missing color', () => {
      expect(createFormattedTeamName('Pojkar', '2015')).toBe('P2015');
    });

    it('ignores "unknown" color', () => {
      expect(createFormattedTeamName('Pojkar', '2015', undefined)).toBe('P2015');
    });

    it('handles gender with lowercase first letter', () => {
      expect(createFormattedTeamName('Pojkar', '2015', 'Blå')).toBe('P2015 Blå');
      expect(createFormattedTeamName('Flickor', '2014', 'Röd')).toBe('F2014 Röd');
    });

    it('handles empty strings in optional parameters', () => {
      expect(createFormattedTeamName('Pojkar', '2015', '')).toBe('P2015');
      expect(createFormattedTeamName('Pojkar', '', 'Blå')).toBeUndefined();
      expect(createFormattedTeamName('' as Gender, '2015', 'Blå')).toBeUndefined();
    });
  });
});
