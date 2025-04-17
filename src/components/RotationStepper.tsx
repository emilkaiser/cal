import React, { useState, useEffect } from 'react';
import { MinuteRecord } from '../lib/rotation';

interface RotationStepperProps {
  schedule: MinuteRecord[];
  onPositionUpdate?: (positions: { [position: number]: string }, bench: string[]) => void;
}

// Determine if a record is an important event (change or intermission)
const isImportantEvent = (curr: MinuteRecord, prev: MinuteRecord | null): boolean => {
  // If it's the first record, it's important
  if (!prev) return true;

  // Check if it's the start of a new period (0, 20, 40)
  if (curr.minute % 20 === 0) return true;

  // Check if goalie has changed
  if (curr.goalie !== prev.goalie) return true;

  // Check if field positions have changed
  const prevPositions = Object.keys(prev.field);
  const currPositions = Object.keys(curr.field);

  // Different number of positions filled
  if (prevPositions.length !== currPositions.length) return true;

  // Check all field positions for changes
  for (const pos of currPositions) {
    const posNum = Number(pos);
    if (curr.field[posNum] !== prev.field[posNum]) {
      return true;
    }
  }

  // Check if bench has changed
  if (prev.bench.length !== curr.bench.length) return true;

  for (let i = 0; i < curr.bench.length; i++) {
    if (!prev.bench.includes(curr.bench[i])) return true;
  }

  return false;
};

export const RotationStepper: React.FC<RotationStepperProps> = ({ schedule, onPositionUpdate }) => {
  const [importantRecords, setImportantRecords] = useState<MinuteRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Process the schedule to identify only important events
  useEffect(() => {
    if (!schedule || schedule.length === 0) return;

    const important: MinuteRecord[] = [];
    let prevRecord: MinuteRecord | null = null;

    for (const record of schedule) {
      if (isImportantEvent(record, prevRecord)) {
        important.push(record);
        prevRecord = record;
      }
    }

    setImportantRecords(important);
    setCurrentIndex(0);
  }, [schedule]);

  // Update pitch when current record changes
  useEffect(() => {
    if (importantRecords.length > 0 && onPositionUpdate) {
      const currentRecord = importantRecords[currentIndex];
      onPositionUpdate(currentRecord.field, currentRecord.bench);
    }
  }, [currentIndex, importantRecords, onPositionUpdate]);

  if (!importantRecords || importantRecords.length === 0) {
    return <div className="p-4 border rounded">No rotation schedule available</div>;
  }

  const currentRecord = importantRecords[currentIndex];
  const getEventType = (minute: number) => {
    if (minute === 0) return 'First Period Start';
    if (minute === 20) return 'Second Period Start';
    if (minute === 40) return 'Third Period Start';
    if (minute % 5 === 0) return `Substitution (Minute ${minute})`;
    return `Minute ${minute}`;
  };

  // Navigation handlers
  const handlePrevious = () => {
    setCurrentIndex(prev => prev - 1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <div className="p-4 border rounded shadow-sm">
      <h2 className="text-lg font-bold mb-4">Rotation Schedule</h2>
      <div className="bg-gray-50 p-4 rounded mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Event</p>
            <p className="font-bold text-xl">{getEventType(currentRecord.minute)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Goalie</p>
            <p className="font-semibold">{currentRecord.goalie}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-gray-600 text-sm">Field Players</p>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {Object.entries(currentRecord.field).map(([pos, player]) => (
              <div key={pos} className="bg-white p-2 border rounded">
                <p className="text-xs text-gray-500">Position {pos}</p>
                <p className="font-medium">{player}</p>
              </div>
            ))}
          </div>
        </div>

        {currentRecord.bench.length > 0 && (
          <div className="mt-4">
            <p className="text-gray-600 text-sm">Bench</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {currentRecord.bench.map((player: string) => (
                <div key={player} className="bg-gray-100 px-3 py-1 rounded">
                  {player}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
          disabled={currentIndex === 0}
          onClick={handlePrevious}
        >
          Previous
        </button>
        <div className="text-center">
          <span className="text-sm text-gray-500">
            {currentIndex + 1} of {importantRecords.length}
          </span>
        </div>
        <button
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
          disabled={currentIndex === importantRecords.length - 1}
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
};
