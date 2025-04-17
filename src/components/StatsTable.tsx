import React from 'react';
import { PlayerStats } from '../lib/rotation';

interface StatsTableProps {
  stats: { [player: string]: PlayerStats };
}

export const StatsTable: React.FC<StatsTableProps> = ({ stats }) => {
  if (!stats || Object.keys(stats).length === 0) {
    return <div className="p-4 border rounded">No player statistics available</div>;
  }

  return (
    <div className="overflow-x-auto">
      <h2 className="text-lg font-bold mb-4">Player Statistics</h2>
      <table className="min-w-full divide-y divide-gray-200 border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Player
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Minutes
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Goalie Minutes
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bench Minutes
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Field Positions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.values(stats).map(s => (
            <tr key={s.name} className="hover:bg-gray-50">
              <td className="px-4 py-2 whitespace-nowrap font-medium">{s.name}</td>
              <td className="px-4 py-2 whitespace-nowrap">{s.totalMinutes}</td>
              <td className="px-4 py-2 whitespace-nowrap">{s.goalieMinutes}</td>
              <td className="px-4 py-2 whitespace-nowrap">{s.benchMinutes}</td>
              <td className="px-4 py-2">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(s.fieldPositions).map(([pos, minutes]) => (
                    <span key={pos} className="inline-block bg-gray-100 px-2 py-1 text-xs rounded">
                      Pos {pos}: {minutes} min
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
