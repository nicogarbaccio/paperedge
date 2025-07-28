export interface NotebookColor {
  id: string;
  name: string;
  bg: string;
  border: string;
  text: string;
  accent: string;
  preview: string;
}

export const NOTEBOOK_COLORS: NotebookColor[] = [
  {
    id: 'blue',
    name: 'Blue',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    accent: 'bg-blue-500',
    preview: 'bg-blue-500'
  },
  {
    id: 'green',
    name: 'Green',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-300',
    accent: 'bg-green-500',
    preview: 'bg-green-500'
  },
  {
    id: 'purple',
    name: 'Purple',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-300',
    accent: 'bg-purple-500',
    preview: 'bg-purple-500'
  },
  {
    id: 'orange',
    name: 'Orange',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-700 dark:text-orange-300',
    accent: 'bg-orange-500',
    preview: 'bg-orange-500'
  },
  {
    id: 'red',
    name: 'Red',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-300',
    accent: 'bg-red-500',
    preview: 'bg-red-500'
  },
  {
    id: 'yellow',
    name: 'Yellow',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-700 dark:text-yellow-300',
    accent: 'bg-yellow-500',
    preview: 'bg-yellow-500'
  },
  {
    id: 'pink',
    name: 'Pink',
    bg: 'bg-pink-50 dark:bg-pink-950/30',
    border: 'border-pink-200 dark:border-pink-800',
    text: 'text-pink-700 dark:text-pink-300',
    accent: 'bg-pink-500',
    preview: 'bg-pink-500'
  },
  {
    id: 'indigo',
    name: 'Indigo',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-200 dark:border-indigo-800',
    text: 'text-indigo-700 dark:text-indigo-300',
    accent: 'bg-indigo-500',
    preview: 'bg-indigo-500'
  },
  {
    id: 'gray',
    name: 'Gray',
    bg: 'bg-gray-50 dark:bg-gray-950/30',
    border: 'border-gray-200 dark:border-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    accent: 'bg-gray-500',
    preview: 'bg-gray-500'
  }
];

export const DEFAULT_NOTEBOOK_COLOR = NOTEBOOK_COLORS[0]; // Blue

export function getNotebookColor(colorId: string | null): NotebookColor {
  if (!colorId) return DEFAULT_NOTEBOOK_COLOR;
  return NOTEBOOK_COLORS.find(color => color.id === colorId) || DEFAULT_NOTEBOOK_COLOR;
}

export function getNotebookColorClasses(colorId: string | null) {
  const color = getNotebookColor(colorId);
  return {
    bg: color.bg,
    border: color.border,
    text: color.text,
    accent: color.accent
  };
}