import {
  getColorFromTeamName,
  getGenderFromTeamName,
  getAgeGroupFromTeamName,
  getHexColor,
} from '../../src/utils/team-utils';

describe('Team Utilities', () => {
  describe('getColorFromTeamName', () => {
    it('extracts the color from team names', () => {
      expect(getColorFromTeamName('P2014 Blå')).toBe('Blå');
      expect(getColorFromTeamName('F2016 Röd')).toBe('Röd');
      expect(getColorFromTeamName('P2015 Vit')).toBe('Vit');
      expect(getColorFromTeamName('P2015')).toBe('unknown');
      expect(getColorFromTeamName('')).toBe('unknown');
    });
  });

  describe('getGenderFromTeamName', () => {
    it('determines gender from team names', () => {
      expect(getGenderFromTeamName('P2014 Blå')).toBe('Pojkar');
      expect(getGenderFromTeamName('F2016 Röd')).toBe('Flickor');
      expect(getGenderFromTeamName('Seniors')).toBe('unknown');
      expect(getGenderFromTeamName('')).toBe('unknown');
    });
  });

  describe('getAgeGroupFromTeamName', () => {
    it('extracts age group from team names', () => {
      expect(getAgeGroupFromTeamName('P2014 Blå')).toBe('2014');
      expect(getAgeGroupFromTeamName('F2016 Röd')).toBe('2016');
      expect(getAgeGroupFromTeamName('Seniors')).toBe('unknown');
      expect(getAgeGroupFromTeamName('')).toBe('unknown');
    });
  });

  describe('getHexColor', () => {
    it('maps color names to hex codes', () => {
      expect(getHexColor('Blå')).toBe('#007bff');
      expect(getHexColor('Röd')).toBe('#dc3545');
      expect(getHexColor('Vit')).toBe('#ffffff');
      expect(getHexColor('Svart')).toBe('#000000');
      expect(getHexColor('Gul')).toBe('#ffc107');
      expect(getHexColor('unknown')).toBe('#000000');
      expect(getHexColor('')).toBe('#000000');
    });
  });
});
