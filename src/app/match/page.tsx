'use client';

import React, { useState } from 'react';
import { Pitch } from '@/components/Pitch';

// Define position labels and their descriptions - needed for player position display
const POSITION_LABELS: { [key: number]: string } = {
  1: 'Goalie',
  2: 'Defender (L)',
  3: 'Defender (R)',
  4: 'Midfielder (L)',
  5: 'Midfielder (C)',
  6: 'Midfielder (R)',
  7: 'Forward',
};

// Starting with default players named "Player 1", "Player 2", etc.
const initialPlayers: string[] = Array.from({ length: 8 }, (_, i) => `Player ${i + 1}`);
const initialPositions: { [position: number]: string } = {};

export default function MatchPage() {
  // State for managing players and positions
  const [players, setPlayers] = useState(initialPlayers);
  const [goalies, setGoalies] = useState<string[]>([]);
  const [positions, setPositions] = useState(initialPositions);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [activeTab, setActiveTab] = useState<'available' | 'on-field'>('available');

  // Handler for position changes on the pitch - including automatic goalie designation
  const handlePositionChange = (newPositions: { [position: number]: string }) => {
    setPositions(newPositions);

    // Automatically update goalies list when a player is placed in position 1 (goalie)
    if (newPositions[1] && !goalies.includes(newPositions[1])) {
      setGoalies([...goalies, newPositions[1]]);
    }
  };

  // Handler for toggling goalies manually
  const handleToggleGoalie = (player: string) => {
    if (goalies.includes(player)) {
      setGoalies(goalies.filter(p => p !== player));
    } else {
      setGoalies([...goalies, player]);
    }
  };

  // Handler for adding a new player
  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayers([...players, newPlayerName.trim()]);
      setNewPlayerName('');
      setIsAddingPlayer(false);
    }
  };

  // Handler for removing a player
  const handleRemovePlayer = (playerToRemove: string) => {
    // Remove player from all positions
    const newPositions = { ...positions };
    Object.entries(newPositions).forEach(([pos, player]) => {
      if (player === playerToRemove) {
        delete newPositions[Number(pos)];
      }
    });

    // Remove player from lists
    setPlayers(players.filter(player => player !== playerToRemove));
    setGoalies(goalies.filter(player => player !== playerToRemove));
    setPositions(newPositions);
  };

  // Handler for removing a player from a position
  const handleRemoveFromPosition = (playerToRemove: string) => {
    const newPositions = { ...positions };
    Object.entries(newPositions).forEach(([pos, player]) => {
      if (player === playerToRemove) {
        delete newPositions[Number(pos)];
      }
    });
    setPositions(newPositions);
  };

  // Get assigned and unassigned players
  const assignedPlayers = Object.values(positions);
  const unassignedPlayers = players.filter(player => !assignedPlayers.includes(player));

  // Get player position
  const getPlayerPosition = (playerName: string): number | null => {
    for (const [pos, player] of Object.entries(positions)) {
      if (player === playerName) return Number(pos);
    }
    return null;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Soccer Field Builder</h1>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-8">
        <div className="lg:col-span-5">
          <h2 className="text-xl font-semibold mb-3">Field Positions</h2>
          <Pitch positions={positions} onPositionChange={handlePositionChange} players={players} />
          <div className="mt-4 text-sm text-gray-600">
            <p>Drag players onto positions on the field.</p>
            <p className="mt-1">
              Player in position 1 (Goalie) will automatically be marked as a goalie.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-500">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-white">Player Management</h3>
                <button
                  onClick={() => setIsAddingPlayer(prev => !prev)}
                  className="flex items-center justify-center bg-white text-blue-600 rounded-full w-7 h-7 hover:bg-blue-50 transition-colors shadow-sm"
                  title={isAddingPlayer ? 'Cancel' : 'Add Player'}
                >
                  <span className="text-lg leading-none">{isAddingPlayer ? '×' : '+'}</span>
                </button>
              </div>
            </div>

            {/* Add player form */}
            {isAddingPlayer && (
              <div className="p-4 border-b border-gray-200 bg-blue-50">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={e => setNewPlayerName(e.target.value)}
                  placeholder="Enter player name..."
                  className="w-full p-2 border border-gray-300 rounded mb-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddPlayer();
                  }}
                  autoFocus
                />
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                    onClick={handleAddPlayer}
                    disabled={!newPlayerName.trim()}
                  >
                    Add Player
                  </button>
                </div>
              </div>
            )}

            {/* Player Tabs - Available & On Field Players */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  className={`flex-1 font-medium text-sm py-2 px-1 transition-colors ${
                    activeTab === 'available'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('available')}
                >
                  Available ({unassignedPlayers.length})
                </button>
                <button
                  className={`flex-1 font-medium text-sm py-2 px-1 transition-colors ${
                    activeTab === 'on-field'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('on-field')}
                >
                  On Field ({assignedPlayers.length})
                </button>
              </div>
            </div>

            {/* Player list - Available Tab */}
            {activeTab === 'available' && (
              <div className="max-h-[350px] overflow-y-auto p-2">
                {unassignedPlayers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">All players are on the field</div>
                ) : (
                  <div className="space-y-2">
                    {unassignedPlayers.map(player => (
                      <div
                        key={player}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-3 ${
                              goalies.includes(player) ? 'bg-yellow-400' : 'bg-gray-300'
                            }`}
                          />
                          <span className="font-medium">{player}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                              goalies.includes(player)
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            onClick={() => handleToggleGoalie(player)}
                            title={
                              goalies.includes(player) ? 'Remove goalie status' : 'Mark as goalie'
                            }
                          >
                            {goalies.includes(player) ? 'Goalie ✓' : 'Goalie'}
                          </button>
                          <button
                            className="p-1 text-red-500 hover:text-red-700 transition-colors"
                            onClick={() => handleRemovePlayer(player)}
                            title="Remove Player"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Player list - On Field Tab */}
            {activeTab === 'on-field' && (
              <div className="max-h-[350px] overflow-y-auto p-2">
                {assignedPlayers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No players are on the field yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assignedPlayers.map(player => {
                      const positionId = getPlayerPosition(player);
                      const positionLabel = positionId ? POSITION_LABELS[positionId] : '';

                      return (
                        <div
                          key={player}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-2 h-2 rounded-full mr-3 ${
                                goalies.includes(player) ? 'bg-yellow-400' : 'bg-blue-500'
                              }`}
                            />
                            <div>
                              <span className="font-medium">{player}</span>
                              <div className="text-xs text-gray-500">{positionLabel}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                goalies.includes(player)
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              onClick={() => handleToggleGoalie(player)}
                              title={
                                goalies.includes(player) ? 'Remove goalie status' : 'Mark as goalie'
                              }
                            >
                              {goalies.includes(player) ? 'Goalie ✓' : 'Goalie'}
                            </button>
                            <button
                              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                              onClick={() => handleRemoveFromPosition(player)}
                              title="Remove from position"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M18 6L6 18"></path>
                                <path d="M6 6l12 12"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
              <p>Players marked as goalies are highlighted with a yellow indicator.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
