'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface AvatarUploadProps {
  /** Current avatar URL */
  currentAvatarUrl?: string | null;
  /** User's name for fallback display */
  userName?: string | null;
  /** Callback when avatar is successfully uploaded */
  onUploadSuccess?: (newAvatarUrl: string) => void;
  /** Callback when avatar is deleted */
  onDeleteSuccess?: () => void;
  /** Callback for errors */
  onError?: (error: string) => void;
  /** Custom class name */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether upload is disabled */
  disabled?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const sizeClasses = {
  sm: 'w-20 h-20',
  md: 'w-32 h-32',
  lg: 'w-40 h-40',
};

const iconSizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const textSizeClasses = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-5xl',
};

export function AvatarUpload({
  currentAvatarUrl,
  userName,
  onUploadSuccess,
  onDeleteSuccess,
  onError,
  className,
  size = 'md',
  disabled = false,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return `Invalid file type. Allowed: ${ALLOWED_TYPES.map((t) => t.split('/')[1]).join(', ')}`;
      }
      if (file.size > MAX_FILE_SIZE) {
        return `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`;
      }
      return null;
    },
    []
  );

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        onError?.(validationError);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append('file', file);

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 100);

        const response = await fetch('/api/users/me/avatar', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }

        const { data } = await response.json();
        setPreviewUrl(null);
        onUploadSuccess?.(data.avatarUrl);
      } catch (error) {
        setPreviewUrl(null);
        onError?.(error instanceof Error ? error.message : 'Failed to upload avatar');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [validateFile, onUploadSuccess, onError]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        uploadFile(file);
      }
      // Reset input value to allow re-selecting same file
      event.target.value = '';
    },
    [uploadFile]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const file = event.dataTransfer.files?.[0];
      if (file) {
        uploadFile(file);
      }
    },
    [disabled, isUploading, uploadFile]
  );

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  const handleDelete = useCallback(async () => {
    if (!currentAvatarUrl || isDeleting) return;

    setIsDeleting(true);

    try {
      const response = await fetch('/api/users/me/avatar', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      onDeleteSuccess?.();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to delete avatar');
    } finally {
      setIsDeleting(false);
    }
  }, [currentAvatarUrl, isDeleting, onDeleteSuccess, onError]);

  const cancelPreview = useCallback(() => {
    setPreviewUrl(null);
  }, []);

  const displayUrl = previewUrl || currentAvatarUrl;
  const userInitial = userName?.charAt(0).toUpperCase() || 'U';
  const isLoading = isUploading || isDeleting;

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Avatar Display */}
      <div
        className={cn(
          'relative rounded-full cursor-pointer transition-all duration-200',
          sizeClasses[size],
          isDragging && 'ring-4 ring-astralis-blue ring-offset-2',
          isLoading && 'opacity-75',
          !disabled && 'hover:opacity-90'
        )}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label="Upload avatar"
      >
        {/* Avatar Image or Placeholder */}
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={userName || 'User avatar'}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-astralis-blue flex items-center justify-center text-white">
            <span className={cn('font-bold', textSizeClasses[size])}>{userInitial}</span>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {/* Upload Progress Ring */}
        {isUploading && uploadProgress > 0 && (
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-white/30"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${uploadProgress * 2.89} 289`}
              className="text-white transition-all duration-200"
            />
          </svg>
        )}

        {/* Drag Overlay */}
        {isDragging && !isLoading && (
          <div className="absolute inset-0 rounded-full bg-astralis-blue/80 flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>
        )}

        {/* Camera Icon Button */}
        {!isLoading && !isDragging && (
          <button
            type="button"
            className={cn(
              'absolute bottom-0 right-0 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors',
              iconSizeClasses[size]
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            disabled={disabled}
            aria-label="Change avatar"
          >
            <Camera className="w-1/2 h-1/2 text-slate-600" />
          </button>
        )}

        {/* Preview Cancel Button */}
        {previewUrl && !isUploading && (
          <button
            type="button"
            className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              cancelPreview();
            }}
            aria-label="Cancel preview"
          >
            <X className=" ui-icon w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isLoading}
        aria-hidden="true"
      />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={disabled || isLoading}
          className="gap-1.5"
        >
          <Upload className=" ui-icon w-5 h-5" />
          {currentAvatarUrl ? 'Change Photo' : 'Upload Photo'}
        </Button>

        {currentAvatarUrl && !previewUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={disabled || isLoading}
            className="gap-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className=" ui-icon w-5 h-5" />
            Remove
          </Button>
        )}
      </div>

      {/* Help Text */}
      <p className="text-xs text-slate-500 text-center">
        JPG, PNG, GIF, or WebP. Max 5MB.
        <br />
        Click or drag to upload.
      </p>
    </div>
  );
}
