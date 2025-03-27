"use strict";
// import * as path from 'path';
// import * as fs from 'fs/promises';
// import { loadEventsFromJson, convertEventsToIcs } from '../utils/ics-converter';
// async function findJsonFiles(directory: string): Promise<string[]> {
//   const files = await fs.readdir(directory, { withFileTypes: true });
//   const jsonFiles: string[] = [];
//   for (const file of files) {
//     const fullPath = path.join(directory, file.name);
//     if (file.isDirectory()) {
//       const subDirFiles = await findJsonFiles(fullPath);
//       jsonFiles.push(...subDirFiles);
//     } else if (file.name.endsWith('.json')) {
//       jsonFiles.push(fullPath);
//     }
//   }
//   return jsonFiles;
// }
// async function generateAllIcsFiles(dataDir: string = 'data', outputDir: string = 'public') {
//   try {
//     // Ensure the output directory exists
//     await fs.mkdir(outputDir, { recursive: true });
//     // Find all JSON files in the data directory
//     const jsonFiles = await findJsonFiles(dataDir);
//     console.log(`Found ${jsonFiles.length} JSON data files`);
//     for (const jsonFile of jsonFiles) {
//       // Determine the relative path to maintain the same structure in output
//       const relativePath = path.relative(dataDir, jsonFile);
//       const outputPath = path.join(
//         outputDir,
//         path.dirname(relativePath),
//         `${path.basename(relativePath, '.json')}.ics`
//       );
//       // Create the directory structure
//       await fs.mkdir(path.dirname(outputPath), { recursive: true });
//       // Load events from JSON and convert to ICS
//       const events = await loadEventsFromJson(jsonFile);
//       await convertEventsToIcs(events, outputPath);
//     }
//     console.log('All ICS files generated successfully');
//   } catch (error) {
//     console.error('Error generating ICS files:', error);
//   }
// }
// // Allow specifying custom directories as command line arguments
// async function main() {
//   const args = process.argv.slice(2);
//   let dataDir = 'data';
//   let outputDir = 'public';
//   for (let i = 0; i < args.length; i++) {
//     if (args[i] === '--data' && i + 1 < args.length) {
//       dataDir = args[i + 1];
//       i++;
//     } else if (args[i] === '--output' && i + 1 < args.length) {
//       outputDir = args[i + 1];
//       i++;
//     }
//   }
//   await generateAllIcsFiles(dataDir, outputDir);
// }
// if (require.main === module) {
//   main().catch(console.error);
// }
