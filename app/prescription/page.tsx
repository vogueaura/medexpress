"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileText, CheckCircle2, AlertCircle, Camera, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";

export default function PrescriptionUploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/") && selectedFile.type !== "application/pdf") {
      toast.error("Please upload an image or PDF file.");
      return;
    }
    
    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("File size should be less than 5MB.");
      return;
    }

    setFile(selectedFile);
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsSubmitting(true);
    // Simulate API upload
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-muted/20 py-12 px-4 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-3xl border border-border/50 shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Upload Successful</h2>
          <p className="text-muted-foreground mb-8">
            Our pharmacists are reviewing your prescription. We will notify you once it's approved and ready for order.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard">
              <Button className="w-full rounded-xl gradient-medical text-white border-0 h-12 shadow-lg shadow-teal-500/25">
                Go to Dashboard
              </Button>
            </Link>
            <Button variant="outline" className="w-full rounded-xl h-12" onClick={() => setIsSuccess(false)}>
              Upload Another
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8 lg:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-medical flex items-center justify-center shadow-lg shadow-teal-500/25 mx-auto mb-5">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Upload Prescription</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Upload a clear photo of your prescription. Our licensed pharmacists will review it and process your order securely.
          </p>
        </div>

        <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-6 sm:p-10">
          
          <form onSubmit={handleSubmit}>
            {/* Upload Area */}
            <div className="mb-8">
              <Label className="text-base font-semibold mb-3 block">Prescription Image</Label>
              
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div 
                      className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-colors ${
                        dragActive 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Upload className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold mb-1">
                            Drag & drop your prescription here
                          </p>
                          <p className="text-sm text-muted-foreground">
                            or click to browse from your device
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                          <span className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> JPG, PNG</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> PDF</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span>Max 5MB</span>
                        </div>
                      </div>

                      {/* Mobile quick actions */}
                      <div className="flex sm:hidden items-center justify-center gap-3 mt-6 relative z-20">
                        <Button type="button" variant="outline" className="rounded-xl w-full gap-2 pointer-events-none">
                          <Camera className="w-4 h-4" /> Camera
                        </Button>
                        <Button type="button" variant="outline" className="rounded-xl w-full gap-2 pointer-events-none">
                          <ImageIcon className="w-4 h-4" /> Gallery
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative rounded-2xl border border-border bg-muted/30 p-4 flex flex-col sm:flex-row items-center gap-6"
                  >
                    <div className="w-full sm:w-32 h-32 rounded-xl bg-card border border-border/50 flex items-center justify-center overflow-hidden shrink-0 relative">
                      {preview ? (
                        <img src={preview} alt="Prescription preview" className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-10 h-10 text-muted-foreground" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button type="button" variant="ghost" size="icon" className="text-white hover:text-white" onClick={removeFile}>
                          <X className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <p className="font-semibold text-lg truncate max-w-[200px] sm:max-w-md">{file.name}</p>
                      <p className="text-sm text-muted-foreground mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <Button type="button" variant="outline" size="sm" onClick={removeFile} className="rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10">
                        <TrashIcon className="w-4 h-4 mr-2" /> Remove File
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notes */}
            <div className="mb-8 space-y-3">
              <Label htmlFor="notes" className="text-base font-semibold">Additional Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., Any specific brand preference, or delivery instructions..." 
                className="rounded-2xl min-h-[120px] resize-none bg-background/50 focus:bg-background transition-colors" 
              />
            </div>

            {/* Important Info */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex gap-3 text-amber-800 dark:text-amber-400 mb-8 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Important guidelines:</p>
                <ul className="list-disc pl-4 space-y-1 opacity-90">
                  <li>Ensure the prescription is clear and fully visible</li>
                  <li>Doctor's details and signature must be visible</li>
                  <li>Patient's name and date should be readable</li>
                  <li>Prescription must be valid and not expired</li>
                </ul>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={!file || isSubmitting}
              className="w-full h-14 rounded-2xl gradient-medical text-white border-0 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 text-lg font-semibold"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                  Uploading...
                </span>
              ) : (
                "Submit Prescription"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
