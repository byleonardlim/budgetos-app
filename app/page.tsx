'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircleIcon } from "lucide-react";
import { Workspace } from '@/components/base/workspace';

// Type for draggable UI components
type DraggableComponent = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
};

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat();
  const [draggableComponents, setDraggableComponents] = useState<DraggableComponent[]>([]);
  const [deletedCardIds, setDeletedCardIds] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [messagesOpen, setMessagesOpen] = useState(false);

  // Process messages and tool invocations to create draggable components
  useEffect(() => {
    console.log('Current component IDs:', draggableComponents.map(c => c.id));
    console.log('Deleted IDs:', Array.from(deletedCardIds));
    // Create a Set of existing component IDs for faster lookup
    const existingIds = new Set(draggableComponents.map(c => c.id));
      
    // Find all tool invocations that should become components
    const componentsToAdd = messages.flatMap(message => 
      (message.toolInvocations || [])
        .filter(invocation => 
          invocation.state === 'result' && 
          !deletedCardIds.has(invocation.toolCallId) &&
          !existingIds.has(invocation.toolCallId)
        )
        .map(invocation => {
          const { toolName, toolCallId, result } = invocation;
          
          if (toolName === 'displayWeather') {
            return {
              id: toolCallId,
              type: 'weather',
              position: { 
                x: Math.random() * 300, 
                y: Math.random() * 200 
              },
              data: result
            };
          } else if (toolName === 'createNote') {
            return {
              id: toolCallId,
              type: 'note',
              position: { 
                x: Math.random() * 300, 
                y: Math.random() * 200 
              },
              data: result
            };
          }
          return null;
        })
        .filter(Boolean) // Remove null values
    );
  
    if (componentsToAdd.length > 0) {
      setDraggableComponents(prev => {
        const newIds = new Set(componentsToAdd.map(c => c.id));
        const filteredPrev = prev.filter(c => !newIds.has(c.id));
        return [...filteredPrev, ...componentsToAdd];
      });
    }
  }, [messages, deletedCardIds]); // Keep these dependencies

  // Card click handler
  const handleCardClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
  };

  // Handle workspace click to clear selection
  const handleWorkspaceClick = () => {
    setSelectedId(null);
  };

  // Delete card handler
  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    setDeletedCardIds(prev => new Set(prev).add(id));
    e.preventDefault();
    e.stopPropagation();
    
    // Remove the card from the workspace UI
    setDraggableComponents(prev => prev.filter(comp => comp.id !== id));
       
    setSelectedId(null);
  };

  // Handle position changes when dragging
  const handlePositionChange = (id: string, position: { x: number; y: number }) => {
    setDraggableComponents(prev => 
      prev.map(comp => 
        comp.id === id 
          ? { ...comp, position }
          : comp
      )
    );
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Workspace component */}
      <Workspace 
        components={draggableComponents}
        selectedId={selectedId}
        hoveredId={hoveredId}
        workspaceRef={workspaceRef}
        onWorkspaceClick={handleWorkspaceClick}
        onCardClick={handleCardClick}
        onDeleteClick={handleDeleteClick}
        onMouseEnter={setHoveredId}
        onMouseLeave={() => setHoveredId(null)}
        onPositionChange={handlePositionChange}
      />
      
      {/* Chat input with popover messages */}
      <div className="m-4 border max-w-screen z-50 absolute inset-x-0 bottom-0 p-4 bg-white/70 backdrop-blur-sm rounded-md">
        <form 
          onSubmit={(e) => {
            handleSubmit(e);
            setMessagesOpen(false);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="w-full pr-10 bg-white/90"
            />
            
            <Popover open={messagesOpen} onOpenChange={setMessagesOpen}>
              <PopoverTrigger asChild>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  onClick={() => setMessagesOpen(true)}
                >
                  <MessageCircleIcon className="h-5 w-5 text-gray-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 max-h-96" align="end" sideOffset={5}>
                <ScrollArea className="h-80">
                  {messages.map(message => (
                    <div key={message.id} className="mb-4">
                      <div className={`text-xs font-bold uppercase ${message.role === 'user' ? 'text-green-600' : 'text-slate-900'}`}>
                        {message.role === 'user' ? 'You' : 'AI'}
                        </div>
                        <div className="text-sm mt-1">{message.content}</div>
                        {message.toolInvocations?.some(inv => deletedCardIds.has(inv.toolCallId)) && (
                          <div className="text-xs text-gray-500">(Card removed)</div>
                        )}
                    </div>
                  ))}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
}