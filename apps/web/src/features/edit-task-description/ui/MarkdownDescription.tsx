import { useEffect, useState, type ReactNode } from 'react';

type MarkdownDescriptionProps = {
  value: string;
  onChange: (next: string) => void;
};

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(
        <strong key={key++} className="font-semibold text-[var(--ink)]">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('*')) {
      nodes.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    } else {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-[#f3f3f6] px-1 py-0.5 font-mono text-[12px] text-[var(--ink)]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function MarkdownView({
  value,
  onToggleCheck,
}: {
  value: string;
  onToggleCheck: (lineIndex: number) => void;
}) {
  const lines = value.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let listItems: ReactNode[] = [];
  let listKey = 0;

  function flushList() {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`list-${listKey++}`} className="my-2 flex flex-col gap-1.5">
        {listItems}
      </ul>,
    );
    listItems = [];
  }

  lines.forEach((line, index) => {
    const checkMatch = line.match(/^(\s*)[-*] \[([ xX])\] (.+)$/);
    if (checkMatch) {
      const checked = checkMatch[2].toLowerCase() === 'x';
      const label = checkMatch[3];
      listItems.push(
        <li key={`c-${index}`}>
          <button
            type="button"
            onClick={() => onToggleCheck(index)}
            className="flex w-full items-start gap-3 rounded-md px-1 py-1.5 text-left hover:bg-[#f6f6f8]"
          >
            <span
              className={[
                'mt-[2px] flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px] text-[11px] font-bold',
                checked
                  ? 'border-[#6b8afd] bg-[#6b8afd] text-white'
                  : 'border-[#c5c5ce] text-transparent',
              ].join(' ')}
            >
              ✓
            </span>
            <span
              className={[
                'text-[14px] leading-relaxed',
                checked ? 'text-[#8b8b96] line-through' : 'text-[var(--ink)]',
              ].join(' ')}
            >
              {renderInline(label)}
            </span>
          </button>
        </li>,
      );
      return;
    }

    const bulletMatch = line.match(/^(\s*)[-*] (.+)$/);
    if (bulletMatch) {
      listItems.push(
        <li
          key={`b-${index}`}
          className="flex gap-2 px-1 py-0.5 text-[14px] leading-relaxed text-[var(--ink)]"
        >
          <span className="text-[#8b8b96]">•</span>
          <span>{renderInline(bulletMatch[2])}</span>
        </li>,
      );
      return;
    }

    flushList();
    if (!line.trim()) {
      blocks.push(<div key={`sp-${index}`} className="h-2" />);
      return;
    }
    if (line.startsWith('### ')) {
      blocks.push(
        <h4 key={`h3-${index}`} className="mt-4 mb-1 text-[15px] font-semibold text-[var(--ink)]">
          {renderInline(line.slice(4))}
        </h4>,
      );
      return;
    }
    if (line.startsWith('## ')) {
      blocks.push(
        <h3
          key={`h2-${index}`}
          className="mt-5 mb-1.5 text-[17px] font-semibold tracking-[-0.01em] text-[var(--ink)]"
        >
          {renderInline(line.slice(3))}
        </h3>,
      );
      return;
    }
    if (line.startsWith('# ')) {
      blocks.push(
        <h2
          key={`h1-${index}`}
          className="mt-5 mb-2 text-[20px] font-semibold tracking-[-0.02em] text-[var(--ink)]"
        >
          {renderInline(line.slice(2))}
        </h2>,
      );
      return;
    }
    blocks.push(
      <p key={`p-${index}`} className="text-[14px] leading-relaxed text-[var(--ink-soft)]">
        {renderInline(line)}
      </p>,
    );
  });
  flushList();
  return <div className="max-w-2xl">{blocks}</div>;
}

export function MarkdownDescription({ value, onChange }: MarkdownDescriptionProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  function toggleCheck(lineIndex: number) {
    const lines = value.replace(/\r\n/g, '\n').split('\n');
    const line = lines[lineIndex];
    if (!line) return;
    if (line.includes('- [ ] ')) {
      lines[lineIndex] = line.replace('- [ ] ', '- [x] ');
    } else if (line.includes('- [x] ') || line.includes('- [X] ')) {
      lines[lineIndex] = line.replace(/- \[[xX]\] /, '- [ ] ');
    }
    onChange(lines.join('\n'));
  }

  if (editing) {
    return (
      <div className="mt-5 flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[12px] font-medium tracking-[0.04em] text-[#8b8b96] uppercase">
            Markdown
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setDraft(value);
                setEditing(false);
              }}
              className="rounded-md px-3 py-1.5 text-[13px] text-[#8b8b96] hover:bg-[#f3f3f6]"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(draft);
                setEditing(false);
              }}
              className="rounded-md bg-[var(--ink)] px-3 py-1.5 text-[13px] font-medium text-white"
            >
              保存
            </button>
          </div>
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
          className="min-h-[280px] w-full flex-1 resize-y rounded-lg border border-[rgba(55,53,47,0.12)] bg-[#fafafa] px-3 py-3 font-mono text-[13px] leading-relaxed text-[var(--ink)] outline-none focus:border-[#6b8afd]"
          placeholder={
            '説明を Markdown で書く\n\n## やること\n- [ ] 資料を整理する\n- [ ] 発表の原稿を用意する'
          }
          aria-label="タスク説明（Markdown）"
        />
      </div>
    );
  }

  if (!value.trim()) {
    return (
      <div className="mt-8">
        <p className="text-[13px] text-[#8b8b96]">説明はまだありません。</p>
        <button
          type="button"
          onClick={() => {
            setDraft('');
            setEditing(true);
          }}
          className="mt-3 rounded-md border border-[rgba(55,53,47,0.12)] px-3 py-2 text-[13px] text-[var(--ink)] transition-colors hover:bg-[#f6f6f8]"
        >
          説明を追加
        </button>
      </div>
    );
  }

  return (
    <div className="mt-5 flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-center justify-end">
        <button
          type="button"
          onClick={() => {
            setDraft(value);
            setEditing(true);
          }}
          className="rounded-md px-3 py-1.5 text-[13px] text-[var(--ink-soft)] transition-colors hover:bg-[#f6f6f8] hover:text-[var(--ink)]"
        >
          編集
        </button>
      </div>
      <MarkdownView value={value} onToggleCheck={toggleCheck} />
    </div>
  );
}
