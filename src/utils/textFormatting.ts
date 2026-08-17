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

/**
 * Parses a date string in DD/MM/YYYY format into a Date object.
 * Returns null if the string is invalid or does not represent a real calendar date.
 */
function parseDateDDMMYYYY(dateString: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateString);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/**
 * Calculates the duration and a string in DD/MM/YYYY format and returns
 * it in a natural, human-readable format:
 *   - "1 ano", "2 anos", "1 mês", "8 meses", "14 dias"
 *   - "2 anos e 4 meses", "1 ano e 3 meses"
 *   - "5 meses e 20 dias", "2 anos, 4 meses e 15 dias"
 * Days are only included when greater than zero; "0 dias" is never shown.
 * When `currentlyWorking` is true, the duration is computed from startDate up
 * to the current date. Returns an empty string if any date is invalid, empty
 * or cannot be interpreted, or if the start date is after the end date.
 */
export function calculateDuration(
  startDate: string | undefined | null,
  endDate: string | undefined | null,
  currentlyWorking: boolean
): string {
  if (!startDate) return '';

  const start = parseDateDDMMYYYY(startDate);
  if (!start) return '';

  let end: Date | null = null;
  if (currentlyWorking) {
    end = new Date();
  } else {
    if (!endDate) return '';
    end = parseDateDDMMYYYY(endDate);
    if (!end) return '';
  }

  if (start > end) return '';

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months--;
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
  if (days > 0) parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);

  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];

  return `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1]}`;
}
