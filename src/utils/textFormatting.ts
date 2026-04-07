/**
 * Capitalizes the first letter of each word, keeping prepositions lowercase.
 * E.g. "joao da silva" → "Joao da Silva"
 */
const LOWERCASE_WORDS = new Set(['da', 'de', 'do', 'das', 'dos', 'e', 'em', 'no', 'na', 'nos', 'nas']);

export function capitalizeProperName(value: string): string {
  if (!value) return value;
  return value
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index > 0 && LOWERCASE_WORDS.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Formats a date string stored as DD/MM/YYYY (or ISO) to DD/MM/YYYY display.
 */
export function formatDateDisplay(dateString: string | undefined | null): string {
  if (!dateString) return '';
  
  // Already in DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }
  
  // ISO format (YYYY-MM-DD or full ISO)
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

/**
 * Formats a datetime string to DD/MM/YYYY HH:mm
 */
export function formatDateTimeDisplay(dateString: string | undefined | null): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
