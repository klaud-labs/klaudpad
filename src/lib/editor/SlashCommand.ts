import { Extension, Editor, Range } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { getSuggestionConfig } from '@/lib/editor/suggestion';
import { CommandItem } from '@/components/editor/CommandMenu';
import { TagChipColor } from '@/editor/TagChip';
import { emitOpenDatePicker } from '@/lib/editor/datePickerEvent';
import {
    LuCalendarDays,
    LuCode,
    LuHeading1,
    LuHeading2,
    LuHeading3,
    LuList,
    LuListOrdered,
    LuListTodo,
    LuMinus,
    LuPilcrow,
    LuQuote,
    LuSun,
    LuTag,
} from 'react-icons/lu';

const insertOrRecolorTag = (editor: Editor, color: TagChipColor) => {
    if (editor.isActive('tagChip')) {
        editor.chain().focus().setTagChipColor(color).run();
        return;
    }
    editor.chain().focus().insertTagChip({ color, text: 'tag' }).run();
};

export const SlashCommand = Extension.create({
    name: 'slashCommand',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                startOfLine: false,
                command: ({ editor, range, props }: { editor: Editor; range: Range; props: { command: (props: { editor: Editor; range: Range }) => void } }) => {
                    props.command({ editor, range });
                },
            },
        };
    },

    addProseMirrorPlugins() {
        const items: CommandItem[] = [
            {
                title: 'Text',
                description: 'Just start typing with plain text',
                icon: LuPilcrow,
                aliases: ['p', 'paragraph'],
                command: ({ editor, range }: { editor: Editor; range: Range }) => {
                    editor.chain().focus().deleteRange(range).clearNodes().setParagraph().run();
                },
            },
            {
                title: 'Heading 1',
                description: 'Big section heading',
                icon: LuHeading1,
                aliases: ['h1', 'big', 'large'],
                command: ({ editor, range }: { editor: Editor; range: Range }) => {
                    editor.chain().focus().deleteRange(range).clearNodes().setHeading({ level: 1 }).run();
                },
            },
            {
                title: 'Heading 2',
                description: 'Medium section heading',
                icon: LuHeading2,
                aliases: ['h2', 'medium'],
                command: ({ editor, range }: { editor: Editor; range: Range }) => {
                    editor.chain().focus().deleteRange(range).clearNodes().setHeading({ level: 2 }).run();
                },
            },
            {
                title: 'Heading 3',
                description: 'Small section heading',
                icon: LuHeading3,
                aliases: ['h3', 'small'],
                command: ({ editor, range }: { editor: Editor; range: Range }) => {
                    editor.chain().focus().deleteRange(range).clearNodes().setHeading({ level: 3 }).run();
                },
            },
            {
                title: 'Bullet List',
                description: 'Create a simple bullet list',
                icon: LuList,
                aliases: ['ul', 'bullets', 'list'],
                command: ({ editor, range }: { editor: Editor; range: Range }) => {
                    editor.chain().focus().deleteRange(range).clearNodes().toggleBulletList().run();
                },
            },
            {
                title: 'Numbered List',
                description: 'Create a numbered list',
                icon: LuListOrdered,
                aliases: ['ol', 'numbers', '1', 'list'],
                command: ({ editor, range }: { editor: Editor; range: Range }) => {
                    editor.chain().focus().deleteRange(range).clearNodes().toggleOrderedList().run();
                },
            },
            {
                title: 'Task List',
                description: 'Track tasks with a checklist',
                icon: LuListTodo,
                aliases: ['todo', 'check', 'task'],
                command: ({ editor, range }: { editor: Editor; range: Range }) => {
                    editor.chain().focus().deleteRange(range).clearNodes().toggleTaskList().run();
                },
            },
            {
                title: 'Tag',
                description: 'Insert an inline editable tag chip',
                icon: LuTag,
                aliases: ['tag', 'chip', 'label'],
                command: ({ editor, range }: { editor: Editor; range: Range }) => {
                    editor.chain().focus().deleteRange(range).run();
                    insertOrRecolorTag(editor, 'accent');
                },
            },
            {
                title: 'Tag Indigo',
                description: 'Insert or recolor tag to indigo',
                icon: LuTag,
                aliases: ['tag-indigo', 'indigo-tag', 'tagindigo'],
                command: ({ editor, range }: { editor: Editor; range: Range }) => {
                    editor.chain().focus().deleteRange(range).run();
                    insertOrRecolorTag(editor, 'accent');
                },
            },
            {
                title: 'Tag Green',
                description: 'Insert or recolor tag to green',
                icon: LuTag,
                aliases: ['tag-green', 'green-tag', 'taggreen'],
                command: ({ editor, range }: { editor: Editor; range: Range }) => {
                    editor.chain().focus().deleteRange(range).run();
                    insertOrRecolorTag(editor, 'green');
                },
            },
            {
                title: 'Tag Yellow',
                description: 'Insert or recolor tag to yellow',
                icon: LuTag,
                aliases: ['tag-yellow', 'yellow-tag', 'tagyellow'],
                command: ({ editor, range }: { editor: Editor; range: Range }) => {
                    editor.chain().focus().deleteRange(range).run();
                    insertOrRecolorTag(editor, 'yellow');
                },
            },
            {
                title: 'Tag Red',
                description: 'Insert or recolor tag to red',
                icon: LuTag,
                aliases: ['tag-red', 'red-tag', 'tagred'],
                command: ({ editor, range }: { editor: Editor; range: Range }) => {
                    editor.chain().focus().deleteRange(range).run();
                    insertOrRecolorTag(editor, 'red');
                },
            },
            {
                title: 'Quote',
                description: 'Capture a quote',
                icon: LuQuote,
                aliases: ['blockquote', 'quote'],
                command: ({ editor, range }: { editor: Editor; range: Range }) => {
                    editor.chain().focus().deleteRange(range).toggleBlockquote().run();
                },
            },
            {
                title: 'Code Block',
                description: 'Display code with syntax highlighting',
                icon: LuCode,
                aliases: ['code', 'pre', 'snippet'],
                command: ({ editor, range }: { editor: Editor; range: Range }) => {
                    editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
                },
            },
            {
                title: 'Divider',
                description: 'Visually divide blocks',
                icon: LuMinus,
                aliases: ['hr', 'line', 'divider', 'separator'],
                command: ({ editor, range }: { editor: Editor; range: Range }) => {
                    editor.chain().focus().deleteRange(range).setHorizontalRule().run();
                },
            },
            {
                title: 'Date',
                description: 'Pick a date to insert',
                icon: LuCalendarDays,
                aliases: ['date', 'calendar'],
                command: ({ editor, range }: { editor: Editor; range: Range }) => {
                    editor.chain().focus().deleteRange(range).run();
                    emitOpenDatePicker(editor);
                },
            },
            {
                title: 'Today',
                description: 'Insert today\'s date instantly',
                icon: LuSun,
                aliases: ['today', 'now'],
                command: ({ editor, range }: { editor: Editor; range: Range }) => {
                    editor.chain().focus().deleteRange(range).setDateChip({ date: new Date().toISOString() }).run();
                },
            },
        ];

        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
                ...getSuggestionConfig(items),
            }),
        ];
    },
});
