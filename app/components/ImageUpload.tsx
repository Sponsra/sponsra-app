'use client';

import React, { useState, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
    onUpload: (url: string) => void;
    aspectRatio?: string; // e.g., "1:1", "16:9", "1.91:1"
    maxFileSizeMB?: number;
    allowedFormats?: string[];
    currentImageUrl?: string;
    label?: string;
    helperText?: string;
    required?: boolean;
}

interface AspectRatioValidation {
    width: number;
    height: number;
    tolerance: number;
}

const ASPECT_RATIOS: Record<string, AspectRatioValidation> = {
    '1:1': { width: 1, height: 1, tolerance: 0.05 },
    '16:9': { width: 16, height: 9, tolerance: 0.05 },
    '9:16': { width: 9, height: 16, tolerance: 0.05 },
    '1.91:1': { width: 1.91, height: 1, tolerance: 0.05 },
    '4:3': { width: 4, height: 3, tolerance: 0.05 },
    'any': { width: 0, height: 0, tolerance: 1 },
};

const DEFAULT_ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];

export default function ImageUpload({
    onUpload,
    aspectRatio = 'any',
    maxFileSizeMB = 5,
    allowedFormats = DEFAULT_ALLOWED_FORMATS,
    currentImageUrl,
    label = 'Upload Image',
    helperText,
    required = false,
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateAspectRatio = (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            if (aspectRatio === 'any') {
                resolve(true);
                return;
            }

            const ratio = ASPECT_RATIOS[aspectRatio];
            if (!ratio) {
                resolve(true);
                return;
            }

            const img = new Image();
            img.onload = () => {
                const imageRatio = img.width / img.height;
                const expectedRatio = ratio.width / ratio.height;
                const difference = Math.abs(imageRatio - expectedRatio);
                resolve(difference <= ratio.tolerance);
            };
            img.onerror = () => resolve(false);
            img.src = URL.createObjectURL(file);
        });
    };

    const validateFile = async (file: File): Promise<string | null> => {
        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxFileSizeMB) {
            return `File size must be less than ${maxFileSizeMB}MB`;
        }

        // Check file format
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!extension || !allowedFormats.includes(extension)) {
            return `Allowed formats: ${allowedFormats.join(', ')}`;
        }

        // Check aspect ratio
        if (aspectRatio !== 'any') {
            const isValidRatio = await validateAspectRatio(file);
            if (!isValidRatio) {
                return `Image must have ${aspectRatio} aspect ratio`;
            }
        }

        return null;
    };

    const uploadFile = async (file: File) => {
        setError(null);
        setIsUploading(true);

        try {
            // Validate file
            const validationError = await validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }

            // Create preview
            setPreviewUrl(URL.createObjectURL(file));

            // Upload to Supabase Storage
            const supabase = createClient();

            // Generate unique filename
            const timestamp = Date.now();
            const extension = file.name.split('.').pop();
            const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
            const filePath = `uploads/${filename}`;

            const { error: uploadError } = await supabase.storage
                .from('sponsorship-assets')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) {
                throw new Error(uploadError.message);
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('sponsorship-assets')
                .getPublicUrl(filePath);

            onUpload(urlData.publicUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            setPreviewUrl(currentImageUrl || null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            uploadFile(files[0]);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            uploadFile(files[0]);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        onUpload('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={styles.container}>
            {label && (
                <label className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                    {aspectRatio !== 'any' && (
                        <span className={styles.constraint}>({aspectRatio})</span>
                    )}
                </label>
            )}

            {helperText && <p className={styles.helperText}>{helperText}</p>}

            <div
                className={`${styles.dropzone} ${isDragging ? styles.dropzoneDragging : ''} ${previewUrl ? styles.dropzoneWithPreview : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={previewUrl ? undefined : handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={allowedFormats.map(f => `.${f}`).join(',')}
                    onChange={handleFileChange}
                    className={styles.fileInput}
                />

                {isUploading ? (
                    <div className={styles.uploading}>
                        <div className={styles.spinner}></div>
                        <span>Uploading...</span>
                    </div>
                ) : previewUrl ? (
                    <div className={styles.preview}>
                        <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                        <div className={styles.previewOverlay}>
                            <button
                                type="button"
                                onClick={handleClick}
                                className={styles.replaceBtn}
                            >
                                Replace
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className={styles.removeBtn}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.placeholder}>
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={styles.icon}
                        >
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <span className={styles.placeholderText}>
                            Drag & drop or click to upload
                        </span>
                        <span className={styles.placeholderSubtext}>
                            {allowedFormats.join(', ').toUpperCase()} up to {maxFileSizeMB}MB
                        </span>
                    </div>
                )}
            </div>

            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
}
