import { Weather } from './weather';
import { Note } from './note';
import { ComponentType } from 'react';

// Define the type for our component registry
type ComponentRegistry = {
  [key: string]: ComponentType<any>;
};

// Create the registry
export const componentRegistry: ComponentRegistry = {
  weather: Weather,
  note: Note,
  // Add more components here as they are created
  // stock: Stock,
  // note: Note,
  // etc.
};

// Helper function to get a component by type
export function getComponentByType(type: string): ComponentType<any> | null {
  return componentRegistry[type] || null;
} 