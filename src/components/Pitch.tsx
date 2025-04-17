'use client';
import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useDraggable,
  useDroppable,
  closestCenter,
  pointerWithin,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

// Define position labels and their descriptions
const POSITION_LABELS: { [key: number]: string } = {
  1: 'Goalie',
  2: 'Defender (L)',
  3: 'Defender (R)',
  4: 'Midfielder (L)',
  5: 'Midfielder (C)',
  6: 'Midfielder (R)',
  7: 'Forward',
};

// Define position coordinates (where short sides of the field are top and bottom)
const POSITION_COORDINATES: { [key: number]: { x: number; y: number } } = {
  1: { x: 50, y: 90 }, // Goalie
  2: { x: 30, y: 70 }, // Defender Left
  3: { x: 70, y: 70 }, // Defender Right
  4: { x: 25, y: 50 }, // Midfielder Left
  5: { x: 50, y: 50 }, // Midfielder Center
  6: { x: 75, y: 50 }, // Midfielder Right
  7: { x: 50, y: 25 }, // Forward
};

interface PitchProps {
  positions: { [position: number]: string };
  onPositionChange: (newPositions: { [position: number]: string }) => void;
  players: string[];
  enableDrag?: boolean;
}

// Droppable Field Position component
const FieldPosition = ({ id, player, label }: { id: number; player: string; label: string }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `position-${id}`,
    data: { type: 'position', positionId: id },
  });

  return (
    <div
      ref={setNodeRef}
      className={`absolute rounded-full w-20 h-20 flex items-center justify-center text-center border-2 transition-all duration-150 ${
        isOver
          ? 'border-yellow-400 bg-yellow-100/90 scale-110 shadow-lg ring-4 ring-yellow-300/50'
          : player
          ? 'border-blue-600 bg-blue-50/90 shadow-md'
          : 'border-white border-dashed bg-white/40 hover:bg-white/60 hover:border-blue-100'
      }`}
      style={{
        left: `${POSITION_COORDINATES[id].x}%`,
        top: `${POSITION_COORDINATES[id].y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 20,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div className="flex flex-col items-center">
        <div className={`text-xs ${player ? 'text-blue-700' : 'text-white'} font-semibold mb-1`}>
          {label}
        </div>
        <div className={`text-sm font-bold ${player ? 'text-blue-900' : 'text-gray-200'}`}>
          {player || 'Drop here'}
        </div>
      </div>
    </div>
  );
};

// Draggable Player component
const DraggablePlayer = ({
  name,
  position,
  onDragStart,
}: {
  name: string;
  position?: number;
  onDragStart?: (name: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `player-${name}`,
    data: { type: 'player', playerName: name, position },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 1000 : position ? 30 : 1,
      }
    : {
        zIndex: position ? 30 : 1,
      };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${
        position ? 'absolute' : 'mb-2'
      } bg-blue-600 text-white shadow-md hover:shadow-lg border border-blue-700 rounded-lg py-2 px-3 cursor-grab transition-transform duration-100 ${
        isDragging ? 'opacity-75 scale-105 shadow-xl rotate-1' : 'hover:bg-blue-700 hover:scale-102'
      }`}
      onDragStart={() => onDragStart?.(name)}
    >
      {name}
    </div>
  );
};

export const Pitch: React.FC<PitchProps> = ({
  positions,
  onPositionChange,
  players,
  enableDrag = true,
}) => {
  const [draggingPlayer, setDraggingPlayer] = useState<string | null>(null);

  // Get all assigned players
  const assignedPlayers = Object.values(positions);

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'player') {
      setDraggingPlayer(event.active.data.current.playerName);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingPlayer(null);
    const { active, over } = event;

    if (!over) return;

    // Check if we're dragging a player to a position
    if (active.data.current?.type === 'player' && over.data.current?.type === 'position') {
      const playerName = active.data.current.playerName;
      const positionId = over.data.current.positionId;
      const currentPosition = active.data.current.position;

      // Update positions
      const newPositions = { ...positions };

      // If this player is already assigned to any position, remove them
      Object.entries(newPositions).forEach(([pos, player]) => {
        if (player === playerName) {
          delete newPositions[parseInt(pos)];
        }
      });

      // If we're dropping onto a position that already has a player, handle replacement
      if (newPositions[positionId]) {
        // We already removed the dragged player from their position above
      }

      // Assign player to new position
      newPositions[positionId] = playerName;
      onPositionChange(newPositions);
    }

    // Handle dragging between positions (swapping players)
    if (active.data.current?.type === 'player' && over.data.current?.type === 'player') {
      const draggedPlayerName = active.data.current.playerName;
      const targetPlayerName = over.data.current.playerName;

      if (draggedPlayerName === targetPlayerName) return;

      const newPositions = { ...positions };

      // Find positions of both players
      let draggedPosition: number | null = null;
      let targetPosition: number | null = null;

      Object.entries(newPositions).forEach(([pos, player]) => {
        if (player === draggedPlayerName) draggedPosition = parseInt(pos);
        if (player === targetPlayerName) targetPosition = parseInt(pos);
      });

      // Swap positions if both players are on the field
      if (draggedPosition !== null && targetPosition !== null) {
        newPositions[draggedPosition] = targetPlayerName;
        newPositions[targetPosition] = draggedPlayerName;
        onPositionChange(newPositions);
      }
    }
  };

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="flex flex-col md:flex-row gap-4">
        {/* Soccer pitch with proper aspect ratio (typically 105:68) */}
        <div className="flex-grow relative w-full aspect-[105/68] max-h-[500px] bg-gradient-to-b from-green-600 to-green-700 border border-gray-300 rounded-lg overflow-hidden shadow-md">
          {/* Field markings */}
          {/* Main outline */}
          <div className="absolute inset-4 border-2 border-white" />

          {/* Center line */}
          <div
            className="absolute left-0 right-0 top-1/2 border-t-2 border-white"
            style={{ transform: 'translateY(-1px)' }}
          />

          {/* Center circle */}
          <div
            className="absolute w-32 h-32 rounded-full border-2 border-white left-1/2 top-1/2"
            style={{ transform: 'translate(-50%, -50%)' }}
          />

          {/* Center spot */}
          <div
            className="absolute w-3 h-3 rounded-full bg-white left-1/2 top-1/2"
            style={{ transform: 'translate(-50%, -50%)' }}
          />

          {/* Goal areas - Top */}
          <div
            className="absolute left-1/2 top-4 w-24 h-12 border-2 border-white"
            style={{ transform: 'translateX(-50%)' }}
          />

          {/* Goal box - Top */}
          <div
            className="absolute left-1/2 top-4 w-48 h-20 border-2 border-white"
            style={{ transform: 'translateX(-50%)' }}
          />

          {/* Goal areas - Bottom */}
          <div
            className="absolute left-1/2 bottom-4 w-24 h-12 border-2 border-white"
            style={{ transform: 'translateX(-50%)' }}
          />

          {/* Goal box - Bottom */}
          <div
            className="absolute left-1/2 bottom-4 w-48 h-20 border-2 border-white"
            style={{ transform: 'translateX(-50%)' }}
          />

          {/* Field texture stripes */}
          <div className="absolute inset-0 bg-stripes opacity-10"></div>

          {/* Position drop zones */}
          {Object.entries(POSITION_LABELS).map(([posNum, label]) => {
            const position = parseInt(posNum);
            return (
              <FieldPosition
                key={position}
                id={position}
                player={positions[position] || ''}
                label={label}
              />
            );
          })}

          {/* Players on the field that can be dragged */}
          {enableDrag &&
            Object.entries(positions).map(([pos, playerName]) => {
              const position = parseInt(pos);
              if (playerName && playerName !== draggingPlayer) {
                return (
                  <div
                    key={`draggable-${playerName}`}
                    style={{
                      position: 'absolute',
                      left: `${POSITION_COORDINATES[position].x}%`,
                      top: `${POSITION_COORDINATES[position].y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 25,
                    }}
                  >
                    <DraggablePlayer
                      name={playerName}
                      position={position}
                      onDragStart={() => setDraggingPlayer(playerName)}
                    />
                  </div>
                );
              }
              return null;
            })}
        </div>

        <div className="w-full md:w-1/4 min-w-0">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <h3 className="font-semibold mb-3 text-gray-700">Available Players</h3>
            <div className="border rounded-lg p-3 max-h-[350px] overflow-y-auto bg-gray-50">
              {players.filter(player => !assignedPlayers.includes(player)).length === 0 ? (
                <div className="text-center py-8 text-gray-400">All players are on the field</div>
              ) : (
                players.map(player => {
                  // Skip players already assigned to positions
                  if (assignedPlayers.includes(player)) return null;

                  return (
                    <DraggablePlayer
                      key={player}
                      name={player}
                      onDragStart={() => setDraggingPlayer(player)}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
};
