import {
  isAspuddensIP,
  isVastbergaIP,
  isAspuddensIP1,
  isAspuddensIP2,
  isAspuddensSkola,
  isHomeVenue,
  extractVenues,
} from '../../src/scrapers/utils/venue-utils';

describe('isAspuddensIP', () => {
  it('returns true for strings containing "aspudden"', () => {
    expect(isAspuddensIP('Aspuddens IP')).toBe(true);
    expect(isAspuddensIP('aspuddens ip')).toBe(true);
    expect(isAspuddensIP('Match at Aspuddens IP today')).toBe(true);
  });

  it('returns false for strings not containing "aspudden"', () => {
    expect(isAspuddensIP('Västberga IP')).toBe(false);
    expect(isAspuddensIP('')).toBe(false);
    expect(isAspuddensIP(undefined)).toBe(false);
  });
});

describe('isVastbergaIP', () => {
  it('returns true for strings containing "västberga" or "vastberga"', () => {
    expect(isVastbergaIP('Västberga IP')).toBe(true);
    expect(isVastbergaIP('vastberga ip')).toBe(true);
    expect(isVastbergaIP('Match at Västberga IP today')).toBe(true);
  });

  it('returns false for strings not containing "västberga" or "vastberga"', () => {
    expect(isVastbergaIP('Aspuddens IP')).toBe(false);
    expect(isVastbergaIP('')).toBe(false);
    expect(isVastbergaIP(undefined)).toBe(false);
  });
});

describe('isAspuddensIP1', () => {
  it('returns true for strings containing specific Aspuddens IP 1 patterns', () => {
    expect(isAspuddensIP1('Aspuddens IP 1')).toBe(true);
    expect(isAspuddensIP1('aspuddens ip 11')).toBe(true);
    expect(isAspuddensIP1('Match at Aspuddens IP 12 today')).toBe(true);
  });

  it('returns false for non-matching strings', () => {
    expect(isAspuddensIP1('Aspuddens IP')).toBe(false);
    expect(isAspuddensIP1('Aspuddens IP 2')).toBe(false);
    expect(isAspuddensIP1('')).toBe(false);
    expect(isAspuddensIP1(undefined)).toBe(false);
  });
});

describe('isAspuddensIP2', () => {
  it('returns true for strings containing specific Aspuddens IP 2 patterns', () => {
    expect(isAspuddensIP2('Aspuddens IP 2')).toBe(true);
    expect(isAspuddensIP2('aspuddens ip 25')).toBe(true);
    expect(isAspuddensIP2('Match at Aspuddens IP 26 today')).toBe(true);
  });

  it('returns false for non-matching strings', () => {
    expect(isAspuddensIP2('Aspuddens IP')).toBe(false);
    expect(isAspuddensIP2('Aspuddens IP 1')).toBe(false);
    expect(isAspuddensIP2('')).toBe(false);
    expect(isAspuddensIP2(undefined)).toBe(false);
  });
});

describe('isAspuddensSkola', () => {
  it('returns true for strings containing "aspuddens skola"', () => {
    expect(isAspuddensSkola('Aspuddens skola')).toBe(true);
    expect(isAspuddensSkola('aspuddens skola')).toBe(true);
    expect(isAspuddensSkola('Match at Aspuddens skola today')).toBe(true);
  });

  it('returns false for strings not containing "aspuddens skola"', () => {
    expect(isAspuddensSkola('Aspuddens IP')).toBe(false);
    expect(isAspuddensSkola('')).toBe(false);
    expect(isAspuddensSkola(undefined)).toBe(false);
  });
});

describe('isHomeVenue', () => {
  it('returns true for home venues', () => {
    expect(isHomeVenue('Aspuddens IP')).toBe(true);
    expect(isHomeVenue('Västberga IP')).toBe(true);
    expect(isHomeVenue('Match at Aspuddens IP today')).toBe(true);
  });

  it('returns false for non-home venues', () => {
    expect(isHomeVenue('Opponent Arena')).toBe(false);
    expect(isHomeVenue('')).toBe(false);
    expect(isHomeVenue(undefined)).toBe(false);
  });
});

describe('extractVenues', () => {
  it('returns empty array for undefined or empty locations', () => {
    expect(extractVenues(undefined)).toEqual([]);
    expect(extractVenues('')).toEqual([]);
  });

  it('extracts Aspuddens Skola', () => {
    expect(extractVenues('Aspuddens skola')).toEqual(['Aspuddens Skola']);
  });

  it('extracts Aspuddens IP', () => {
    expect(extractVenues('Aspuddens IP')).toEqual(['Aspuddens IP']);
  });

  it('extracts Aspuddens IP 1', () => {
    expect(extractVenues('Aspuddens IP 1')).toEqual(['Aspuddens IP', 'Aspuddens IP 1']);
  });

  it('extracts Aspuddens IP 2', () => {
    expect(extractVenues('Aspuddens IP 2')).toEqual(['Aspuddens IP', 'Aspuddens IP 2']);
  });

  it('extracts Västberga IP', () => {
    expect(extractVenues('Västberga IP')).toEqual(['Västberga IP']);
  });
});
