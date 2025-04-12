import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

type NotesProps = {
  content: string;
  isStreaming?: boolean;
};

export const Notes = ({ content, isStreaming = false }: NotesProps) => {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown>{content}</ReactMarkdown>
      {isStreaming && <span className="animate-pulse">▋</span>}
    </div>
  );
}; 