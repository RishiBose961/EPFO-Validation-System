/* eslint-disable @typescript-eslint/no-explicit-any */
export interface EPFORecord {
  uan: string | number;
  memberName: string;
  grossWages: number;
  epfWages: number;
  epsWages: number;
  edliWages: number;
  epfContribution: number;
  epsContribution: number;
  epfEpsDifference: number;
  ncpDays: number;
  refundOfAdvances: number;
  rowNumber: number;
}

export interface ValidationError {
  rowNumber: number;
  columnName: string;
  errorMessage: string;
  errorType: string;
  value?: any;
}

export interface ValidationResult {
  record: EPFORecord;
  isValid: boolean;
  errors: ValidationError[];
}

export interface FileValidationResult {
  fileName: string;
  totalRecords: number;
  validRecords: number;
  errorRecords: number;
  results: ValidationResult[];
}

export const COLUMN_MAPPINGS: Record<string, string[]> = {
  uan: ['uan', 'UAN', 'UAN Number', 'UAN NO'],
  memberName: ['member name', 'member_name', 'name', 'employee name', 'employee_name'],
  grossWages: ['gross wages', 'gross_wages', 'gross', 'total wages'],
  epfWages: ['epf wages', 'epf_wages', 'epf wage', 'pf wages'],
  epsWages: ['eps wages', 'eps_wages', 'eps wage', 'pension wages'],
  edliWages: ['edli wages', 'edli_wages', 'edli wage'],
  epfContribution: ['epf contribution', 'epf_contribution', 'epf contribution remitted', 'pf contribution'],
  epsContribution: ['eps contribution', 'eps_contribution', 'eps contribution remitted', 'pension contribution'],
  epfEpsDifference: ['epf eps difference', 'epf_eps_difference', 'epf-eps diff', 'difference'],
  refundOfAdvances: ['refund of advances', 'refund_of_advances', 'refund', 'advance refund'],
  ncpDays: ['ncp days', 'ncp_days', 'ncp', 'non contribution days'],
};
