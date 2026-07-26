import React, { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { parseError } from "@/api-services/utils/parseError";
import { bulkUploadMenuItems } from "@/api-services/menu.service";
import { useAuth } from "@/contexts/AuthContext";

interface BulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const ACCEPTED_TYPES = ".xlsx,.csv,.xls";

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  open,
  onOpenChange,
  onComplete,
}) => {
  const auth = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
  };

  const handleChangeFile = () => {
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const handleCancel = () => {
    setFile(null);
    onOpenChange(false);
  };

  const handleProceed = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await bulkUploadMenuItems(auth.token, file);
      toast.success("Bulk upload completed successfully!");
      setFile(null);
      onOpenChange(false);
      onComplete();
    } catch (err: any) {
      toast.error(parseError(err) || "Bulk upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-[420px] rounded-2xl p-0">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Bulk Upload Menu Items</h2>
            <button
              onClick={handleCancel}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!file ? (
            <div
              onClick={() => inputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50/50"
            >
              <Upload className="h-10 w-10 text-gray-400" />
              <div>
                <p className="font-medium text-gray-700">Upload your file</p>
                <p className="text-sm text-gray-500">
                  Accepted formats: .xlsx, .csv, .xls
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div className="flex-1 truncate">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mt-6 flex flex-col gap-2">
            {file && (
              <>
                <Button
                  onClick={handleProceed}
                  disabled={uploading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Proceed"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleChangeFile}
                  disabled={uploading}
                  className="w-full"
                >
                  Change File
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={uploading}
              className="w-full text-gray-500"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
