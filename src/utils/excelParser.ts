/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from 'xlsx';
import { type EPFORecord, COLUMN_MAPPINGS } from '../types/epfo';

export function parseExcelFile(file: File): Promise<EPFORecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

        const records = mapDataToRecords(jsonData);
        resolve(records);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
}

function mapDataToRecords(data: any[]): EPFORecord[] {
  if (data.length === 0) return [];

  const firstRow = data[0];
  const columnMap = createColumnMap(firstRow);

  return data.map((row, index) => ({
    uan: getValueFromRow(row, columnMap.uan) || '',
    memberName: getValueFromRow(row, columnMap.memberName) || '',
    grossWages: parseNumber(getValueFromRow(row, columnMap.grossWages)),
    epfWages: parseNumber(getValueFromRow(row, columnMap.epfWages)),
    epsWages: parseNumber(getValueFromRow(row, columnMap.epsWages)),
    edliWages: parseNumber(getValueFromRow(row, columnMap.edliWages)),
    epfContribution: parseNumber(getValueFromRow(row, columnMap.epfContribution)),
    epsContribution: parseNumber(getValueFromRow(row, columnMap.epsContribution)),
    epfEpsDifference: parseNumber(getValueFromRow(row, columnMap.epfEpsDifference)),
    ncpDays: parseNumber(getValueFromRow(row, columnMap.ncpDays)),
    refundOfAdvances: parseNumber(getValueFromRow(row, columnMap.refundOfAdvances)),
    rowNumber: index + 2,
  }));
}

function createColumnMap(firstRow: any): Record<string, string | null> {
  const columnMap: Record<string, string | null> = {};
  const rowKeys = Object.keys(firstRow).map(k => k.toLowerCase().trim());

  for (const [field, possibleNames] of Object.entries(COLUMN_MAPPINGS)) {
    let foundColumn: string | null = null;

    for (const possibleName of possibleNames) {
      const index = rowKeys.indexOf(possibleName.toLowerCase());
      if (index !== -1) {
        foundColumn = Object.keys(firstRow)[index];
        break;
      }
    }

    columnMap[field] = foundColumn;
  }

  return columnMap;
}

function getValueFromRow(row: any, columnName: string | null): any {
  if (!columnName) return null;
  return row[columnName];
}

function parseNumber(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : Number(value);
  return isNaN(num) ? 0 : num;
}

export function exportToExcel(data: any[], fileName: string): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Validation Errors');
  XLSX.writeFile(workbook, fileName);
}
