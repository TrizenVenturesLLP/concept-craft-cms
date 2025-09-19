import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  X
} from 'lucide-react';
import { problemService } from '@/services/problemService';

interface BulkUploadProps {
  onClose: () => void;
}

interface UploadResult {
  success: boolean;
  message: string;
  data?: {
    imported: number;
    failed: number;
    errors: Array<{
      row: number;
      field: string;
      message: string;
    }>;
  };
}

export function BulkUpload({ onClose }: BulkUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Bulk upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => problemService.bulkUploadProblems(file),
    onMutate: () => {
      setIsProcessing(true);
      setUploadProgress(0);
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
    },
    onSuccess: (result: UploadResult) => {
      setUploadProgress(100);
      setIsProcessing(false);
      setUploadResult(result);
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['problem-stats'] });
      
      if (result.success) {
        toast({
          title: "Upload Successful",
          description: `Successfully imported ${result.data?.imported || 0} problem statements`,
        });
      } else {
        toast({
          title: "Upload Completed with Errors",
          description: result.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: unknown) => {
      setIsProcessing(false);
      setUploadProgress(0);
      toast({
        title: "Upload Failed",
        description: (error as Error)?.message || "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  // Download template mutation
  const downloadTemplateMutation = useMutation({
    mutationFn: () => problemService.downloadTemplate(),
    onSuccess: () => {
      toast({
        title: "Template Downloaded",
        description: "CSV template has been downloaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Download Failed",
        description: "Failed to download template",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplateMutation.mutate();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bulk Upload Problem Statements</CardTitle>
              <CardDescription>
                Upload multiple problem statements using a CSV file
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Download */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Step 1: Download Template</h3>
            <p className="text-sm text-gray-600">
              Download the CSV template to ensure your file has the correct format and columns.
            </p>
            <Button 
              onClick={handleDownloadTemplate}
              disabled={downloadTemplateMutation.isPending}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Step 2: Upload CSV File</h3>
            
            {!selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">
                  Drop your CSV file here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supported format: CSV files only
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isProcessing && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Processing CSV File...</h3>
              <Progress value={uploadProgress} className="w-full" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Parsing and validating data...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Please wait while we process your file</span>
              </div>
            </div>
          )}

          {/* Upload Results */}
          {uploadResult && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Upload Results</h3>
              
              <Alert className={uploadResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-center gap-2">
                  {uploadResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <AlertDescription>
                    {uploadResult.message}
                  </AlertDescription>
                </div>
              </Alert>

              {uploadResult.data && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {uploadResult.data.imported}
                    </div>
                    <div className="text-sm text-gray-600">Successfully Imported</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {uploadResult.data.failed}
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>
              )}

              {uploadResult.data?.errors && uploadResult.data.errors.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h4 className="font-medium text-red-600">
                      Validation Errors ({uploadResult.data.errors.length})
                    </h4>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2 border border-red-200 rounded-lg p-3 bg-red-50">
                    {uploadResult.data.errors.map((error, index) => (
                      <div key={index} className="text-sm p-2 bg-white border border-red-200 rounded">
                        <div className="flex items-start gap-2">
                          <Badge variant="destructive" className="text-xs">
                            Row {error.row}
                          </Badge>
                          <span className="text-red-700">{error.message}</span>
                        </div>
                        {error.field && error.field !== 'validation' && (
                          <div className="text-xs text-red-600 mt-1">
                            Field: {error.field}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-red-600">
                    Please fix these errors in your CSV file and try uploading again.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* CSV Format Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">CSV Format Requirements</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">
                Your CSV file should include the following columns:
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">title</Badge>
                    <span className="text-gray-500">(Required)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">abstract</Badge>
                    <span className="text-gray-500">(Required)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">domain</Badge>
                    <span className="text-gray-500">(Required)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">category</Badge>
                    <span className="text-gray-500">(Required)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">difficulty</Badge>
                    <span className="text-gray-500">(Required)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">duration</Badge>
                    <span className="text-gray-500">(Required)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">technologies</Badge>
                    <span className="text-gray-500">(Optional)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">deliverables</Badge>
                    <span className="text-gray-500">(Optional)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">prerequisites</Badge>
                    <span className="text-gray-500">(Optional)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">learningOutcomes</Badge>
                    <span className="text-gray-500">(Optional)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">tags</Badge>
                    <span className="text-gray-500">(Optional)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">status</Badge>
                    <span className="text-gray-500">(Optional)</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Important Notes:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Array fields (technologies, deliverables, etc.) should be separated by semicolons (;)</li>
                  <li>• Valid domains: AI & Machine Learning, IoT & Embedded Systems, Cloud Computing, etc.</li>
                  <li>• Valid categories: Major, Minor, Capstone</li>
                  <li>• Valid difficulties: Beginner, Intermediate, Advanced</li>
                  <li>• Valid status: Draft, Active, Archived (defaults to Draft if not specified)</li>
                  <li>• Featured field accepts: true, false (defaults to false if not specified)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Close
            </Button>
            {selectedFile && !uploadResult && !isProcessing && (
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="bg-primary hover:bg-primary-dark"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            )}
            {uploadResult && !isProcessing && (
              <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Done
              </Button>
            )}
            {isProcessing && (
              <Button disabled className="bg-gray-400 cursor-not-allowed">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
