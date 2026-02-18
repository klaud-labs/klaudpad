import type { Editor } from '@tiptap/core';

const OPEN_DATE_PICKER_EVENT = 'openDatePicker';

type OpenDatePickerHandler = () => void;

type DatePickerEventBridge = {
  emit: (event: typeof OPEN_DATE_PICKER_EVENT) => void;
  on: (event: typeof OPEN_DATE_PICKER_EVENT, handler: OpenDatePickerHandler) => void;
  off: (event: typeof OPEN_DATE_PICKER_EVENT, handler: OpenDatePickerHandler) => void;
};

const asDatePickerEventBridge = (editor: Editor): DatePickerEventBridge => {
  return editor as unknown as DatePickerEventBridge;
};

export const emitOpenDatePicker = (editor: Editor) => {
  asDatePickerEventBridge(editor).emit(OPEN_DATE_PICKER_EVENT);
};

export const onOpenDatePicker = (editor: Editor, handler: OpenDatePickerHandler) => {
  asDatePickerEventBridge(editor).on(OPEN_DATE_PICKER_EVENT, handler);
};

export const offOpenDatePicker = (editor: Editor, handler: OpenDatePickerHandler) => {
  asDatePickerEventBridge(editor).off(OPEN_DATE_PICKER_EVENT, handler);
};
