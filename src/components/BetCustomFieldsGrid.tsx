import type { CustomColumn } from '@/hooks/useNotebook';
import type { CustomFieldCategory } from '@/lib/utils';
import {
  categorizeCustomField,
  getCustomFieldPriority,
  getCustomFieldAccentClasses,
  capitalizeFirst,
} from '@/lib/utils';

interface ProcessedField {
  id: string;
  columnName: string;
  value: string;
  category: CustomFieldCategory;
}

/**
 * Process custom columns into categorized fields with values.
 * Returns grid fields (non-notes) and notes fields separately.
 */
export function processCustomFields(
  customColumns: CustomColumn[],
  betCustomData: Record<string, string>
): { gridFields: ProcessedField[]; notesFields: ProcessedField[] } {
  if (!customColumns || customColumns.length === 0) {
    return { gridFields: [], notesFields: [] };
  }

  const fieldsWithValues = customColumns
    .filter(
      (col, idx, arr) =>
        arr.findIndex(
          (c) => c.column_name.toLowerCase() === col.column_name.toLowerCase()
        ) === idx
    )
    .map((col) => {
      const value = betCustomData?.[col.id];
      if (!value) return null;
      return {
        id: col.id,
        columnName: col.column_name,
        value,
        category: categorizeCustomField(col.column_name) as CustomFieldCategory,
      };
    })
    .filter((field): field is NonNullable<typeof field> => field !== null)
    .filter((field) => field.category !== 'game')
    .sort(
      (a, b) => getCustomFieldPriority(a.category) - getCustomFieldPriority(b.category)
    );

  return {
    gridFields: fieldsWithValues.filter((f) => f.category !== 'notes'),
    notesFields: fieldsWithValues.filter((f) => f.category === 'notes'),
  };
}

/**
 * Renders custom field grid cells (without a grid wrapper).
 * Designed to be placed inside a parent grid alongside metrics fields.
 */
export function CustomFieldCells({ fields }: { fields: ProcessedField[] }) {
  return (
    <>
      {fields.map((field) => (
        <div key={field.id} className={getCustomFieldAccentClasses(field.category)}>
          <p className="text-text-secondary text-xs">
            {capitalizeFirst(field.columnName)}
          </p>
          <p className="font-medium text-text-primary">{field.value}</p>
        </div>
      ))}
    </>
  );
}

/**
 * Renders notes fields as italic text paragraphs.
 */
export function NotesFields({ fields }: { fields: ProcessedField[] }) {
  if (fields.length === 0) return null;
  return (
    <>
      {fields.map((field) => (
        <p
          key={field.id}
          className="text-xs text-text-secondary italic leading-relaxed"
          title={capitalizeFirst(field.columnName)}
        >
          {field.value}
        </p>
      ))}
    </>
  );
}
