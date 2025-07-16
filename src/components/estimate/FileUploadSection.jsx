// src/components/estimate/FileUploadSection.jsx
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Image, CheckCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '../../supabaseClient';

export default function FileUploadSection({ onFilesUploaded }) {
  const [blueprintFile, setBlueprintFile] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Add refs for file inputs
  const blueprintInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const handleBlueprintUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      setError('Please upload PDF or image files only');
      return;
    }

    setBlueprintFile(file);
    setError(null);
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== files.length) {
      setError('Please upload image files only for site photos');
      return;
    }

    setPhotoFiles(prev => [...prev, ...validFiles]);
    setError(null);
  };

  const removePhoto = (index) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadToSupabase = async (bucket, file) => {
    const filePath = `${Date.now()}_${file.name}`;
    
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error(`File ${file.name} is too large. Maximum size is 50MB.`);
    }
    
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
    }
    
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleContinue = async () => {
    if (!blueprintFile) {
      setError('Please upload a blueprint or site plan');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error("Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.");
      }

      const uploadedFiles = {};

      // Upload blueprint
      const blueprintUrl = await uploadToSupabase('blueprints', blueprintFile);
      uploadedFiles.blueprint = blueprintUrl;

      // Upload photos
      if (photoFiles.length > 0) {
        const photoUrls = [];
        for (const photo of photoFiles) {
          const url = await uploadToSupabase('photos', photo);
          photoUrls.push(url);
        }
        uploadedFiles.photos = photoUrls;
      }

      onFilesUploaded(uploadedFiles);
      
    } catch (error) {
      setError(`Error uploading files: ${error.message}`);
      console.error('Upload error:', error);
    }

    setUploading(false);
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Upload className="w-5 h-5" />
          Upload Project Files
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* --- TEST BLOCK 1: Plain Label/Input File Upload --- */}
        <div style={{ marginBottom: 24 }}>
          <input
            type="file"
            id="test-upload"
            style={{ display: "none" }}
            onChange={e => alert("File selected!")}
          />
          <label htmlFor="test-upload" style={{ cursor: "pointer", padding: 8, border: "1px solid #ccc", borderRadius: 4, display: "inline-block" }}>
            Test Plain File Upload
          </label>
        </div>
        {/* --- TEST BLOCK 2: Direct Trigger Button File Upload --- */}
        <div style={{ marginBottom: 24 }}>
          <input
            type="file"
            ref={input => window._testInput = input}
            style={{ display: "none" }}
            onChange={e => alert("File selected!")}
            id="direct-upload"
          />
          <button
            type="button"
            onClick={() => window._testInput && window._testInput.click()}
            style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: "4px" }}
          >
            Direct Trigger Upload
          </button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Blueprint Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Blueprint or Site Plan *</h3>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            {blueprintFile ? (
              <div className="flex items-center justify-center gap-4">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium text-slate-900">{blueprintFile.name}</p>
                  <p className="text-sm text-slate-600">{(blueprintFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            ) : (
              <div>
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-900 mb-2">Upload Blueprint</p>
                <p className="text-slate-600 mb-4">PDF or image files accepted</p>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleBlueprintUpload}
                  style={{ display: "none" }}
                  ref={blueprintInputRef}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => blueprintInputRef.current && blueprintInputRef.current.click()}
                >
                  Choose File
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Photo Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Site Photos (Optional)</h3>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <Image className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">Upload Site Photos</p>
            <p className="text-slate-600 mb-4">Multiple images can help improve estimate accuracy</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              style={{ display: "none" }}
              ref={photoInputRef}
            />
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => photoInputRef.current && photoInputRef.current.click()}
            >
              Choose Photos
            </Button>
          </div>

          {photoFiles.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photoFiles.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Site photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleContinue}
            disabled={!blueprintFile || uploading}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg font-semibold"
          >
            {uploading ? 'Uploading...' : 'Continue to Analysis'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}