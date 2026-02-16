import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { CommandMenu, CommandMenuRef, CommandItem } from '@/components/editor/CommandMenu';
import { SuggestionProps } from '@tiptap/suggestion';

export const getSuggestionConfig = (items: CommandItem[]) => ({
    items: ({ query }: { query: string }) => {
        const lowercaseQuery = query.toLowerCase();
        return items.filter((item) =>
            item.title.toLowerCase().includes(lowercaseQuery) ||
            item.aliases?.some(alias => alias.toLowerCase().includes(lowercaseQuery))
        );
    },

    render: () => {
        let component: ReactRenderer<CommandMenuRef> | null = null;
        let popup: TippyInstance[] | null = null;

        return {
            onStart: (props: SuggestionProps) => {
                component = new ReactRenderer(CommandMenu, {
                    props: {
                        items: props.items,
                        command: props.command,
                    },
                    editor: props.editor,
                });

                if (!props.clientRect) {
                    return;
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect as () => DOMRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                }) as TippyInstance[];
            },

            onUpdate(props: SuggestionProps) {
                component?.updateProps({
                    items: props.items,
                    command: props.command,
                });

                if (!props.clientRect) {
                    return;
                }

                popup?.[0]?.setProps({
                    getReferenceClientRect: props.clientRect as () => DOMRect,
                });
            },

            onKeyDown(props: { event: KeyboardEvent }) {
                if (props.event.key === 'Escape') {
                    popup?.[0]?.hide();
                    return true;
                }

                return component?.ref?.onKeyDown(props) ?? false;
            },

            onExit() {
                popup?.[0]?.destroy();
                component?.destroy();
            },
        };
    },
});
