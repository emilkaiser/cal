"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEventsFromJson = loadEventsFromJson;
exports.saveEventsToJson = saveEventsToJson;
exports.toICSEvents = toICSEvents;
exports.convertEventsToIcs = convertEventsToIcs;
const promises_1 = require("fs/promises");
const ics_1 = require("ics");
const path = __importStar(require("path"));
function loadEventsFromJson(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, promises_1.readFile)(filePath, 'utf8');
            const events = JSON.parse(data);
            // Convert string dates back to Date objects
            return events.map((event) => (Object.assign(Object.assign({}, event), { start: new Date(event.start), end: new Date(event.end) })));
        }
        catch (error) {
            console.error(`Error loading events from ${filePath}:`, error);
            return [];
        }
    });
}
function saveEventsToJson(events, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        // Ensure directory exists
        const dir = path.dirname(filePath);
        yield (0, promises_1.mkdir)(dir, { recursive: true });
        yield (0, promises_1.writeFile)(filePath, JSON.stringify(events, null, 2));
        console.log(`Saved ${events.length} events to ${filePath}`);
    });
}
/**
 * Convert events to ICS format events
 * @param events - List of calendar events
 * @returns List of ICS format events
 */
function toICSEvents(events) {
    return events.map(event => {
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        return {
            uid: event.uid,
            title: event.title,
            start: [
                startDate.getFullYear(),
                startDate.getMonth() + 1,
                startDate.getDate(),
                startDate.getHours(),
                startDate.getMinutes(),
            ],
            end: [
                endDate.getFullYear(),
                endDate.getMonth() + 1,
                endDate.getDate(),
                endDate.getHours(),
                endDate.getMinutes(),
            ],
            description: event.description,
            location: event.location,
            url: event.url,
            categories: event.categories,
        };
    });
}
function convertEventsToIcs(events, outputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (events.length === 0) {
            console.log('No events to convert, skipping ICS creation');
            return;
        }
        const icsEvents = toICSEvents(events);
        // Ensure directory exists
        const dir = path.dirname(outputPath);
        yield (0, promises_1.mkdir)(dir, { recursive: true });
        const { error, value } = (0, ics_1.createEvents)(icsEvents);
        if (error)
            throw error;
        if (!value)
            throw new Error('No calendar data was generated');
        yield (0, promises_1.writeFile)(outputPath, value);
        console.log(`Calendar saved to ${outputPath} with ${icsEvents.length} events`);
    });
}
