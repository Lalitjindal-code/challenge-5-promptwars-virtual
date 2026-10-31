/**
 * Planora AI — High-Security CSV Serialization & Export Utility
 *
 * Provides RFC 4180-compliant CSV cell formatting with strict spreadsheet
 * formula injection (CSV Injection / DDE) protection.
 */

/**
 * Regular expression to detect valid finite numeric strings, including negative numbers and decimals.
 * Examples: "100", "-500", "-12.50", "+42" (without formula operators or expressions)
 */
const PURE_NUMERIC_PATTERN = /^[+-]?\d+(\.\d+)?$/;

/**
 * Formula trigger characters that can execute arbitrary code in Excel/Calc/Sheets.
 * Includes `=`, `+`, `-`, `@`, `\t`, `\r`, `%`, `|`.
 */
const FORMULA_TRIGGER_PATTERN = /^[=+\-@\t\r%|]/;

/**
 * Sanitizes an individual cell value for inclusion in a CSV document.
 *
 * Rules:
 * 1. null / undefined -> empty quoted cell `""`
 * 2. Numbers (including legitimate negative numbers) -> quoted numeric string `"-500"`
 * 3. Booleans -> `"true"` or `"false"`
 * 4. Strings:
 *    - Quotes are escaped by doubling them (`"` -> `""`)
 *    - Strips leading control characters to inspect the true first printable character
 *    - If the cell begins with formula triggers (=, +, -, @, \t, \r, %, |) and is NOT
 *      a pure numeric value, prepends a single quote `'` to neutralize execution in spreadsheets.
 *    - Always wraps in double quotes to handle commas, newlines, and Unicode safely.
 */
export function sanitizeCsvCell(val: unknown): string {
  if (val === null || val === undefined) {
    return '""';
  }

  if (typeof val === "number") {
    if (!Number.isFinite(val)) return '""';
    return `"${val}"`;
  }

  if (typeof val === "boolean") {
    return `"${val}"`;
  }

  const rawStr = String(val);

  // Escape all inner double quotes according to RFC 4180
  let escapedStr = rawStr.replace(/"/g, '""');

  // Strip leading whitespace and control characters to detect stealthy formula triggers
  // e.g. "   =cmd|' /C calc'!A0" or "\t+1234"
  const trimmedLeading = escapedStr.replace(/^[\s\u0000-\u001F\u007F-\u009F]+/, "");

  // Check if string is a legitimate negative or positive number
  const isPureNumber = PURE_NUMERIC_PATTERN.test(rawStr.trim());

  // If the first effective character is a formula trigger and it is not a pure number, neutralize it
  if (FORMULA_TRIGGER_PATTERN.test(trimmedLeading) && !isPureNumber) {
    escapedStr = `'${escapedStr}`;
  }

  return `"${escapedStr}"`;
}

/**
 * Formats a single row of cells into a comma-delimited string.
 */
export function formatCsvRow(row: readonly unknown[]): string {
  return row.map((cell) => sanitizeCsvCell(cell)).join(",");
}

/**
 * Generates full RFC 4180-compliant CSV content from headers and data rows.
 */
export function generateCsvContent(
  headers: readonly string[],
  rows: readonly (readonly unknown[])[]
): string {
  const headerRow = headers.map((h) => sanitizeCsvCell(h)).join(",");
  const dataRows = rows.map((r) => formatCsvRow(r));
  return [headerRow, ...dataRows].join("\r\n");
}

/**
 * Triggers a browser download of the CSV dataset with UTF-8 BOM encoding.
 * Safely no-ops in headless or server-side environments where DOM is unavailable.
 */
export function downloadCsv(
  filename: string,
  headers: readonly string[],
  rows: readonly (readonly unknown[])[]
): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const csvContent = generateCsvContent(headers, rows);

  // Prepend UTF-8 Byte Order Mark (\uFEFF) so Excel, Google Sheets, and LibreOffice
  // correctly render international Unicode characters, emojis, and symbols.
  const blob = new Blob(["\uFEFF", csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const sanitizedFilename = filename.toLowerCase().endsWith(".csv") ? filename : `${filename}.csv`;
  link.setAttribute("href", url);
  link.setAttribute("download", sanitizedFilename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up object URL to prevent memory leaks
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

