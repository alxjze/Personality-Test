import { Fragment, type ReactNode } from 'react';

/**
 * Minimal, safe renderer for assistant replies: paragraphs, numbered/bulleted lists, **bold**.
 * Builds React elements only (no innerHTML), so model output can never inject markup.
 */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
}

export function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  let list: { ordered: boolean; items: string[] } | null = null;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push(<p key={blocks.length}>{inline(para.join(' '))}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      const items = list.items.map((it, i) => <li key={i}>{inline(it)}</li>);
      blocks.push(
        list.ordered ? (
          <ol key={blocks.length} className="list-decimal space-y-1 pl-5">{items}</ol>
        ) : (
          <ul key={blocks.length} className="list-disc space-y-1 pl-5">{items}</ul>
        ),
      );
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    const ol = line.match(/^\d+[.)]\s+(.*)$/);
    const ul = line.match(/^[-*•]\s+(.*)$/);
    if (ol || ul) {
      flushPara();
      const ordered = !!ol;
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push((ol ?? ul)![1]);
    } else if (line === '') {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line.replace(/^#{1,6}\s+/, ''));
    }
  }
  flushPara();
  flushList();
  return <div className="space-y-2 text-sm leading-relaxed">{blocks}</div>;
}
