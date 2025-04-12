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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [messagesOpen, setMessagesOpen] = useState(false);

  // Process messages and tool invocations to create draggable components
  useEffect(() => {
    messages.forEach(message => {
      if (message.toolInvocations) {
        message.toolInvocations.forEach(toolInvocation => {
          const { toolName, toolCallId, state } = toolInvocation;
          
          if (state === 'result') {
            // Check if this component already exists
            const exists = draggableComponents.some(comp => comp.id === toolCallId);
            
            if (!exists) {
              let newComponent;
              
              if (toolName === 'displayWeather') {
                newComponent = {
                  id: toolCallId,
                  type: 'weather',
                  position: { 
                    x: Math.random() * 300, 
                    y: Math.random() * 200 
                  },
                  data: toolInvocation.result
                };
              } else if (toolName === 'createNote') {
                newComponent = {
                  id: toolCallId,
                  type: 'notes',
                  position: { 
                    x: Math.random() * 300, 
                    y: Math.random() * 200 
                  },
                  data: toolInvocation.result
                };
              }
              
              if (newComponent) {
                setDraggableComponents(prev => [...prev, newComponent]);
              }
            }
          }
        });
      }
    });
  }, [messages]);

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
    e.preventDefault();
    e.stopPropagation();
    
    // Remove the card from the workspace UI
    setDraggableComponents(prev => prev.filter(comp => comp.id !== id));
    
    // Remove the associated message and tool invocation from the chat history
    setMessages(prevMessages => {
      return prevMessages.filter(message => {
        // If this message has tool invocations, check if it's the one we're deleting
        if (message.toolInvocations) {
          const hasMatchingInvocation = message.toolInvocations.some(
            invocation => invocation.toolCallId === id
          );
          // Keep the message only if it doesn't have the matching invocation
          return !hasMatchingInvocation;
        }
        // Keep all other messages
        return true;
      });
    });
    
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