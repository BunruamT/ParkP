
import React, { useState } from 'react';
import { Upload, FileText, Check } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';

interface PaymentSlipUploadProps {
  onUploadComplete?: (fileUrl: string) => void;
  bookingId?: string;
}

export const PaymentSlipUpload: React.FC<PaymentSlipUploadProps> = ({ 
  onUploadComplete, 
  bookingId 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const { uploadFile, isUploading, uploadProgress } = useFileUpload();
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload an image (JPEG, PNG, GIF) or PDF file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      const fileName = `payment-slip-${bookingId || Date.now()}-${file.name}`;
      const result = await uploadFile(file, `payment-slips/${fileName}`);
      
      if (result.publicUrl) {
        setUploadedFile(result.publicUrl);
        onUploadComplete?.(result.publicUrl);
      }
    } catch (error) {
      console.error('Error uploading payment slip:', error);
      alert('Error uploading payment slip. Please try again.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  if (uploadedFile) {
    return (
      <div className="border-2 border-green-200 border-dashed rounded-lg p-6 bg-green-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Payment Slip Uploaded Successfully
          </h3>
          <p className="text-sm text-green-700 mb-4">
            Your payment slip has been uploaded and will be reviewed shortly.
          </p>
          <button
            onClick={() => {
              setUploadedFile(null);
              onUploadComplete?.('');
            }}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Upload a different file
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        <p className="font-medium mb-2">Payment Instructions:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Transfer the exact amount to our payment account</li>
          <li>Take a screenshot or photo of your payment confirmation</li>
          <li>Upload the payment slip below for verification</li>
          <li>Your booking will be confirmed once payment is verified</li>
        </ul>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        <div className="text-center">
          {isUploading ? (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Upload className="h-6 w-6 text-blue-600 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Uploading payment slip...
                </p>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {uploadProgress}% complete
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Upload Payment Slip
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Drag and drop your payment slip here, or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports: JPEG, PNG, GIF, PDF (max 5MB)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
