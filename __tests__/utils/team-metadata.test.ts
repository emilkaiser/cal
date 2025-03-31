import {
  getColorFromTeamName,
  getGenderFromTeamName,
  getAgeGroupFromTeamName,
  getHexColor,
} from '../../src/utils/team-metadata';

describe('Team Metadata Utilities', () => {
  describe('getColorFromTeamName', () => {
    it('extracts the color from common team name patterns', () => {
      expect(getColorFromTeamName('P2014 Blå')).toBe('Blå');
      expect(getColorFromTeamName('F2016 Röd')).toBe('Röd');
      expect(getColorFromTeamName('P2015 Vit')).toBe('Vit');
      expect(getColorFromTeamName('P2015')).toBe('unknown');
      expect(getColorFromTeamName('')).toBe('unknown');
    });

    it('extracts color from IFK Aspudden-Tellus team formats', () => {
      expect(getColorFromTeamName('IFK Aspudden-Tellus Blå 1')).toBe('Blå');
      expect(getColorFromTeamName('IFK Aspudden-Tellus Röd 2')).toBe('Röd');
      expect(getColorFromTeamName('IFK Aspudden-Tellus Svart 3')).toBe('Svart');
    });

    it('extracts color when there is a plural form (Swedish)', () => {
      expect(getColorFromTeamName('IFK Aspudden-Tellus Röda')).toBe('Röd');
      expect(getColorFromTeamName('IFK Aspudden-Tellus Blåa')).toBe('Blå');
    });

    it('handles team names with multiple color words', () => {
      expect(getColorFromTeamName('IFK Aspudden-Tellus Röd och Vit')).toBe('Röd');
      expect(getColorFromTeamName('P2015 Blå Vit')).toBe('Blå');
    });

    it('handles team names with colors followed by digits', () => {
      expect(getColorFromTeamName('IFK Aspudden-Tellus Blå 2')).toBe('Blå');
      expect(getColorFromTeamName('IFK Aspudden-Tellus Röd 1')).toBe('Röd');
    });

    it('handles uppercase color names', () => {
      expect(getColorFromTeamName('P2015 BLÅ')).toBe('Blå');
      expect(getColorFromTeamName('F2014 RÖD')).toBe('Röd');
    });

    it('handles mixed case color names', () => {
      expect(getColorFromTeamName('P2015 BlÅ')).toBe('Blå');
      expect(getColorFromTeamName('F2014 rÖd')).toBe('Röd');
    });
  });

  describe('getGenderFromTeamName', () => {
    it('determines gender from team names', () => {
      expect(getGenderFromTeamName('P2014 Blå')).toBe('Pojkar');
      expect(getGenderFromTeamName('F2016 Röd')).toBe('Flickor');
      expect(getGenderFromTeamName('Seniors')).toBe('unknown');
      expect(getGenderFromTeamName('')).toBe('unknown');
    });

    it('handles different case variations', () => {
      expect(getGenderFromTeamName('p2014 Blå')).toBe('Pojkar');
      expect(getGenderFromTeamName('f2016 Röd')).toBe('Flickor');
    });

    it('handles when P/F is not at the start of the string', () => {
      expect(getGenderFromTeamName('Team P2014')).toBe('Pojkar');
      expect(getGenderFromTeamName('Team F2016')).toBe('Flickor');
    });

    it('returns unknown for ambiguous input', () => {
      expect(getGenderFromTeamName('PF2014')).toBe('unknown');
      expect(getGenderFromTeamName('2014')).toBe('unknown');
    });
  });

  describe('getAgeGroupFromTeamName', () => {
    it('extracts age group from team names', () => {
      expect(getAgeGroupFromTeamName('P2014 Blå')).toBe('2014');
      expect(getAgeGroupFromTeamName('F2016 Röd')).toBe('2016');
      expect(getAgeGroupFromTeamName('Seniors')).toBe('unknown');
      expect(getAgeGroupFromTeamName('')).toBe('unknown');
    });

    it('extracts age group from more complex strings', () => {
      expect(getAgeGroupFromTeamName('Team P2014 Blå')).toBe('2014');
      expect(getAgeGroupFromTeamName('P2014-Group')).toBe('2014');
    });

    it('returns the first match if multiple year patterns are found', () => {
      expect(getAgeGroupFromTeamName('P2014 vs P2015')).toBe('2014');
    });

    it('handles when year is not directly after P/F', () => {
      expect(getAgeGroupFromTeamName('Team P-2014')).toBe('2014');
    });
  });

  describe('getHexColor', () => {
    it('maps color names to hex codes', () => {
      expect(getHexColor('Blå')).toBe('#007bff');
      expect(getHexColor('Röd')).toBe('#dc3545');
      expect(getHexColor('Vit')).toBe('#ffffff');
      expect(getHexColor('Svart')).toBe('#000000');
      expect(getHexColor('Gul')).toBe('#ffc107');
      expect(getHexColor('Grön')).toBe('#28a745');
      expect(getHexColor('unknown')).toBe('#000000');
      expect(getHexColor('')).toBe('#000000');
    });

    it('handles different case variations for color names', () => {
      expect(getHexColor('blå')).toBe('#007bff');
      expect(getHexColor('RÖD')).toBe('#dc3545');
      expect(getHexColor('ViT')).toBe('#ffffff');
    });

    it('handles colors with accents or special characters', () => {
      expect(getHexColor('Röd')).toBe('#dc3545');
      expect(getHexColor('Grön')).toBe('#28a745');
    });
  });
});
