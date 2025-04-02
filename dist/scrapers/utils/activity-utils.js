"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivityTypeFromCategories = getActivityTypeFromCategories;
exports.getCupTypeFromTitle = getCupTypeFromTitle;
const types_1 = require("../../types/types");
function getActivityTypeFromCategories(categories) {
    if (!categories || categories.length === 0)
        return undefined;
    if (categories.includes('Match'))
        return types_1.MATCH;
    if (categories.includes('Träning'))
        return types_1.TRAINING;
    if (categories.includes('Övrig aktivitet'))
        return types_1.OTHER;
    return undefined;
}
function getCupTypeFromTitle(title) {
    if (!title)
        return undefined;
    const lowerCaseTitle = title.toLowerCase();
    if (lowerCaseTitle.includes('cup'))
        return types_1.CUP;
    return undefined;
}
