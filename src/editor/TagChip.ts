import { mergeAttributes, Node, InputRule } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export type TagChipColor = 'accent' | 'green' | 'yellow' | 'red';

type InsertTagChipOptions = {
  color?: TagChipColor;
  text?: string;
};

const TAG_COLOR_ALIASES: Record<string, TagChipColor> = {
  red: 'red',
  r: 'red',
  urgent: 'red',
  yellow: 'yellow',
  y: 'yellow',
  wait: 'yellow',
  green: 'green',
  g: 'green',
  done: 'green',
};

function normalizeTagColor(input?: string | null): TagChipColor {
  if (!input) return 'accent';
  const normalized = input.trim().toLowerCase();
  if (normalized === 'blue' || normalized === 'purple') return 'accent';
  if (normalized === 'accent' || normalized === 'red' || normalized === 'yellow' || normalized === 'green') {
    return normalized;
  }
  return TAG_COLOR_ALIASES[normalized] ?? 'accent';
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tagChip: {
      insertTagChip: (options?: InsertTagChipOptions) => ReturnType;
      setTagChipColor: (color: TagChipColor) => ReturnType;
    };
  }
}

export const TagChip = Node.create({
  name: 'tagChip',
  group: 'inline',
  inline: true,
  content: 'text*',
  selectable: false,
  atom: false,

  addAttributes() {
    return {
      color: {
        default: 'accent',
        parseHTML: (element) => normalizeTagColor(element.getAttribute('data-color')),
        renderHTML: (attributes) => ({ 'data-color': attributes.color }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-tag-chip]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-tag-chip': '',
      }),
      '#',
      ['span', { class: 'tag-chip-text' }, 0],
    ];
  },

  addCommands() {
    return {
      insertTagChip:
        (options = {}) =>
          ({ state, chain }) => {
            const text = options.text ?? 'tag';
            const color = options.color ?? 'accent';
            const { from, to } = state.selection;
            const beforePos = Math.max(from - 1, 0);
            const afterPos = Math.min(to + 1, state.doc.content.size);
            const charBefore = from > 1 ? state.doc.textBetween(beforePos, from, '', '') : '';
            const charAfter = state.doc.textBetween(to, afterPos, '', '');
            const needsPrefixSpace = !!charBefore && !/\s/.test(charBefore);
            const needsSuffixSpace = !charAfter || !/\s/.test(charAfter);

            const content: Array<{ type: string; text?: string; attrs?: { color: TagChipColor }; content?: Array<{ type: string; text: string }> }> = [];
            if (needsPrefixSpace) {
              content.push({ type: 'text', text: ' ' });
            }
            content.push({
              type: this.name,
              attrs: { color },
              content: [{ type: 'text', text }],
            });
            if (needsSuffixSpace) {
              content.push({ type: 'text', text: ' ' });
            }

            const chipStart = from + (needsPrefixSpace ? 1 : 0);

            return chain()
              .insertContent(content)
              .setTextSelection({ from: chipStart + 1, to: chipStart + 1 + text.length })
              .run();
          },
      setTagChipColor:
        (color) =>
          ({ commands }) => {
            return commands.updateAttributes(this.name, { color });
          },
    };
  },

  addKeyboardShortcuts() {
    const moveOutOfChip = (direction: 'left' | 'right') => () => {
      const { state } = this.editor;
      const { selection } = state;

      if (!selection.empty) return false;

      const { $from } = selection;
      if ($from.parent.type.name !== this.name) return false;

      const atStart = $from.parentOffset === 0;
      const atEnd = $from.parentOffset === $from.parent.content.size;

      if (direction === 'left' && !atStart) return false;
      if (direction === 'right' && !atEnd) return false;

      const depth = $from.depth;
      const targetPos = direction === 'left' ? $from.before(depth) : $from.after(depth);

      if (direction === 'right') {
        const docSize = state.doc.content.size;
        const nextChar = state.doc.textBetween(targetPos, Math.min(targetPos + 1, docSize), '', '');
        if (!nextChar || !/\s/.test(nextChar)) {
          this.editor
            .chain()
            .focus()
            .insertContentAt(targetPos, ' ')
            .setTextSelection(targetPos + 1)
            .run();
          return true;
        }
        this.editor.commands.setTextSelection(targetPos + 1);
        return true;
      }

      if (direction === 'left') {
        const prevPos = Math.max(0, targetPos - 1);
        const prevChar = state.doc.textBetween(prevPos, targetPos, '', '');
        if (!prevChar || !/\s/.test(prevChar)) {
          this.editor
            .chain()
            .focus()
            .insertContentAt(targetPos, ' ')
            .setTextSelection(targetPos)
            .run();
          return true;
        }
      }

      this.editor.commands.setTextSelection(targetPos);
      return true;
    };

    return {
      ArrowLeft: moveOutOfChip('left'),
      ArrowRight: moveOutOfChip('right'),
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: /(?:^|\s)#(\w+)\s$/i,
        handler: ({ state, range, match }) => {
          const { tr } = state;
          // match[0] is the full match (including potential leading space and trailing space)
          // match[1] is the tag text
          const fullMatch = match[0];
          const tagText = match[1];
          const chipColor = normalizeTagColor(tagText);

          // If there's a leading space, we want to keep it
          const hasLeadingSpace = fullMatch.startsWith(' ');
          const start = hasLeadingSpace ? range.from + 1 : range.from;
          // We replace up to range.to (which includes the trailing space)
          const end = range.to;

          tr.replaceWith(start, end, this.type.create({ color: chipColor }, state.schema.text(tagText)));
          // Add a space after the chip for continued typing
          tr.insertText(' ', start + 1);
          return null;
        },
      }),
    ];
  },

  addProseMirrorPlugins() {
    const tagType = this.type;

    return [
      new Plugin({
        key: new PluginKey('tagChip-empty-cleanup'),
        appendTransaction: (transactions, _oldState, newState) => {
          if (!transactions.some((transaction) => transaction.docChanged)) {
            return null;
          }

          const emptyRanges: Array<{ from: number; to: number }> = [];

          newState.doc.descendants((node, pos) => {
            if (node.type !== tagType) return;
            if (node.textContent.trim().length > 0) return;
            emptyRanges.push({ from: pos, to: pos + node.nodeSize });
          });

          if (emptyRanges.length === 0) {
            return null;
          }

          const tr = newState.tr;
          for (let index = emptyRanges.length - 1; index >= 0; index -= 1) {
            const { from, to } = emptyRanges[index];
            tr.delete(from, to);
          }

          return tr.docChanged ? tr : null;
        },
      }),
    ];
  },
});
