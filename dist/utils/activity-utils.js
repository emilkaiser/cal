"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACTIVITY_TYPES = void 0;
exports.getActivityTypeFromCategories = getActivityTypeFromCategories;
exports.ACTIVITY_TYPES = {
    MATCH: 'Match',
    TRAINING: 'Träning',
    CUP: 'Cup',
    TOURNAMENT: 'Turnering',
    MEETING: 'Möte',
    EVENT: 'Event',
    OTHER: 'Övrigt',
};
/**
 * Determines the activity type from event categories
 * @param categories Array of category strings
 * @returns Activity type or "unknown"
 */
function getActivityTypeFromCategories(categories) {
    if (!categories || categories.length === 0)
        return 'unknown';
    if (categories.includes('Match'))
        return exports.ACTIVITY_TYPES.MATCH;
    if (categories.includes('Träning'))
        return exports.ACTIVITY_TYPES.TRAINING;
    if (categories.includes('Övrig aktivitet'))
        return exports.ACTIVITY_TYPES.OTHER;
    return 'unknown';
}
