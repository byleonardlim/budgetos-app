import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

type NoteProps = {
  content: string;
  isStreaming?: boolean;
};

export const Note = ({ content, isStreaming = false }: NoteProps) => {
  return (
    <div className="max-w-[240px] text-stone-900">
      <ReactMarkdown>{content}</ReactMarkdown>
      {isStreaming && <span className="animate-pulse">▋</span>}
    </div>
  );
}; 