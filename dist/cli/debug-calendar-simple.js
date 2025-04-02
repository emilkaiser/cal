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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Try both sync and direct file approaches to ensure we get some output
function debugCalendar() {
    console.log('Starting simple debug script...');
    console.log('Current working directory:', process.cwd());
    // Possible file paths
    const possiblePaths = [
        path.join(process.cwd(), 'data', 'laget', 'calendar.json'),
        path.join(process.cwd(), 'calendar.json'),
        path.join(__dirname, '..', '..', '..', 'data', 'laget', 'calendar.json'),
    ];
    // Check each path
    for (const filePath of possiblePaths) {
        console.log(`Checking path: ${filePath}`);
        try {
            if (fs.existsSync(filePath)) {
                console.log(`File exists at: ${filePath}`);
                // Read file
                const fileContent = fs.readFileSync(filePath, 'utf8');
                console.log(`File size: ${fileContent.length} bytes`);
                try {
                    // Parse JSON
                    const parsed = JSON.parse(fileContent);
                    console.log(`Parsed successfully. Type: ${Array.isArray(parsed) ? 'array' : typeof parsed}`);
                    if (Array.isArray(parsed)) {
                        console.log(`Array length: ${parsed.length}`);
                        parsed.forEach((item, index) => {
                            console.log('-----------------------------------');
                            console.log(`TI: ${item.title || 'N/A'}`);
                            console.log(`TE: ${item.team || 'N/A'}`);
                            console.log(`FT: ${item.formattedTeam || 'N/A'}`);
                            // console.log(`FormattedTitle: ${item.formattedTitle || 'N/A'}`);
                            // console.log(`Color: ${item.color || 'N/A'}`);
                            // console.log(`Gender: ${item.gender || 'N/A'}`);
                            // console.log(`AgeGroup: ${item.ageGroup || 'N/A'}`);
                        });
                    }
                }
                catch (parseError) {
                    // Fix the error type
                    const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
                    console.error(`Error parsing JSON: ${errorMessage}`);
                    // Print the first 200 characters to see what's in the file
                    console.log(`File starts with: ${fileContent.substring(0, 200)}...`);
                }
                break;
            }
        }
        catch (err) {
            // Fix the error type
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.log(`Error checking ${filePath}: ${errorMessage}`);
        }
    }
}
// Run the function
debugCalendar();
