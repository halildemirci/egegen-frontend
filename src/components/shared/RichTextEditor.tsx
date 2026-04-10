'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Bold, Heading2, Heading3, ImagePlus, Italic, List, ListOrdered, Link2, RemoveFormatting } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function RichTextEditor({ value, onChange, placeholder, error }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (command: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    onChange(editorRef.current?.innerHTML || '');
  };

  const handleLink = () => {
    const url = window.prompt('Bağlantı adresini girin (https://...)');
    if (!url) return;
    exec('createLink', url);
  };

  const handleImage = () => {
    const url = window.prompt('Görsel URL girin (https://...)');
    if (!url) return;
    exec('insertImage', url);
  };

  return (
    <div className={cn('overflow-hidden rounded-lg border bg-background', error && 'border-destructive')}>
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('bold')}>
          <Bold className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('italic')}>
          <Italic className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('formatBlock', '<h2>')}>
          <Heading2 className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('formatBlock', '<h3>')}>
          <Heading3 className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('insertUnorderedList')}>
          <List className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('insertOrderedList')}>
          <ListOrdered className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={handleLink}>
          <Link2 className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={handleImage}>
          <ImagePlus className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => exec('removeFormat')}>
          <RemoveFormatting className="size-4" />
        </Button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || '')}
        className="min-h-40 px-3 py-2 text-sm outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] [&_a]:text-primary [&_a]:underline [&_h2]:mt-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-2 [&_h3]:text-lg [&_h3]:font-semibold [&_img]:my-2 [&_img]:max-h-56 [&_img]:rounded-md [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
        data-placeholder={placeholder || 'Açıklama girin...'}
      />

      {error && <p className="border-t bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
