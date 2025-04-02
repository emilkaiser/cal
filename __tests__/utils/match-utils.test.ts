import {
  getHomeAwayCategory,
  getOpponent,
  isAspuddenTeam,
  determineMatchStatus,
  extractTeamFromMatch,
  extractOpponentFromMatch,
} from '../../src/scrapers/utils/match-utils';
import { CalendarEvent } from '../../src/types/types';

describe('getHomeAwayCategory', () => {
  const baseEvent: CalendarEvent = {
    title: '',
    start: new Date(),
    end: new Date(),
    sourceType: 'laget',
    uid: 'test-uid',
    rawData: {},
  };

  it('returns undefined for events with no title', () => {
    expect(getHomeAwayCategory(baseEvent)).toBeUndefined();
  });

  it('returns undefined for events already categorized', () => {
    expect(
      getHomeAwayCategory({
        ...baseEvent,
        activity: 'Match',
        title: 'IFK AT vs Opponent',
        categories: ['Home'],
      })
    ).toBeUndefined();

    expect(
      getHomeAwayCategory({
        ...baseEvent,
        activity: 'Match',
        title: 'Opponent vs IFK AT',
        categories: ['Away'],
      })
    ).toBeUndefined();
  });

  it('detects home games from "vs" pattern', () => {
    expect(
      getHomeAwayCategory({
        ...baseEvent,
        activity: 'Match',
        title: 'IFK Aspudden-Tellus vs Opponent FC',
      })
    ).toBe('Home');
  });

  it('detects away games from "vs" pattern', () => {
    expect(
      getHomeAwayCategory({
        ...baseEvent,
        activity: 'Match',
        title: 'Opponent FC vs IFK AT',
      })
    ).toBe('Away');
  });

  it('detects home games from dash pattern', () => {
    expect(
      getHomeAwayCategory({
        ...baseEvent,
        activity: 'Match',
        title: 'Aspudden - Opponent FC',
      })
    ).toBe('Home');
  });

  it('detects away games from dash pattern', () => {
    expect(
      getHomeAwayCategory({
        ...baseEvent,
        activity: 'Match',
        title: 'Opponent FC - Tellus',
      })
    ).toBe('Away');
  });

  it('detects home games from venue', () => {
    expect(
      getHomeAwayCategory({
        ...baseEvent,
        activity: 'Match',
        title: 'Some match',
        location: 'Aspuddens IP',
      })
    ).toBe('Home');
  });

  it('assumes away for non-home venues', () => {
    expect(
      getHomeAwayCategory({
        ...baseEvent,
        activity: 'Match',
        title: 'Some match',
        location: 'Opponent Arena',
      })
    ).toBe('Away');
  });

  it('undefined for non match activities', () => {
    expect(
      getHomeAwayCategory({
        ...baseEvent,
        activity: 'Träning',
        title: 'Opponent FC - Tellus',
      })
    ).toBeUndefined();
  });
});

describe('getOpponent', () => {
  const baseEvent: CalendarEvent = {
    title: '',
    start: new Date(),
    end: new Date(),
    sourceType: 'laget',
    uid: 'test-uid',
    rawData: {},
  };

  it('returns undefined for events with no title', () => {
    expect(getOpponent(baseEvent)).toBeUndefined();
  });

  it('extracts opponent from "vs" pattern when team is home', () => {
    expect(
      getOpponent({
        ...baseEvent,
        activity: 'Match',
        title: 'IFK Aspudden-Tellus vs Opponent FC',
      })
    ).toBe('Opponent FC');
  });

  it('extracts opponent from "vs" pattern when team is away', () => {
    expect(
      getOpponent({
        ...baseEvent,
        activity: 'Match',
        title: 'Opponent FC vs IFK AT',
      })
    ).toBe('Opponent FC');
  });

  it('extracts opponent from dash pattern when team is home', () => {
    expect(
      getOpponent({
        ...baseEvent,
        activity: 'Match',
        title: 'Aspudden - Opponent FC',
      })
    ).toBe('Opponent FC');
  });

  it('extracts opponent from dash pattern when team is away', () => {
    expect(
      getOpponent({
        ...baseEvent,
        activity: 'Match',
        title: 'Opponent FC - Tellus',
      })
    ).toBe('Opponent FC');
  });

  it('extracts opponent from titles with Match prefix', () => {
    expect(
      getOpponent({
        ...baseEvent,
        activity: 'Match',
        title: 'Match AT F2014 Gul - Mälarhöjden IK F2014',
      })
    ).toBe('Mälarhöjden IK F2014');
  });

  it('extracts opponent when "Match" appears elsewhere in the title', () => {
    expect(
      getOpponent({
        ...baseEvent,
        activity: 'Match',
        title: 'IFK AT vs Match FC',
      })
    ).toBe('Match FC');
  });

  it('handles complex team names correctly', () => {
    expect(
      getOpponent({
        ...baseEvent,
        activity: 'Match',
        title: 'Match Tellus P2015 Blå - AIK FF 3',
      })
    ).toBe('AIK FF 3');
  });

  it('returns undefined when no pattern matches', () => {
    expect(
      getOpponent({
        ...baseEvent,
        activity: 'Match',
        title: 'Some random event',
      })
    ).toBeUndefined();
  });

  it('returns undefined when both teams are our teams', () => {
    expect(
      getOpponent({
        ...baseEvent,
        activity: 'Match',
        title: 'IFK Aspudden-Tellus vs Tellus',
      })
    ).toBeUndefined();
  });

  it('returns undefined for training activities with Träning in the title', () => {
    expect(
      getOpponent({
        ...baseEvent,
        activity: 'Match',
        title: 'Träning P2015',
      })
    ).toBeUndefined();
  });

  it('returns undefined for training activities with Training in the title', () => {
    expect(
      getOpponent({
        ...baseEvent,
        activity: 'Match',
        title: 'Training F2014',
      })
    ).toBeUndefined();
  });

  it('returns undefined for training activities with specific team mentions', () => {
    expect(
      getOpponent({
        ...baseEvent,
        activity: 'Match',
        title: 'Träning IFK AT P2013',
      })
    ).toBeUndefined();
  });

  it('returns undefined for training activities', () => {
    expect(
      getOpponent({
        ...baseEvent,
        activity: 'Träning',
        title: 'Match AT F2014 Gul - Mälarhöjden IK F2014',
      })
    ).toBeUndefined();
  });
});

describe('isAspuddenTeam', () => {
  it('identifies IFK Aspudden-Tellus as an Aspudden team', () => {
    expect(isAspuddenTeam('IFK Aspudden-Tellus')).toBe(true);
  });

  it('identifies shortened versions of team names', () => {
    expect(isAspuddenTeam('IFK AT')).toBe(true);
    expect(isAspuddenTeam('AT P2015')).toBe(true);
    expect(isAspuddenTeam('Tellus F2014')).toBe(true);
  });

  it('identifies affiliated teams', () => {
    expect(isAspuddenTeam('Aspuddens FF')).toBe(true);
  });

  it('returns false for other teams', () => {
    expect(isAspuddenTeam('Hammarby IF')).toBe(false);
    expect(isAspuddenTeam('AIK')).toBe(false);
    expect(isAspuddenTeam('Djurgårdens IF')).toBe(false);
    expect(isAspuddenTeam('Kransen United FF')).toBe(false);
    expect(isAspuddenTeam('BK Buffalo')).toBe(false);
    expect(isAspuddenTeam('Gröndals IK')).toBe(false);
  });
});

describe('determineMatchStatus', () => {
  it('returns Home when home team is from Aspudden', () => {
    expect(determineMatchStatus('IFK Aspudden-Tellus', 'Other Team')).toBe('Home');
    expect(determineMatchStatus('Aspuddens FF', 'Other Team')).toBe('Home');
  });

  it('returns External for matches between two non-Aspudden teams', () => {
    expect(determineMatchStatus('AIK', 'Hammarby IF')).toBe('External');
  });

  it('returns External for internal matches between two Aspudden teams', () => {
    expect(determineMatchStatus('IFK Aspudden-Tellus', 'Aspuddens FF')).toBe('Home');
  });

  it('returns External for external teams', () => {
    expect(determineMatchStatus('BK Buffalo', 'Tullinge Triangel Pojkar FK')).toBe('External');
    expect(determineMatchStatus('Ospecificerat lag (6)', 'Hammarby IF FF 4')).toBe('External');
  });
});

describe('extractTeamFromMatch', () => {
  it('returns the Aspudden team when it is the home team', () => {
    expect(extractTeamFromMatch('IFK Aspudden-Tellus', 'Other Team')).toBe('IFK Aspudden-Tellus');
  });

  it('returns the Aspudden team when it is the away team', () => {
    expect(extractTeamFromMatch('Other Team', 'IFK AT')).toBe('IFK AT');
  });

  it('returns undefined when neither team is from Aspudden', () => {
    expect(extractTeamFromMatch('AIK', 'Hammarby IF')).toBeUndefined();
  });

  it('returns the first Aspudden team when both teams are from Aspudden', () => {
    expect(extractTeamFromMatch('IFK AT', 'Aspuddens FF')).toBe('IFK AT');
  });
});

describe('extractOpponentFromMatch', () => {
  it('returns the away team when match status is Home', () => {
    expect(extractOpponentFromMatch('IFK AT', 'Other Team', 'Home')).toBe('Other Team');
  });

  it('returns the home team when match status is Away', () => {
    expect(extractOpponentFromMatch('Other Team', 'IFK AT', 'Away')).toBe('Other Team');
  });

  it('returns undefined when match status is External', () => {
    expect(extractOpponentFromMatch('AIK', 'Hammarby IF', 'External')).toBeUndefined();
  });
});
