import { Check } from 'lucide-react';

type SquareCheckProps = {
  checked: boolean;
  onClick: () => void;
  label: string;
};

export function SquareCheck({ checked, onClick, label }: SquareCheckProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={checked}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={[
        'mt-[1px] flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px] transition-colors',
        checked
          ? 'border-[#6b8afd] bg-[#6b8afd] text-white'
          : 'border-[#c5c5ce] bg-transparent text-transparent hover:border-[#9aa0b5]',
      ].join(' ')}
    >
      <Check className="size-3" strokeWidth={3} />
    </button>
  );
}
