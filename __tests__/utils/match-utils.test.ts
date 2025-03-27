import { getHomeAwayCategory, getOpponent } from '../../src/utils/match-utils';
import { CalendarEvent } from '../../src/types/types';

describe('getHomeAwayCategory', () => {
  const baseEvent: CalendarEvent = {
    title: '',
    start: new Date(),
    end: new Date(),
    sourceType: 'laget',
  };

  it('returns undefined for events with no title', () => {
    expect(getHomeAwayCategory(baseEvent)).toBeUndefined();
  });

  it('returns undefined for events already categorized', () => {
    expect(
      getHomeAwayCategory({
        ...baseEvent,
        title: 'IFK AT vs Opponent',
        categories: ['Home'],
      })
    ).toBeUndefined();

    expect(
      getHomeAwayCategory({
        ...baseEvent,
        title: 'Opponent vs IFK AT',
        categories: ['Away'],
      })
    ).toBeUndefined();
  });

  it('detects home games from "vs" pattern', () => {
    expect(
      getHomeAwayCategory({
        ...baseEvent,
        title: 'IFK Aspudden-Tellus vs Opponent FC',
      })
    ).toBe('Home');
  });

  it('detects away games from "vs" pattern', () => {
    expect(
      getHomeAwayCategory({
        ...baseEvent,
        title: 'Opponent FC vs IFK AT',
      })
    ).toBe('Away');
  });

  it('detects home games from dash pattern', () => {
    expect(
      getHomeAwayCategory({
        ...baseEvent,
        title: 'Aspudden - Opponent FC',
      })
    ).toBe('Home');
  });

  it('detects away games from dash pattern', () => {
    expect(
      getHomeAwayCategory({
        ...baseEvent,
        title: 'Opponent FC - Tellus',
      })
    ).toBe('Away');
  });

  it('detects home games from venue', () => {
    expect(
      getHomeAwayCategory({
        ...baseEvent,
        title: 'Some match',
        location: 'Aspuddens IP',
      })
    ).toBe('Home');
  });

  it('assumes away for non-home venues', () => {
    expect(
      getHomeAwayCategory({
        ...baseEvent,
        title: 'Some match',
        location: 'Opponent Arena',
      })
    ).toBe('Away');
  });
});

describe('getOpponent', () => {
  const baseEvent: CalendarEvent = {
    title: '',
    start: new Date(),
    end: new Date(),
    sourceType: 'laget',
  };

  it('returns undefined for events with no title', () => {
    expect(getOpponent(baseEvent)).toBeUndefined();
  });

  it('extracts opponent from "vs" pattern when team is home', () => {
    expect(
      getOpponent({
        ...baseEvent,
        title: 'IFK Aspudden-Tellus vs Opponent FC',
      })
    ).toBe('Opponent FC');
  });

  it('extracts opponent from "vs" pattern when team is away', () => {
    expect(
      getOpponent({
        ...baseEvent,
        title: 'Opponent FC vs IFK AT',
      })
    ).toBe('Opponent FC');
  });

  it('extracts opponent from dash pattern when team is home', () => {
    expect(
      getOpponent({
        ...baseEvent,
        title: 'Aspudden - Opponent FC',
      })
    ).toBe('Opponent FC');
  });

  it('extracts opponent from dash pattern when team is away', () => {
    expect(
      getOpponent({
        ...baseEvent,
        title: 'Opponent FC - Tellus',
      })
    ).toBe('Opponent FC');
  });

  it('extracts opponent from titles with Match prefix', () => {
    expect(
      getOpponent({
        ...baseEvent,
        title: 'Match AT F2014 Gul - Mälarhöjden IK F2014',
      })
    ).toBe('Mälarhöjden IK F2014');
  });

  it('extracts opponent when "Match" appears elsewhere in the title', () => {
    expect(
      getOpponent({
        ...baseEvent,
        title: 'IFK AT vs Match FC',
      })
    ).toBe('Match FC');
  });

  it('handles complex team names correctly', () => {
    expect(
      getOpponent({
        ...baseEvent,
        title: 'Match Tellus P2015 Blå - AIK FF 3',
      })
    ).toBe('AIK FF 3');
  });

  it('returns undefined when no pattern matches', () => {
    expect(
      getOpponent({
        ...baseEvent,
        title: 'Some random event',
      })
    ).toBeUndefined();
  });

  it('returns undefined when both teams are our teams', () => {
    expect(
      getOpponent({
        ...baseEvent,
        title: 'IFK Aspudden-Tellus vs Tellus',
      })
    ).toBeUndefined();
  });
});
