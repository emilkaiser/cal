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
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
function printVenueProperties() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Path to venue data - try different potential locations
            const possiblePaths = [
                path.join(process.cwd(), 'data', 'venue', 'all.json'),
                path.join(process.cwd(), 'data', 'venue', 'aspuddens-ip-1.json'),
                path.join(process.cwd(), 'data', 'venue', 'aspuddens-ip-2.json'),
                path.join(process.cwd(), 'data', 'venue', 'vastberga-ip.json'),
                path.join(__dirname, '..', '..', '..', 'data', 'venue', 'all.json'),
            ];
            // Find the first path that exists
            let filePath = '';
            let fileExists = false;
            for (const p of possiblePaths) {
                try {
                    yield fs.access(p);
                    filePath = p;
                    fileExists = true;
                    console.log(`Found venue data at: ${p}`);
                    break;
                }
                catch (err) {
                    console.log(`File not found at: ${p}`);
                }
            }
            if (!fileExists) {
                console.error('ERROR: Venue data file not found in any expected location.');
                return;
            }
            // Read the venue data
            console.log(`Reading file from: ${filePath}`);
            const data = yield fs.readFile(filePath, 'utf8');
            // Parse JSON
            console.log('Parsing JSON data...');
            let events;
            try {
                events = JSON.parse(data);
            }
            catch (e) {
                console.error('Failed to parse JSON:', e);
                return;
            }
            if (!Array.isArray(events)) {
                console.error('ERROR: Data is not an array');
                console.log('Data type:', typeof events);
                return;
            }
            if (events.length === 0) {
                console.error('WARNING: No events found in the file');
                return;
            }
            console.log(`Found ${events.length} venue events in the file`);
            // Prepare data for table formatting
            const headers = [
                'title',
                'location',
                'team',
                'match',
                'opponent',
                'gender',
                'ageGroup',
                'formattedTeam',
                'start',
            ];
            const rows = [];
            // Collect data and determine max column widths
            const colWidths = headers.map(h => h.length);
            for (const event of events) {
                if (event && typeof event === 'object') {
                    // Format the start time to be more readable
                    const startTime = event.start instanceof Date
                        ? event.start.toLocaleString()
                        : typeof event.start === 'string'
                            ? new Date(event.start).toLocaleString()
                            : 'Invalid date';
                    const row = [
                        event.title || '',
                        event.location || '',
                        event.team || '',
                        event.match || '',
                        event.opponent || '',
                        event.gender || '',
                        event.ageGroup || '',
                        event.formattedTeam || '',
                        startTime,
                    ];
                    // Update column widths
                    row.forEach((cell, i) => {
                        colWidths[i] = Math.max(colWidths[i], cell.length);
                    });
                    rows.push(row);
                }
            }
            // Add some extra padding
            const paddedColWidths = colWidths.map(w => w + 2);
            // Print header
            console.log(headers.map((header, i) => header.padEnd(paddedColWidths[i])).join('│'));
            // Print separator
            console.log(paddedColWidths.map(width => '─'.repeat(width)).join('┼'));
            // Print rows
            for (const row of rows) {
                console.log(row.map((cell, i) => cell.padEnd(paddedColWidths[i])).join('│'));
            }
            console.log(`\nProcessed and displayed ${rows.length} venue events`);
            // Print raw data examples for reference
            if (events.length > 0 && events[0].rawData) {
                console.log('\nExample of raw match data:');
                const rawData = events[0].rawData;
                console.log(JSON.stringify(rawData, null, 2));
            }
        }
        catch (error) {
            console.error('Error processing venue data:', error);
        }
    });
}
// Run the function if this file is executed directly
if (require.main === module) {
    console.log('Starting venue debug script...');
    console.log('Current working directory:', process.cwd());
    printVenueProperties()
        .then(() => console.log('Venue debug script completed'))
        .catch(error => console.error('Failed to run venue debug script:', error));
}
