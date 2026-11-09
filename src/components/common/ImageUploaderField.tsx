import React, { useRef, useState, useCallback } from 'react';
import {
  Upload,
  Trash2,
  FileText,
  RefreshCw,
  AlertCircle,
  Link as LinkIcon,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { uploadMediaAsset, extractApiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ResilientImage } from './ResilientImage';

interface ImageUploaderFieldProps {
  label: string;
  value: string;
  onChange: (newUrl: string) => void;
  acceptPdf?: boolean;
  helperText?: string;
  className?: string;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const ImageUploaderField: React.FC<ImageUploaderFieldProps> = ({
  label,
  value,
  onChange,
  acceptPdf = false,
  helperText,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [lastSelectedFile, setLastSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const { showToast } = useToast();

  const allowedAccept = acceptPdf
    ? '.jpg,.jpeg,.png,.webp,.gif,.pdf'
    : '.jpg,.jpeg,.png,.webp,.gif';

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File exceeds the 10 MB size limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`;
    }

    const type = file.type.toLowerCase();
    const isImage = ALLOWED_IMAGE_TYPES.includes(type);
    const isPdf = acceptPdf && type === 'application/pdf';

    // Also check extension in case MIME type is generic
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const validExts = acceptPdf
      ? ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf']
      : ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

    if (!isImage && !isPdf && !validExts.includes(ext)) {
      return `Unsupported file format. Please select a ${
        acceptPdf ? 'JPG, PNG, WEBP, GIF, or PDF' : 'JPG, PNG, WEBP, or GIF'
      } file.`;
    }

    return null;
  };

  const executeUpload = useCallback(
    async (file: File) => {
      setLastSelectedFile(file);
      setUploadError(null);
      setUploading(true);
      setUploadProgress(15);

      // Create immediate temporary preview if it's an image
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setLocalPreview(previewUrl);
      }

      // Smooth progress tick
      const progressTimer = setInterval(() => {
        setUploadProgress((p) => (p < 85 ? p + 15 : p));
      }, 120);

      try {
        const uploaded = await uploadMediaAsset(file);
        clearInterval(progressTimer);
        setUploadProgress(100);

        onChange(uploaded.url);
        setLocalPreview(null);
        showToast(`Image uploaded successfully (${uploaded.originalName})`, 'success');
      } catch (err) {
        clearInterval(progressTimer);
        const errMsg = extractApiErrorMessage(err, 'Failed to upload image. Please try again.');
        setUploadError(errMsg);
        showToast(errMsg, 'error');
      } finally {
        setUploading(false);
        setUploadProgress(0);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    },
    [onChange, showToast]
  );

  const handleNativeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      showToast(validationError, 'error');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    executeUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      showToast(validationError, 'error');
      return;
    }

    executeUpload(file);
  };

  const handleOpenNativePicker = () => {
    if (uploading) return;
    inputRef.current?.click();
  };

  const handleRetry = () => {
    if (lastSelectedFile) {
      executeUpload(lastSelectedFile);
    } else {
      handleOpenNativePicker();
    }
  };

  const handleRemove = () => {
    onChange('');
    setLocalPreview(null);
    setLastSelectedFile(null);
    setUploadError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const activeDisplaySrc = localPreview || value;
  const isPdf = activeDisplaySrc.toLowerCase().endsWith('.pdf');
  const hasImage = Boolean(activeDisplaySrc);

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Hidden Native File Input */}
      <input
        ref={inputRef}
        type="file"
        accept={allowedAccept}
        onChange={handleNativeFileSelect}
        className="hidden"
        aria-label={`Native file upload for ${label}`}
      />

      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs font-semibold text-[#E2E8F0]">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput((prev) => !prev)}
          className="inline-flex items-center gap-1 text-[11px] text-[#B5BCD9] hover:text-[#00D9FF] transition-colors cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide URL field' : 'Edit URL directly'}</span>
        </button>
      </div>

      {/* Main Upload / Preview Surface */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border transition-all overflow-hidden ${
          isDragOver
            ? 'border-[#00D9FF] bg-[#00D9FF]/10 shadow-[0_0_24px_rgba(0,217,255,0.25)]'
            : hasImage
            ? 'border-[#8B19FF]/35 bg-[#070B24]'
            : 'border-white/15 bg-[#05081D] hover:border-[#8B19FF]/60'
        }`}
      >
        {/* Upload Progress Bar */}
        {uploading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8B19FF] via-[#087BFF] to-[#00D9FF] transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {hasImage ? (
          /* State A: Image is attached / uploaded */
          <div className="p-4 flex flex-col sm:flex-row items-center gap-4">
            {/* Visual Thumbnail */}
            <div className="relative w-28 h-20 sm:w-32 sm:h-24 rounded-xl overflow-hidden border border-[#8B19FF]/40 bg-[#030514] shrink-0 flex items-center justify-center group shadow-md">
              {isPdf ? (
                <div className="flex flex-col items-center text-[#00D9FF] gap-1 p-2 text-center">
                  <FileText className="w-7 h-7 text-[#00D9FF]" />
                  <span className="text-[10px] font-mono font-semibold">PDF Document</span>
                </div>
              ) : (
                <ResilientImage
                  src={activeDisplaySrc}
                  alt={label}
                  className="w-full h-full object-cover"
                />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-[#030514]/75 backdrop-blur-xs flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-[#00D9FF] animate-spin" />
                </div>
              )}
            </div>

            {/* Image Info & Action Buttons */}
            <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <CheckCircle2 className="w-4 h-4 text-[#00E69A] shrink-0" />
                <span className="text-xs font-semibold text-white truncate">
                  {lastSelectedFile?.name || 'Image attached & ready to save'}
                </span>
              </div>
              <p className="text-[11px] text-[#B5BCD9] truncate font-mono">
                {value || 'Temporary preview active'}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                {/* Native Picker Trigger: Replace Image */}
                <button
                  type="button"
                  disabled={uploading}
                  onClick={handleOpenNativePicker}
                  className="btn-neon-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white whitespace-nowrap cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace Image</span>
                </button>

                {/* Remove Image */}
                <button
                  type="button"
                  disabled={uploading}
                  onClick={handleRemove}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* State B: Empty Image State — Premium Upload Button & Native Picker Trigger */
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#8B19FF]/15 border border-[#8B19FF]/40 flex items-center justify-center text-[#A855F7] shadow-[0_0_24px_rgba(139,25,255,0.25)]">
              {uploading ? (
                <RefreshCw className="w-7 h-7 text-[#00D9FF] animate-spin" />
              ) : (
                <Upload className="w-7 h-7 text-[#00D9FF]" />
              )}
            </div>

            <div className="space-y-1">
              {/* Premium Upload Button required by prompt */}
              <button
                type="button"
                disabled={uploading}
                onClick={handleOpenNativePicker}
                className="btn-neon-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
              >
                <Upload className="w-4 h-4 text-[#00D9FF]" />
                <span>{uploading ? 'Uploading to Server...' : 'Upload Image'}</span>
              </button>
              <p className="text-xs text-[#B5BCD9] pt-1">
                Choose an image from your device
              </p>
            </div>

            <p className="text-[11px] text-[#B5BCD9]/70 max-w-sm">
              Supports JPG, JPEG, PNG, WEBP, or GIF up to 10 MB. Drag &amp; drop file here or click to open native File Explorer.
            </p>
          </div>
        )}
      </div>

      {/* Error alert with retry button */}
      {uploadError && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 flex items-start justify-between gap-3 text-xs text-rose-300">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="text-xs font-bold text-white bg-rose-500/30 hover:bg-rose-500/50 px-2.5 py-1 rounded-lg shrink-0 cursor-pointer"
          >
            Retry Upload
          </button>
        </div>
      )}

      {/* Optional raw URL input for administrators needing direct URL control */}
      {showUrlInput && (
        <div className="pt-1 space-y-1 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <ImageIcon className="w-3.5 h-3.5 text-[#B5BCD9] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://... or /uploads/..."
                aria-label={`Direct URL for ${label}`}
                className="w-full rounded-xl bg-[#05081D] border border-white/15 pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-[#B5BCD9]/50 focus:outline-none focus:border-[#8B19FF]"
              />
            </div>
            {value && (
              <button
                type="button"
                onClick={handleRemove}
                aria-label="Clear URL"
                className="p-2 rounded-xl text-rose-400 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-[#B5BCD9]/60">
            Stored path or CDN URL saved in MongoDB.
          </p>
        </div>
      )}

      {helperText && <p className="text-[11px] text-[#B5BCD9]/75">{helperText}</p>}
    </div>
  );
};
