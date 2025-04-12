'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { Weather } from '@/components/weather';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { getComponentByType } from '@/components/registry';

import { useState } from 'react';

type DraggableComponent = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
};

interface DraggableCardProps {
  component: DraggableComponent;
  selectedId: string | null;
  hoveredId: string | null;
  isDragging: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onHover: (id: string | null) => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
}

export function DraggableCard({
  component,
  selectedId,
  hoveredId,
  isDragging,
  onSelect,
  onDelete,
  onHover,
  onDragStart
}: DraggableCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(component.id);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragStart(component.id, e);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(component.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card
        id={component.id}
        data-card="true"
        className={`absolute shadow-md transition-all
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          ${selectedId === component.id 
            ? 'border-2 border-blue-500 ring-2 ring-blue-500/20 shadow-lg' 
            : 'border border-gray-200'}`}
        style={{
          left: `${component.position.x}px`,
          top: `${component.position.y}px`,
          zIndex: selectedId === component.id ? 10 : 1
        }}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => onHover(component.id)}
        onMouseLeave={() => onHover(null)}
      >
        {(hoveredId === component.id || selectedId === component.id) && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 w-6 h-6 rounded-full z-20"
            onClick={handleDeleteClick}
          >
            <XIcon className="h-3 w-3" />
          </Button>
        )}
        <CardContent className="p-3">
          {(() => {
            const Component = getComponentByType(component.type);
            return Component ? <Component {...component.data} /> : null;
          })()}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this card? It will be removed from both your workspace and chat history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              No, keep it
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, remove it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 