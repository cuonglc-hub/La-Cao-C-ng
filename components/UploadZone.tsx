import React, { useRef, useState } from 'react';
import { UploadedFile } from '../types';

interface UploadZoneProps {
  label: string;
  subLabel: string;
  fileData: UploadedFile | null;
  onFileSelect: (file: UploadedFile) => void;
  onClear: () => void;
  aspectRatioClass?: string; 
  accept?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  label,
  subLabel,
  fileData,
  onFileSelect,
  onClear,
  aspectRatioClass = "aspect-video",
  accept = "image/*"
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onFileSelect({
        file,
        previewUrl: result,
        base64: result // Data URL contains base64
      });
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const triggerSelect = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        {fileData && (
          <button 
            onClick={onClear}
            className="text-xs text-red-400 hover:text-red-300 underline"
          >
            Remove
          </button>
        )}
      </div>

      <div
        className={`relative group w-full ${aspectRatioClass} rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden 
          ${isDragging ? 'border-primary-500 bg-primary-500/10' : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-600'}
          ${fileData ? 'border-solid border-gray-600' : ''}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={!fileData ? triggerSelect : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />

        {fileData ? (
          <div className="relative w-full h-full">
            <img 
              src={fileData.previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); triggerSelect(); }}
                  className="opacity-0 group-hover:opacity-100 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0 transition-all"
                >
                  Change Image
                </button>
             </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 cursor-pointer">
            <div className="w-12 h-12 mb-3 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-300">{subLabel}</p>
            <p className="text-xs text-gray-500 mt-1">Click to upload or drag & drop</p>
          </div>
        )}
      </div>
    </div>
  );
};