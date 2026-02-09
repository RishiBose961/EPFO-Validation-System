import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle, Download, Filter } from 'lucide-react';
import type { FileValidationResult, ValidationError } from '../types/epfo';
import { exportToExcel } from '../utils/excelParser';

interface ResultsDashboardProps {
  results: FileValidationResult[];
  onReset: () => void;
}

export default function ResultsDashboard({ results, onReset }: ResultsDashboardProps) {
  const [selectedErrorType, setSelectedErrorType] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<string>('all');

  const totalRecords = results.reduce((sum, r) => sum + r.totalRecords, 0);
  const validRecords = results.reduce((sum, r) => sum + r.validRecords, 0);
  const errorRecords = results.reduce((sum, r) => sum + r.errorRecords, 0);

  const allErrors = useMemo(() => {
    const errors: Array<ValidationError & { fileName: string }> = [];
    results.forEach(fileResult => {
      fileResult.results.forEach(result => {
        result.errors.forEach(error => {
          errors.push({ ...error, fileName: fileResult.fileName });
        });
      });
    });
    return errors;
  }, [results]);

  const errorTypes = useMemo(() => {
    const types = new Set<string>();
    allErrors.forEach(error => types.add(error.errorType));
    return Array.from(types);
  }, [allErrors]);

  const filteredErrors = useMemo(() => {
    return allErrors.filter(error => {
      const typeMatch = selectedErrorType === 'all' || error.errorType === selectedErrorType;
      const fileMatch = selectedFile === 'all' || error.fileName === selectedFile;
      return typeMatch && fileMatch;
    });
  }, [allErrors, selectedErrorType, selectedFile]);

  const handleExportErrors = () => {
    const exportData = filteredErrors.map(error => ({
      'File Name': error.fileName,
      'Row Number': error.rowNumber,
      'Column Name': error.columnName,
      'Error Type': error.errorType,
      'Error Message': error.errorMessage,
      'Value': error.value,
    }));

    exportToExcel(exportData, `EPFO_Validation_Errors_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Records</p>
              <p className="text-3xl font-bold text-gray-900">{totalRecords}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Filter className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Valid Records</p>
              <p className="text-3xl font-bold text-green-600">{validRecords}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Error Records</p>
              <p className="text-3xl font-bold text-red-600">{errorRecords}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Validation Errors ({filteredErrors.length})
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Files</option>
              {results.map((result, idx) => (
                <option key={idx} value={result.fileName}>
                  {result.fileName}
                </option>
              ))}
            </select>

            <select
              value={selectedErrorType}
              onChange={(e) => setSelectedErrorType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Error Types</option>
              {errorTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>

            <button
              onClick={handleExportErrors}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Errors
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Row
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Column
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Error Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredErrors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No errors found
                  </td>
                </tr>
              ) : (
                filteredErrors.map((error, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {error.fileName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {error.rowNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {error.columnName}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                        {error.errorType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {error.errorMessage}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {error.value !== undefined && error.value !== null
                        ? error.value.toString()
                        : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Validate New Files
        </button>
      </div>
    </div>
  );
}
