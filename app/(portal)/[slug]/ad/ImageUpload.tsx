"use client";

import { useState } from "react";
import { FileUpload, FileUploadSelectEvent } from "primereact/fileupload";
import { ProgressBar } from "primereact/progressbar";
import { Message } from "primereact/message";
import { createClient } from "@/utils/supabase/client";

interface ImageUploadProps {
  onUploadComplete: (path: string) => void;
  bookingId: string;
}

export default function ImageUpload({
  onUploadComplete,
  bookingId,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const onSelect = async (e: FileUploadSelectEvent) => {
    setError(null);
    setSuccess(false);

    const file = e.files[0];
    if (!file) return;

    // 1. Validation (Example: Max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("File is too large. Max size is 2MB.");
      return;
    }

    setUploading(true);

    try {
      // 2. Upload to Supabase
      // Path format: booking_id/timestamp_filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${bookingId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("ad-creatives")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 3. Success
      // We construct the full public URL or just pass the path
      // Let's pass the relative path, we can build the URL later
      setSuccess(true);
      onUploadComplete(filePath);
    } catch (err: any) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-column gap-2">
      <label className="font-bold text-slate-700">Ad Image (Optional)</label>

      <FileUpload
        mode="basic"
        name="adImage"
        accept="image/*"
        maxFileSize={2000000}
        onSelect={onSelect}
        auto={true} // Upload immediately upon selection
        chooseLabel={uploading ? "Uploading..." : "Choose Image"}
        disabled={uploading}
        className="w-full"
      />

      {uploading && (
        <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
      )}

      {error && <Message severity="error" text={error} />}

      {success && (
        <Message severity="success" text="Image uploaded successfully!" />
      )}

      <small className="text-slate-500">
        Supported formats: JPG, PNG, GIF. Max size: 2MB.
      </small>
    </div>
  );
}
