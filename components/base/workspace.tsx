'use client';

import { useState, useRef } from 'react';
import { DraggableCard } from './draggable-card';

// Type for draggable UI components
type DraggableComponent = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
};

interface WorkspaceProps {
  components: DraggableComponent[];
  selectedId: string | null;
  hoveredId: string | null;
  workspaceRef: React.RefObject<HTMLDivElement>;
  onWorkspaceClick: () => void;
  onCardClick: (e: React.MouseEvent, id: string) => void;
  onDeleteClick: (e: React.MouseEvent, id: string) => void;
  onMouseEnter: (id: string | null) => void;
  onMouseLeave: () => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
}

export function Workspace({
  components,
  selectedId,
  hoveredId,
  workspaceRef,
  onWorkspaceClick,
  onCardClick,
  onDeleteClick,
  onMouseEnter,
  onPositionChange
}: WorkspaceProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (id: string, e: React.MouseEvent) => {
    setIsDragging(true);
    setDraggingId(id);
    setStartPosition({ x: e.clientX, y: e.clientY });
    onCardClick(e, id); // Add this line to select the card when drag starts
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggingId) return;

    const deltaX = e.clientX - startPosition.x;
    const deltaY = e.clientY - startPosition.y;

    const draggingComponent = components.find(comp => comp.id === draggingId);
    if (!draggingComponent) return;

    let newX = draggingComponent.position.x + deltaX;
    let newY = draggingComponent.position.y + deltaY;

    // Apply workspace boundaries
    if (workspaceRef.current) {
      const workspace = workspaceRef.current.getBoundingClientRect();
      newX = Math.max(0, Math.min(newX, workspace.width - 200));
      newY = Math.max(0, Math.min(newY, workspace.height - 200));
    }

    onPositionChange(draggingId, { x: newX, y: newY });
    setStartPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingId(null);
  };

  const handleWorkspaceClick = (e: React.MouseEvent) => {
    // Only trigger workspace click if we're not clicking a card
    if (!(e.target as HTMLElement).closest('[data-card]')) {
      onWorkspaceClick();
    }
  };

  return (
    <div
      ref={workspaceRef}
      className="flex-1 relative bg-gray-100 overflow-hidden"
      onClick={handleWorkspaceClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {components.map(component => (
        <DraggableCard
          key={component.id}
          component={component}
          selectedId={selectedId}
          hoveredId={hoveredId}
          isDragging={isDragging && draggingId === component.id}
          draggingId={draggingId}
          onSelect={(id) => {
            const mouseEvent = new MouseEvent('click');
            const syntheticEvent = {
              ...mouseEvent,
              preventDefault: () => {},
              stopPropagation: () => {},
              nativeEvent: mouseEvent,
              currentTarget: document.createElement('div'),
              target: document.createElement('div'),
            } as unknown as React.MouseEvent<Element, MouseEvent>;
            onCardClick(syntheticEvent, id);
          }}
          onDelete={(id) => {
            const mouseEvent = new MouseEvent('click');
            const syntheticEvent = {
              ...mouseEvent,
              preventDefault: () => {},
              stopPropagation: () => {},
              nativeEvent: mouseEvent,
              currentTarget: document.createElement('div'),
              target: document.createElement('div'),
            } as unknown as React.MouseEvent<Element, MouseEvent>;
            onDeleteClick(syntheticEvent, id);
          }}
          onHover={onMouseEnter}
          onDragStart={handleDragStart}
        />
      ))}
    </div>
  );
}