'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Weather } from '@/components/weather';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

import { MessageCircleIcon } from "lucide-react";

// Type for draggable UI components
type DraggableComponent = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
};

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [draggableComponents, setDraggableComponents] = useState<DraggableComponent[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [messagesOpen, setMessagesOpen] = useState(false);

  // Process messages and tool invocations to create draggable components
  useEffect(() => {
    messages.forEach(message => {
      if (message.toolInvocations) {
        message.toolInvocations.forEach(toolInvocation => {
          const { toolName, toolCallId, state } = toolInvocation;
          
          if (state === 'result' && toolName === 'displayWeather') {
            // Check if this component already exists
            const exists = draggableComponents.some(comp => comp.id === toolCallId);
            
            if (!exists) {
              const newComponent = {
                id: toolCallId,
                type: 'weather',
                position: { 
                  x: Math.random() * 300, 
                  y: Math.random() * 200 
                },
                data: toolInvocation.result
              };
              
              setDraggableComponents(prev => [...prev, newComponent]);
            }
          }
        });
      }
    });
  }, [messages, draggableComponents]);

  // Drag start handler
  const handleDragStart = (e: React.MouseEvent, id: string) => {
    setActiveId(id);
    setStartPosition({ x: e.clientX, y: e.clientY });
  };

  // Drag handler
  const handleDrag = (e: React.MouseEvent) => {
    if (!activeId) return;
    
    const deltaX = e.clientX - startPosition.x;
    const deltaY = e.clientY - startPosition.y;
    
    setDraggableComponents(prev => 
      prev.map(comp => {
        if (comp.id === activeId) {
          // Calculate new position
          let newX = comp.position.x + deltaX;
          let newY = comp.position.y + deltaY;
          
          // Apply workspace boundaries
          if (workspaceRef.current) {
            const workspace = workspaceRef.current.getBoundingClientRect();
            newX = Math.max(0, Math.min(newX, workspace.width - 200));
            newY = Math.max(0, Math.min(newY, workspace.height - 200));
          }
          
          return {
            ...comp,
            position: { x: newX, y: newY }
          };
        }
        return comp;
      })
    );
    
    setStartPosition({ x: e.clientX, y: e.clientY });
  };

  // Drag end handler
  const handleDragEnd = () => {
    setActiveId(null);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Workspace area */}
      <div 
        ref={workspaceRef}
        className="flex-1 relative bg-gray-50 overflow-hidden"
        onMouseMove={activeId ? handleDrag : undefined}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {/* Draggable components rendered here */}
        {draggableComponents.map(component => (
          <Card 
            key={component.id}
            className={`absolute shadow-md ${activeId === component.id ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
              left: `${component.position.x}px`,
              top: `${component.position.y}px`,
              zIndex: activeId === component.id ? 10 : 1
            }}
            onMouseDown={(e) => handleDragStart(e, component.id)}
          >
            <CardContent className="p-3">
              {component.type === 'weather' && (
                <Weather {...component.data} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Chat input with popover messages */}
      <div className="border-t p-4 bg-white">
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
        className="w-full pr-10"
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
                <div className={`font-medium ${message.role === 'user' ? 'text-blue-600' : 'text-gray-900'}`}>
                  {message.role === 'user' ? 'You' : 'AI'}
                </div>
                <div className="text-sm mt-1">{message.content}</div>
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