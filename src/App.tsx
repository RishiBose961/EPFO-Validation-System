import { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ResultsDashboard from './components/ResultsDashboard';
import type { FileValidationResult } from './types/epfo';
import { parseExcelFile } from './utils/excelParser';
import { validateAllRecords } from './utils/epfoValidator';
import InstallButton from './InstallButton';

function App() {
  const [validationResults, setValidationResults] = useState<FileValidationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) {
      setShowResults(false);
      setValidationResults([]);
      return;
    }

    setIsProcessing(true);

    try {
      const results: FileValidationResult[] = [];

      for (const file of files) {
        const records = await parseExcelFile(file);
        const validationResults = validateAllRecords(records);

        const validRecords = validationResults.filter(r => r.isValid).length;
        const errorRecords = validationResults.filter(r => !r.isValid).length;

        results.push({
          fileName: file.name,
          totalRecords: records.length,
          validRecords,
          errorRecords,
          results: validationResults,
        });
      }

      setValidationResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing files. Please check the file format and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setValidationResults([]);
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <FileSpreadsheet className="h-8 w-8 animate-pulse text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                EPFO Validation System
              </h1>
            </div>
            <InstallButton/>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!showResults ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Upload EPFO Excel Files
              </h2>
              <p className="text-gray-600 mb-6">
                Upload one or more Excel files containing EPFO data to validate
                compliance with EPFO rules and regulations.
              </p>
              <FileUpload onFilesSelected={handleFilesSelected} />
            </div>

            {isProcessing && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-700 font-medium">
                    Processing and validating files...
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Validation Rules
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg mt-1">
                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">EPS Wage Limit</p>
                    <p className="text-sm text-gray-600">
                      EPS wages must not exceed ₹15,000
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg mt-1">
                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">EDLI Wage Limit</p>
                    <p className="text-sm text-gray-600">
                      EDLI wages must not exceed ₹15,000
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg mt-1">
                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">EPF vs Gross Wages</p>
                    <p className="text-sm text-gray-600">
                      EPF wages must not exceed Gross wages
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg mt-1">
                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Refund of Advances</p>
                    <p className="text-sm text-gray-600">
                      Must be 0 (zero)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg mt-1">
                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Negative Values</p>
                    <p className="text-sm text-gray-600">
                      No negative values allowed in any field
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg mt-1">
                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Contribution Match</p>
                    <p className="text-sm text-gray-600">
                      EPF-EPS difference must match calculations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ResultsDashboard results={validationResults} onReset={handleReset} />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} EPFO Validation System - Developed by {'Rishi Bose'}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
