import type { EPFORecord, ValidationError, ValidationResult } from '../types/epfo';

const EPS_WAGE_LIMIT = 15000;
const EDLI_WAGE_LIMIT = 15000;

export function validateEPFORecord(record: EPFORecord): ValidationResult {
  const errors: ValidationError[] = [];

  if (record.epsWages > EPS_WAGE_LIMIT) {
    errors.push({
      rowNumber: record.rowNumber,
      columnName: 'EPS Wages',
      errorMessage: `EPS Wages (₹${record.epsWages}) exceeds the limit of ₹${EPS_WAGE_LIMIT}`,
      errorType: 'EPS_WAGE_LIMIT_EXCEEDED',
      value: record.epsWages,
    });
  }

  if (record.edliWages > EDLI_WAGE_LIMIT) {
    errors.push({
      rowNumber: record.rowNumber,
      columnName: 'EDLI Wages',
      errorMessage: `EDLI Wages (₹${record.edliWages}) exceeds the limit of ₹${EDLI_WAGE_LIMIT}`,
      errorType: 'EDLI_WAGE_LIMIT_EXCEEDED',
      value: record.edliWages,
    });
  }

  if (record.epfWages > record.grossWages) {
    errors.push({
      rowNumber: record.rowNumber,
      columnName: 'EPF Wages',
      errorMessage: `EPF Wages (₹${record.epfWages}) cannot exceed Gross Wages (₹${record.grossWages})`,
      errorType: 'EPF_EXCEEDS_GROSS',
      value: record.epfWages,
    });
  }

  if (record.refundOfAdvances !== 0) {
    errors.push({
      rowNumber: record.rowNumber,
      columnName: 'Refund of Advances',
      errorMessage: `Refund of Advances must be 0, found ₹${record.refundOfAdvances}`,
      errorType: 'REFUND_NOT_ZERO',
      value: record.refundOfAdvances,
    });
  }

  if (record.grossWages < 0) {
    errors.push({
      rowNumber: record.rowNumber,
      columnName: 'Gross Wages',
      errorMessage: `Gross Wages cannot be negative (₹${record.grossWages})`,
      errorType: 'NEGATIVE_VALUE',
      value: record.grossWages,
    });
  }

  if (record.epfWages < 0) {
    errors.push({
      rowNumber: record.rowNumber,
      columnName: 'EPF Wages',
      errorMessage: `EPF Wages cannot be negative (₹${record.epfWages})`,
      errorType: 'NEGATIVE_VALUE',
      value: record.epfWages,
    });
  }

  if (record.epsWages < 0) {
    errors.push({
      rowNumber: record.rowNumber,
      columnName: 'EPS Wages',
      errorMessage: `EPS Wages cannot be negative (₹${record.epsWages})`,
      errorType: 'NEGATIVE_VALUE',
      value: record.epsWages,
    });
  }

  if (record.edliWages < 0) {
    errors.push({
      rowNumber: record.rowNumber,
      columnName: 'EDLI Wages',
      errorMessage: `EDLI Wages cannot be negative (₹${record.edliWages})`,
      errorType: 'NEGATIVE_VALUE',
      value: record.edliWages,
    });
  }

  if (record.epfContribution < 0) {
    errors.push({
      rowNumber: record.rowNumber,
      columnName: 'EPF Contribution',
      errorMessage: `EPF Contribution cannot be negative (₹${record.epfContribution})`,
      errorType: 'NEGATIVE_VALUE',
      value: record.epfContribution,
    });
  }

  if (record.epsContribution < 0) {
    errors.push({
      rowNumber: record.rowNumber,
      columnName: 'EPS Contribution',
      errorMessage: `EPS Contribution cannot be negative (₹${record.epsContribution})`,
      errorType: 'NEGATIVE_VALUE',
      value: record.epsContribution,
    });
  }

  if (record.ncpDays < 0) {
    errors.push({
      rowNumber: record.rowNumber,
      columnName: 'NCP Days',
      errorMessage: `NCP Days cannot be negative (${record.ncpDays})`,
      errorType: 'NEGATIVE_VALUE',
      value: record.ncpDays,
    });
  }

  if (record.ncpDays > 31) {
    errors.push({
      rowNumber: record.rowNumber,
      columnName: 'NCP Days',
      errorMessage: `NCP Days (${record.ncpDays}) cannot exceed 31 days in a month`,
      errorType: 'NCP_DAYS_INVALID',
      value: record.ncpDays,
    });
  }

  const expectedEpfEpsDiff = record.epfContribution - record.epsContribution;
  const tolerance = 0.01;
  if (Math.abs(record.epfEpsDifference - expectedEpfEpsDiff) > tolerance) {
    errors.push({
      rowNumber: record.rowNumber,
      columnName: 'EPF-EPS Difference',
      errorMessage: `EPF-EPS Difference (₹${record.epfEpsDifference}) does not match calculated value (₹${expectedEpfEpsDiff.toFixed(2)})`,
      errorType: 'CONTRIBUTION_MISMATCH',
      value: record.epfEpsDifference,
    });
  }

  if (!record.uan || record.uan.toString().trim() === '') {
    errors.push({
      rowNumber: record.rowNumber,
      columnName: 'UAN',
      errorMessage: 'UAN is required and cannot be empty',
      errorType: 'MISSING_REQUIRED_FIELD',
      value: record.uan,
    });
  }

  // if (!record.memberName || record.memberName.toString().trim() === '') {
  //   errors.push({
  //     rowNumber: record.rowNumber,
  //     columnName: 'Member Name',
  //     errorMessage: 'Member Name is required and cannot be empty',
  //     errorType: 'MISSING_REQUIRED_FIELD',
  //     value: record.memberName,
  //   });
  // }

  return {
    record,
    isValid: errors.length === 0,
    errors,
  };
}

export function validateAllRecords(records: EPFORecord[]): ValidationResult[] {
  return records.map(record => validateEPFORecord(record));
}
