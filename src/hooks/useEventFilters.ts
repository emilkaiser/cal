import { useState, useMemo, useCallback } from 'react';
import type { CalendarEvent } from '@/types/types';
import type { DataSource } from '@/lib/data-sources';

/**
 * Custom hook for comprehensive filtering of calendar events
 * with support for data source specific filters
 */
export function useEventFilters(events: CalendarEvent[], dataSources: DataSource[]) {
  // ===== Data source identification =====
  const hasLagetData = useMemo(() => {
    return dataSources.some(source => source.id === 'laget');
  }, [dataSources]);

  const hasVenueData = useMemo(() => {
    return dataSources.some(source => source.id === 'venue');
  }, [dataSources]);

  // ===== Global filters =====

  // Data sources filter
  const [enabledSources, setEnabledSources] = useState<Record<string, boolean>>(
    dataSources.reduce((acc, source) => ({ ...acc, [source.id]: true }), {})
  );

  // ===== Teams filters (separated by source) =====

  // Laget teams
  const lagetTeams = useMemo(() => {
    const teams = new Set<string>();

    events.forEach(event => {
      if (event.source === 'laget' && event.team) {
        teams.add(event.team);
      }
    });

    return Array.from(teams).sort();
  }, [events]);

  const [enabledLagetTeams, setEnabledLagetTeams] = useState<Record<string, boolean>>(
    lagetTeams.reduce((acc, team) => ({ ...acc, [team]: true }), {} as Record<string, boolean>)
  );

  // Venue teams
  const venueTeams = useMemo(() => {
    const teams = new Set<string>();

    events.forEach(event => {
      if (event.source && event.source.startsWith('venue') && event.team) {
        teams.add(event.team);
      }
    });

    return Array.from(teams).sort();
  }, [events]);

  const [enabledVenueTeams, setEnabledVenueTeams] = useState<Record<string, boolean>>(
    venueTeams.reduce((acc, team) => ({ ...acc, [team]: true }), {} as Record<string, boolean>)
  );

  // Other teams
  const otherTeams = useMemo(() => {
    const teams = new Set<string>();

    events.forEach(event => {
      if (
        event.source !== 'laget' &&
        !(event.source && event.source.startsWith('venue')) &&
        event.team
      ) {
        teams.add(event.team);
      }
    });

    return Array.from(teams).sort();
  }, [events]);

  const [enabledOtherTeams, setEnabledOtherTeams] = useState<Record<string, boolean>>(
    otherTeams.reduce((acc, team) => ({ ...acc, [team]: true }), {} as Record<string, boolean>)
  );

  // Track events without team assignment
  const hasUndefinedTeams = useMemo(() => {
    return events.some(event => !event.team);
  }, [events]);

  const [showUndefinedTeams, setShowUndefinedTeams] = useState(true);

  // ===== Venue filters (separated by source) =====

  // Laget venues
  const lagetVenues = useMemo(() => {
    const venues = new Set<string>();

    events.forEach(event => {
      if (event.source === 'laget' && event.venues) {
        event.venues.forEach(venue => venues.add(venue));
      }
    });

    return Array.from(venues).sort();
  }, [events]);

  const [enabledLagetVenues, setEnabledLagetVenues] = useState<Record<string, boolean>>(
    lagetVenues.reduce((acc, venue) => ({ ...acc, [venue]: true }), {} as Record<string, boolean>)
  );

  // Venue venues
  const venueVenues = useMemo(() => {
    const venues = new Set<string>();

    events.forEach(event => {
      if (event.source && event.source.startsWith('venue') && event.venues) {
        event.venues.forEach(venue => venues.add(venue));
      }
    });

    return Array.from(venues).sort();
  }, [events]);

  const [enabledVenueVenues, setEnabledVenueVenues] = useState<Record<string, boolean>>(
    venueVenues.reduce((acc, venue) => ({ ...acc, [venue]: true }), {} as Record<string, boolean>)
  );

  // ===== Activity filters (separated by source) =====

  // Laget activities
  const lagetActivities = useMemo(() => {
    const activities = new Set<string>();

    events.forEach(event => {
      if (event.source === 'laget' && event.activity) {
        activities.add(event.activity);
      }
    });

    return Array.from(activities).sort();
  }, [events]);

  const [enabledLagetActivities, setEnabledLagetActivities] = useState<Record<string, boolean>>(
    lagetActivities.reduce(
      (acc, activity) => ({ ...acc, [activity]: true }),
      {} as Record<string, boolean>
    )
  );

  // Venue activities
  const venueActivities = useMemo(() => {
    const activities = new Set<string>();

    events.forEach(event => {
      if (event.source && event.source.startsWith('venue') && event.activity) {
        activities.add(event.activity);
      }
    });

    return Array.from(activities).sort();
  }, [events]);

  const [enabledVenueActivities, setEnabledVenueActivities] = useState<Record<string, boolean>>(
    venueActivities.reduce(
      (acc, activity) => ({ ...acc, [activity]: true }),
      {} as Record<string, boolean>
    )
  );

  // ===== Match locations filters (separated by source) =====

  // Laget match locations (home/away/other)
  const lagetMatchLocations = useMemo(() => {
    const locations = new Set<string>();

    events.forEach(event => {
      if (event.source === 'laget' && event.match) {
        locations.add(event.match.toLowerCase());
      }
    });

    return Array.from(locations).sort();
  }, [events]);

  const [enabledLagetMatchLocations, setEnabledLagetMatchLocations] = useState<
    Record<string, boolean>
  >(
    lagetMatchLocations.reduce(
      (acc, location) => ({ ...acc, [location]: true }),
      {} as Record<string, boolean>
    )
  );

  // Venue match locations (home/away/other)
  const venueMatchLocations = useMemo(() => {
    const locations = new Set<string>();

    events.forEach(event => {
      if (event.source && event.source.startsWith('venue')) {
        if (event.match) {
          locations.add(event.match.toLowerCase());
        }
      }
    });

    // If no explicit match locations but we have venue data,
    // add home/away options for filtering
    if (locations.size === 0 && hasVenueData) {
      locations.add('home');
      locations.add('away');
    }

    return Array.from(locations).sort();
  }, [events, hasVenueData]);

  const [enabledVenueMatchLocations, setEnabledVenueMatchLocations] = useState<
    Record<string, boolean>
  >(
    venueMatchLocations.reduce(
      (acc, location) => ({ ...acc, [location]: true }),
      {} as Record<string, boolean>
    )
  );

  // ===== Filter application logic =====
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Filter by data source
      if (event.source && !enabledSources[event.source]) {
        return false;
      }

      // Check if the event has a team
      const hasTeam = Boolean(event.team);

      // Filter by team based on source
      if (event.source === 'laget') {
        if (hasTeam) {
          if (!event.team || !enabledLagetTeams[event.team]) {
            return false;
          }
        } else if (!showUndefinedTeams) {
          return false;
        }
      } else if (event.source && event.source.startsWith('venue')) {
        if (hasTeam) {
          if (!event.team || !enabledVenueTeams[event.team]) {
            return false;
          }
        } else if (!showUndefinedTeams) {
          return false;
        }
      } else {
        if (hasTeam) {
          if (!event.team || !enabledOtherTeams[event.team]) {
            return false;
          }
        } else if (!showUndefinedTeams) {
          return false;
        }
      }

      // Filter by venue based on source
      if (event.venues && event.venues.length > 0) {
        let venueMatch = false;

        if (event.source === 'laget') {
          for (const venue of event.venues) {
            if (enabledLagetVenues[venue]) {
              venueMatch = true;
              break;
            }
          }
          if (!venueMatch) return false;
        } else if (event.source && event.source.startsWith('venue')) {
          for (const venue of event.venues) {
            if (enabledVenueVenues[venue]) {
              venueMatch = true;
              break;
            }
          }
          if (!venueMatch) return false;
        }
      }

      // Filter by activity based on source
      if (event.activity) {
        if (event.source === 'laget') {
          if (lagetActivities.length > 0 && !enabledLagetActivities[event.activity]) {
            return false;
          }
        } else if (event.source && event.source.startsWith('venue')) {
          if (venueActivities.length > 0 && !enabledVenueActivities[event.activity]) {
            return false;
          }
        }
      }

      // Filter by match location based on source
      if (event.match) {
        const matchLocationLower = event.match.toLowerCase();

        if (event.source === 'laget') {
          if (lagetMatchLocations.length > 0 && !enabledLagetMatchLocations[matchLocationLower]) {
            return false;
          }
        } else if (event.source && event.source.startsWith('venue')) {
          if (venueMatchLocations.length > 0 && !enabledVenueMatchLocations[matchLocationLower]) {
            return false;
          }
        }
      } else if (
        event.source &&
        event.source.startsWith('venue') &&
        venueMatchLocations.length > 0
      ) {
        // For venue events without explicit match location, consider them as "home" by default
        // but allow filtering with match location filters
        if (!enabledVenueMatchLocations['home']) {
          return false;
        }
      }

      return true;
    });
  }, [
    events,
    enabledSources,
    showUndefinedTeams,
    enabledLagetTeams,
    enabledVenueTeams,
    enabledOtherTeams,
    enabledLagetVenues,
    enabledVenueVenues,
    enabledLagetActivities,
    venueActivities,
    enabledVenueActivities,
    lagetActivities,
    lagetMatchLocations,
    enabledLagetMatchLocations,
    venueMatchLocations,
    enabledVenueMatchLocations,
  ]);

  // ===== Toggle handlers =====

  // Data sources
  const toggleDataSource = useCallback((sourceId: string) => {
    setEnabledSources(prev => ({
      ...prev,
      [sourceId]: !prev[sourceId],
    }));
  }, []);

  const toggleAllDataSources = useCallback(
    (enabled: boolean) => {
      const newState = Object.keys(enabledSources).reduce(
        (acc, key) => ({ ...acc, [key]: enabled }),
        {}
      );
      setEnabledSources(newState);
    },
    [enabledSources]
  );

  // Laget Teams
  const toggleLagetTeam = useCallback((team: string) => {
    setEnabledLagetTeams(prev => ({
      ...prev,
      [team]: !prev[team],
    }));
  }, []);

  const toggleAllLagetTeams = useCallback(
    (enabled: boolean) => {
      const newState = Object.keys(enabledLagetTeams).reduce(
        (acc, key) => ({ ...acc, [key]: enabled }),
        {} as Record<string, boolean>
      );
      setEnabledLagetTeams(newState);
    },
    [enabledLagetTeams]
  );

  // Venue Teams
  const toggleVenueTeam = useCallback((team: string) => {
    setEnabledVenueTeams(prev => ({
      ...prev,
      [team]: !prev[team],
    }));
  }, []);

  const toggleAllVenueTeams = useCallback(
    (enabled: boolean) => {
      const newState = Object.keys(enabledVenueTeams).reduce(
        (acc, key) => ({ ...acc, [key]: enabled }),
        {} as Record<string, boolean>
      );
      setEnabledVenueTeams(newState);
    },
    [enabledVenueTeams]
  );

  // Other Teams
  const toggleOtherTeam = useCallback((team: string) => {
    setEnabledOtherTeams(prev => ({
      ...prev,
      [team]: !prev[team],
    }));
  }, []);

  const toggleAllOtherTeams = useCallback(
    (enabled: boolean) => {
      const newState = Object.keys(enabledOtherTeams).reduce(
        (acc, key) => ({ ...acc, [key]: enabled }),
        {} as Record<string, boolean>
      );
      setEnabledOtherTeams(newState);
    },
    [enabledOtherTeams]
  );

  // Toggle undefined teams
  const toggleUndefinedTeams = useCallback(() => {
    setShowUndefinedTeams(prev => !prev);
  }, []);

  // Laget Venues
  const toggleLagetVenue = useCallback((venue: string) => {
    setEnabledLagetVenues(prev => ({
      ...prev,
      [venue]: !prev[venue],
    }));
  }, []);

  const toggleAllLagetVenues = useCallback(
    (enabled: boolean) => {
      const newState = Object.keys(enabledLagetVenues).reduce(
        (acc, key) => ({ ...acc, [key]: enabled }),
        {} as Record<string, boolean>
      );
      setEnabledLagetVenues(newState);
    },
    [enabledLagetVenues]
  );

  // Venue Venues
  const toggleVenueVenue = useCallback((venue: string) => {
    setEnabledVenueVenues(prev => ({
      ...prev,
      [venue]: !prev[venue],
    }));
  }, []);

  const toggleAllVenueVenues = useCallback(
    (enabled: boolean) => {
      const newState = Object.keys(enabledVenueVenues).reduce(
        (acc, key) => ({ ...acc, [key]: enabled }),
        {} as Record<string, boolean>
      );
      setEnabledVenueVenues(newState);
    },
    [enabledVenueVenues]
  );

  // Laget Activities
  const toggleLagetActivity = useCallback((activity: string) => {
    setEnabledLagetActivities(prev => ({
      ...prev,
      [activity]: !prev[activity],
    }));
  }, []);

  const toggleAllLagetActivities = useCallback(
    (enabled: boolean) => {
      const newState = Object.keys(enabledLagetActivities).reduce(
        (acc, key) => ({ ...acc, [key]: enabled }),
        {} as Record<string, boolean>
      );
      setEnabledLagetActivities(newState);
    },
    [enabledLagetActivities]
  );

  // Venue Activities
  const toggleVenueActivity = useCallback((activity: string) => {
    setEnabledVenueActivities(prev => ({
      ...prev,
      [activity]: !prev[activity],
    }));
  }, []);

  const toggleAllVenueActivities = useCallback(
    (enabled: boolean) => {
      const newState = Object.keys(enabledVenueActivities).reduce(
        (acc, key) => ({ ...acc, [key]: enabled }),
        {} as Record<string, boolean>
      );
      setEnabledVenueActivities(newState);
    },
    [enabledVenueActivities]
  );

  // Laget Match Locations
  const toggleLagetMatchLocation = useCallback((location: string) => {
    setEnabledLagetMatchLocations(prev => ({
      ...prev,
      [location]: !prev[location],
    }));
  }, []);

  const toggleAllLagetMatchLocations = useCallback(
    (enabled: boolean) => {
      const newState = Object.keys(enabledLagetMatchLocations).reduce(
        (acc, key) => ({ ...acc, [key]: enabled }),
        {} as Record<string, boolean>
      );
      setEnabledLagetMatchLocations(newState);
    },
    [enabledLagetMatchLocations]
  );

  // Venue Match Locations
  const toggleVenueMatchLocation = useCallback((location: string) => {
    setEnabledVenueMatchLocations(prev => ({
      ...prev,
      [location]: !prev[location],
    }));
  }, []);

  const toggleAllVenueMatchLocations = useCallback(
    (enabled: boolean) => {
      const newState = Object.keys(enabledVenueMatchLocations).reduce(
        (acc, key) => ({ ...acc, [key]: enabled }),
        {} as Record<string, boolean>
      );
      setEnabledVenueMatchLocations(newState);
    },
    [enabledVenueMatchLocations]
  );

  return {
    // Filtered data
    filteredEvents,

    // Data source detection
    hasLagetData,
    hasVenueData,

    // Filter options - Laget
    lagetTeams,
    lagetVenues,
    lagetActivities,
    lagetMatchLocations,

    // Filter options - Venue
    venueTeams,
    venueVenues,
    venueActivities,
    venueMatchLocations,

    // Filter options - Other
    otherTeams,
    hasUndefinedTeams,

    // Filter states - Global
    enabledSources,
    showUndefinedTeams,

    // Filter states - Laget
    enabledLagetTeams,
    enabledLagetVenues,
    enabledLagetActivities,
    enabledLagetMatchLocations,

    // Filter states - Venue
    enabledVenueTeams,
    enabledVenueVenues,
    enabledVenueActivities,
    enabledVenueMatchLocations,

    // Filter states - Other
    enabledOtherTeams,

    // Toggle actions - Global
    toggleDataSource,
    toggleAllDataSources,
    toggleUndefinedTeams,

    // Toggle actions - Laget
    toggleLagetTeam,
    toggleAllLagetTeams,
    toggleLagetVenue,
    toggleAllLagetVenues,
    toggleLagetActivity,
    toggleAllLagetActivities,
    toggleLagetMatchLocation,
    toggleAllLagetMatchLocations,

    // Toggle actions - Venue
    toggleVenueTeam,
    toggleAllVenueTeams,
    toggleVenueVenue,
    toggleAllVenueVenues,
    toggleVenueActivity,
    toggleAllVenueActivities,
    toggleVenueMatchLocation,
    toggleAllVenueMatchLocations,

    // Toggle actions - Other
    toggleOtherTeam,
    toggleAllOtherTeams,
  };
}
