# Calendar Scrapers

This repository contains scripts to scrape football match calendars from STFF (Stockholm Football Association) and convert them to ICS format.

## Venue Scraper

The venue scraper fetches all matches for a specific venue (e.g., Aspuddens IP) and creates an ICS calendar file.

```bash
npm run start
```

## Team Scraper

The team scraper fetches all upcoming matches for specific teams and creates ICS calendar files.

```bash
npm run start-team
```

### Team Scraper Configuration

The team scraper reads configuration from `team-config.json` in the repository root. The configuration can define multiple groups of teams, each producing a separate ICS file.

#### Configuration Format

```json
{
  "configs": [
    {
      "teams": [
        {
          "teamId": 354611,
          "teamName": "IFK Aspudden-Tellus Blå 1"
        }
      ],
      "outputFile": "team-blå-calendar.ics"
    },
    {
      "teams": [
        {
          "teamId": 4567,
          "teamName": "IFK Aspudden-Tellus Röd 1"
        },
        {
          "teamId": 4566,
          "teamName": "IFK Aspudden-Tellus Röd 2"
        }
      ],
      "outputFile": "team-röd-calendar.ics"
    }
  ]
}
```

You can also specify a different config file:

```bash
npm run start-team -- --config=path/to/config.json
```

### GitHub Actions Workflow

The team scraper can also be run manually through the GitHub Actions interface, where you can provide:

1. A path to a custom config file (relative to the repository root)

## Development

1. Install dependencies: `npm install`
2. Build TypeScript: `npm run build`
3. Run scripts: `npm run start` or `npm run start-team`

## Dependencies

- ics: Calendar generation
- jsdom: HTML parsing
- TypeScript and Node.js
