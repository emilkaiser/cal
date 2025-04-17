import React, { useState } from 'react';

interface PlayerListProps {
  players: string[];
  goalies: string[];
  onToggleGoalie: (player: string) => void;
  onAddPlayer?: (name: string) => void;
  onRemovePlayer?: (name: string) => void;
}

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  goalies,
  onToggleGoalie,
  onAddPlayer,
  onRemovePlayer,
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  const handleAddPlayer = () => {
    if (newPlayerName.trim() && onAddPlayer) {
      onAddPlayer(newPlayerName.trim());
      setNewPlayerName('');
      setIsAddingPlayer(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-blue-900">Player Management</h3>
          <button
            onClick={() => setIsAddingPlayer(prev => !prev)}
            className="flex items-center justify-center bg-blue-600 text-white rounded-full w-7 h-7 hover:bg-blue-700 transition-colors shadow-sm"
            title={isAddingPlayer ? 'Cancel' : 'Add Player'}
          >
            <span>{isAddingPlayer ? '×' : '+'}</span>
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

      {/* Player list */}
      <div className="max-h-[400px] overflow-y-auto p-2">
        {players.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No players added yet</div>
        ) : (
          <div className="space-y-2">
            {players.map(player => (
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
                    onClick={() => onToggleGoalie(player)}
                    title={goalies.includes(player) ? 'Remove goalie status' : 'Mark as goalie'}
                  >
                    {goalies.includes(player) ? 'Goalie ✓' : 'Goalie'}
                  </button>
                  {onRemovePlayer && (
                    <button
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      onClick={() => onRemovePlayer(player)}
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
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
        <p>Players marked as goalies are highlighted with a yellow indicator.</p>
      </div>
    </div>
  );
};
