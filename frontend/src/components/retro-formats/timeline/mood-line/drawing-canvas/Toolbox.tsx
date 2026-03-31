import { memo, useMemo } from 'react';
import { useMediaQuery } from '../../../../../hooks/env/useMediaQuery';
import type { Tool } from './DrawingCanvas';
import { penImage } from './pen-tool';
import { eraserImage } from './eraser-tool';

interface PropsT {
  tools: Tool[];
  current: Tool | null;
  onChange: (tool: Tool) => void;
}

export const Toolbox = memo(({ tools, current, onChange }: PropsT) => {
  const darkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const icons = useMemo(
    () =>
      tools.map((tool) => ({
        tool,
        icon: toolIcon(tool, darkMode ? '#333333' : '#000000'),
      })),
    [tools, darkMode],
  );

  return (
    <div className="toolbox">
      {icons.map(({ tool, icon }, i) => (
        <button
          key={i}
          type="button"
          aria-pressed={current === tool}
          title={tool.name}
          onClick={() => onChange(tool)}
        >
          <img src={icon} alt={tool.name} />
        </button>
      ))}
    </div>
  );
});

function toolIcon(tool: Tool, outline: string) {
  switch (tool.type) {
    case 'pen':
      return penImage(tool, outline);
    case 'eraser':
      return eraserImage(tool, outline);
    default:
      return '';
  }
}
