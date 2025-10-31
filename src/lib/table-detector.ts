import { PDFText, PDFPage } from './fast-pdf-extractor';

export interface TableColumn {
  index: number;
  xStart: number;
  xEnd: number;
  header?: string;
}

export interface TableRow {
  y: number;
  cells: string[];
}

export interface DetectedTable {
  columns: TableColumn[];
  rows: TableRow[];
  startY: number;
  endY: number;
}

/**
 * Detect tables in PDF using coordinate-based analysis
 * Works by clustering text elements into columns and rows
 */
export function detectTables(page: PDFPage, options?: {
  minColumns?: number;
  minRows?: number;
  columnTolerance?: number;
  rowTolerance?: number;
}): DetectedTable[] {
  const {
    minColumns = 3,
    minRows = 2,
    columnTolerance = 0.5,
    rowTolerance = 0.3,
  } = options || {};

  const texts = page.texts;
  if (texts.length === 0) return [];

  // Sort texts by Y position (top to bottom), then X position (left to right)
  const sortedTexts = [...texts].sort((a, b) => {
    const yDiff = a.y - b.y;
    if (Math.abs(yDiff) < rowTolerance) {
      return a.x - b.x;
    }
    return yDiff;
  });

  // Detect columns by clustering X positions
  const columns = detectColumns(sortedTexts, columnTolerance);

  if (columns.length < minColumns) {
    return []; // Not enough columns for a table
  }

  // Group texts into rows
  const rows = groupIntoRows(sortedTexts, columns, rowTolerance);

  if (rows.length < minRows) {
    return []; // Not enough rows for a table
  }

  return [{
    columns,
    rows,
    startY: rows[0]?.y || 0,
    endY: rows[rows.length - 1]?.y || 0,
  }];
}

/**
 * Detect columns by clustering X coordinates
 */
function detectColumns(texts: PDFText[], tolerance: number): TableColumn[] {
  // Collect all X positions
  const xPositions = texts.map(t => t.x);

  // Cluster X positions
  const clusters: number[][] = [];

  for (const x of xPositions) {
    let addedToCluster = false;

    for (const cluster of clusters) {
      const avgX = cluster.reduce((sum, val) => sum + val, 0) / cluster.length;
      if (Math.abs(x - avgX) < tolerance) {
        cluster.push(x);
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clusters.push([x]);
    }
  }

  // Sort clusters by average X position
  const sortedClusters = clusters
    .map(cluster => ({
      avgX: cluster.reduce((sum, val) => sum + val, 0) / cluster.length,
      count: cluster.length,
    }))
    .sort((a, b) => a.avgX - b.avgX);

  // Create columns
  const columns: TableColumn[] = sortedClusters.map((cluster, index) => {
    const xStart = cluster.avgX - tolerance;
    const xEnd = index < sortedClusters.length - 1
      ? (cluster.avgX + sortedClusters[index + 1].avgX) / 2
      : cluster.avgX + 10; // Last column extends to the right

    return {
      index,
      xStart,
      xEnd,
    };
  });

  return columns;
}

/**
 * Group texts into rows based on Y coordinate
 */
function groupIntoRows(
  texts: PDFText[],
  columns: TableColumn[],
  rowTolerance: number
): TableRow[] {
  const rowMap = new Map<number, PDFText[]>();

  // Group texts by Y position
  for (const text of texts) {
    let foundRow = false;

    const entries = Array.from(rowMap.entries());
    for (const [y, rowTexts] of entries) {
      if (Math.abs(text.y - y) < rowTolerance) {
        rowTexts.push(text);
        foundRow = true;
        break;
      }
    }

    if (!foundRow) {
      rowMap.set(text.y, [text]);
    }
  }

  // Convert to rows with cells
  const rows: TableRow[] = [];

  const sortedEntries = Array.from(rowMap.entries()).sort((a, b) => a[0] - b[0]);

  for (const [y, rowTexts] of sortedEntries) {
    const cells: string[] = new Array(columns.length).fill('');

    // Assign texts to columns
    for (const text of rowTexts) {
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        if (text.x >= column.xStart && text.x < column.xEnd) {
          cells[i] = (cells[i] + ' ' + text.text).trim();
          break;
        }
      }
    }

    rows.push({ y, cells });
  }

  return rows;
}

/**
 * Detect transaction table specifically for bank statements
 * Looks for common header patterns like "Date", "Description", "Amount"
 */
export function detectTransactionTable(page: PDFPage): DetectedTable | null {
  const tables = detectTables(page, {
    minColumns: 3, // At least Date, Description, Amount
    minRows: 2,
    columnTolerance: 0.8,
    rowTolerance: 0.4,
  });

  if (tables.length === 0) return null;

  // Look for table with transaction-like headers
  for (const table of tables) {
    const firstRow = table.rows[0];
    if (!firstRow) continue;

    const headerText = firstRow.cells.join(' ').toLowerCase();

    // Check for common transaction table headers
    const hasDateColumn = /date|dated/.test(headerText);
    const hasDescColumn = /description|details|transaction|narrative/.test(headerText);
    const hasAmountColumn = /amount|debit|credit|money|balance|value/.test(headerText);

    if (hasDateColumn && hasDescColumn && hasAmountColumn) {
      // Label columns based on content
      table.columns.forEach((column, index) => {
        const cellText = firstRow.cells[index]?.toLowerCase() || '';

        if (/date/.test(cellText)) {
          column.header = 'date';
        } else if (/description|details|transaction|narrative/.test(cellText)) {
          column.header = 'description';
        } else if (/money out|debit|paid out/.test(cellText)) {
          column.header = 'debit';
        } else if (/money in|credit|paid in/.test(cellText)) {
          column.header = 'credit';
        } else if (/balance/.test(cellText)) {
          column.header = 'balance';
        } else if (/amount/.test(cellText)) {
          column.header = 'amount';
        }
      });

      return table;
    }
  }

  // If no clear headers, return the largest table
  return tables.reduce((largest, current) =>
    current.rows.length > largest.rows.length ? current : largest
  );
}

/**
 * Extract data from table as array of objects
 */
export function tableToRecords(table: DetectedTable): Record<string, string>[] {
  const records: Record<string, string>[] = [];

  // Skip header row (first row)
  for (let i = 1; i < table.rows.length; i++) {
    const row = table.rows[i];
    const record: Record<string, string> = {};

    row.cells.forEach((cell, cellIndex) => {
      const column = table.columns[cellIndex];
      const key = column?.header || `col${cellIndex}`;
      record[key] = cell.trim();
    });

    // Only add non-empty rows
    if (Object.values(record).some(val => val.length > 0)) {
      records.push(record);
    }
  }

  return records;
}
