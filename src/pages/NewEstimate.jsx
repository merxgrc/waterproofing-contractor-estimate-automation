// src/pages/NewEstimate.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Upload, Brain, FileText, Calculator, Plus, Trash2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvokeLLM } from "@/utils/llm";
import { Estimate } from "@/utils/estimate";

import ProjectInfoForm from "../components/estimate/ProjectInfoForm";
import FileUploadSection from "../components/estimate/FileUploadSection";
import AnalysisResults from "../components/estimate/AnalysisResults";
import EstimateBreakdown from "../components/estimate/EstimateBreakdown";

export default function NewEstimate() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [blueprintUrl, setBlueprintUrl] = useState(null); // Add specific state for blueprint URL
  const [analysisResults, setAnalysisResults] = useState(null);
  const [estimateData, setEstimateData] = useState(null);
  const [manualEntries, setManualEntries] = useState([]); // Manual cost entries
  const [materials, setMaterials] = useState([]); // AI suggested materials
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleProjectSubmit = (data) => {
    setProjectData(data);
    setCurrentStep(2);
  };

  const handleFilesUploaded = async (files) => {
    console.log("📁 Files received in NewEstimate:", files);
    console.log("📋 Blueprint URL:", files.blueprint);
    console.log("📷 Photos:", files.photos);
    
    setUploadedFiles(files);
    
    // Set blueprint URL in dedicated state
    if (files.blueprint) {
      setBlueprintUrl(files.blueprint);
      console.log("✅ Blueprint URL saved to state:", files.blueprint);
    }
    
    setCurrentStep(3);
    
    // Pass the files directly to avoid state timing issues
    await analyzeProject(files, files.blueprint);
  };

  // Manual entry functions
  const addManualEntry = () => {
    setManualEntries([...manualEntries, { description: "", qty: 1, unit: "", cost: 0 }]);
  };

  const updateManualEntry = (index, field, value) => {
    const updated = [...manualEntries];
    updated[index] = { ...updated[index], [field]: value };
    setManualEntries(updated);
  };

  const removeManualEntry = (index) => {
    setManualEntries(manualEntries.filter((_, i) => i !== index));
  };

  // Calculate totals
  const calculateTotals = () => {
    const manualTotal = manualEntries.reduce((sum, entry) => {
      const qty = parseFloat(entry.qty) || 0;
      const cost = parseFloat(entry.cost) || 0;
      return sum + (qty * cost);
    }, 0);

    const materialsTotal = materials.reduce((sum, material) => sum + (material.total_price || 0), 0);

    // Use AI analysis subtotal from AI response, fallback to total_estimate for backward compatibility
    const aiAnalysisSubtotal = analysisResults?.ai_analysis_subtotal || estimateData?.total_estimate || 0;
    
    const grandTotal = manualTotal + aiAnalysisSubtotal + materialsTotal;

    return { 
      manualTotal, 
      materialsTotal, 
      aiAnalysisSubtotal, 
      grandTotal 
    };
  };

  const analyzeProject = async (filesParam = null, blueprintUrlParam = null) => {
  setIsProcessing(true);
  setError(null);

  try {
    // Use parameters if provided, otherwise fall back to state
    const currentFiles = filesParam || uploadedFiles;
    const currentBlueprintUrl = blueprintUrlParam || blueprintUrl;

    // Prepare project description for AI analysis
    const projectDescription = `
      Waterproofing Project Analysis Request:

      Project Details:
      - Type: ${projectData.project_type}
      - Building: ${projectData.building_type}
      - Material: ${projectData.waterproofing_material}
      - Access: ${projectData.access_conditions}
      - Urgency: ${projectData.urgency_level}
      - Location: ${projectData.zip_code}

      ${currentBlueprintUrl ? 'Blueprint has been uploaded for analysis.' : ''}
      ${currentFiles.photos?.length ? `${currentFiles.photos.length} site photos have been uploaded.` : ''}
    `;

    // Get the image URL for analysis - prioritize blueprint, fallback to first photo
    const imageUrl =
      currentBlueprintUrl ||
      (currentFiles.photos && currentFiles.photos[0]) ||
      null;

    // Debug logging
    console.log("🧠 Starting AI analysis...", {
      hasImages: !!imageUrl,
      imageUrl,
      blueprintUrl: currentBlueprintUrl,
      uploadedFiles: currentFiles,
      projectType: projectData.project_type,
    });

    // 🔥 Call your backend API route instead of InvokeLLM
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectDescription,
        imageUrl,
        projectType: projectData.project_type,
        files: currentFiles,
      }),
    });

    if (!res.ok) {
      throw new Error(`AI analysis failed: ${res.statusText}`);
    }

    const analysis = await res.json();

    // Add debug info to analysis results
    const enhancedAnalysis = {
      ...analysis,
      ai_mode: "real",
      has_images: !!imageUrl,
      image_url: imageUrl,
    };

    console.log("✅ AI analysis complete:", enhancedAnalysis);

    setAnalysisResults(enhancedAnalysis);

    // Set materials from AI response
    setMaterials(enhancedAnalysis.materials || []);

    generateEstimate(enhancedAnalysis);
  } catch (error) {
    setError(`Error analyzing project: ${error.message}`);
    console.error("Analysis error:", error);
  }

  setIsProcessing(false);
};

  const generateEstimate = (analysis) => {
    // Material cost calculations
    const materialRates = {
      liquid_membrane: 3.50,
      hot_applied_rubberized_asphalt: 4.25,
      sheet_membrane: 5.00,
      bentonite: 2.75,
      crystalline: 6.50,
      epoxy_injection: 8.00,
      polyurethane: 7.25,
      modified_bitumen: 4.50
    };

    const accessMultipliers = {
      easy: 1.0,
      restricted: 1.3,
      requires_lift_scaffolding: 1.6,
      confined_space: 1.8,
      high_elevation: 2.0
    };

    const urgencyMultipliers = {
      standard: 1.0,
      rush: 1.4,
      emergency: 1.8
    };

    const area = analysis.estimated_area || 1000;
    const complexity = analysis.complexity_score || 5;
    const baseHours = analysis.labor_hours || (area * 0.05);
    
    // Calculate adjusted hours
    const accessMultiplier = accessMultipliers[projectData.access_conditions] || 1.0;
    const urgencyMultiplier = urgencyMultipliers[projectData.urgency_level] || 1.0;
    const complexityMultiplier = 1 + (complexity - 5) * 0.1;
    
    const adjustedHours = baseHours * accessMultiplier * complexityMultiplier;
    
    // Cost calculations
    const laborCost = adjustedHours * projectData.labor_rate;
    const materialRate = materialRates[projectData.waterproofing_material] || 4.0;
    const materialCost = area * materialRate;
    
    // Equipment cost based on access conditions
    const equipmentCost = area * (accessMultiplier * 0.5) + (complexity * 200);
    
    // Mobilization (typically 8-12% of labor + material)
    const mobilizationCost = (laborCost + materialCost) * 0.10;
    
    // Subtotal
    const subtotal = laborCost + materialCost + equipmentCost + mobilizationCost;
    
    // Contingency (5-10% based on complexity)
    const contingencyRate = 0.05 + (complexity * 0.005);
    const contingencyAmount = subtotal * contingencyRate;
    
    // Markup (15-20% based on urgency)
    const markupRate = 0.15 + (urgencyMultiplier - 1) * 0.05;
    const markupAmount = (subtotal + contingencyAmount) * markupRate;
    
    const totalEstimate = subtotal + contingencyAmount + markupAmount;

    const estimate = {
      analyzed_area: area,
      complexity_score: complexity,
      labor_hours: adjustedHours,
      labor_cost: laborCost,
      material_cost: materialCost,
      equipment_cost: equipmentCost,
      mobilization_cost: mobilizationCost,
      contingency_amount: contingencyAmount,
      markup_amount: markupAmount,
      total_estimate: totalEstimate
    };

    setEstimateData(estimate);
    setCurrentStep(4);
  };

  const saveEstimate = async (finalData) => {
    try {
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error("Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.");
      }

      const { grandTotal, materialsTotal, aiAnalysisSubtotal } = calculateTotals();

      const estimateRecord = {
        ...projectData,
        ...uploadedFiles,
        ...estimateData,
        ...finalData,
        ai_analysis: analysisResults,
        manual_entries: manualEntries,
        materials: materials,
        materials_subtotal: materialsTotal,
        grand_total: grandTotal,
        total: aiAnalysisSubtotal, // Keep for backward compatibility
        status: 'draft',
        created_at: new Date().toISOString()
      };

      const saved = await Estimate.create(estimateRecord);
      
      // Navigate to dashboard and refresh
      navigate("/app");
      window.location.reload(); // Force refresh to show new estimate
    } catch (error) {
      setError(`Error saving estimate: ${error.message}`);
      console.error("Save error:", error);
    }
  };

  const steps = [
    { number: 1, title: "Project Details", icon: FileText },
    { number: 2, title: "Upload Files", icon: Upload },
    { number: 3, title: "AI Analysis", icon: Brain },
    { number: 4, title: "Review Estimate", icon: Calculator }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">New Waterproofing Estimate</h1>
            <p className="text-slate-600 mt-1">Create a professional estimate with AI-powered analysis</p>
          </div>
        </div>

        {/* Progress Steps */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                    currentStep >= step.number 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    <step.icon className="w-5 h-5" />
                    <span className="font-medium">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-blue-600' : 'bg-slate-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        {currentStep === 1 && (
          <ProjectInfoForm onSubmit={handleProjectSubmit} />
        )}

        {currentStep === 2 && (
          <FileUploadSection onFilesUploaded={handleFilesUploaded} />
        )}

        {currentStep === 3 && (
          <AnalysisResults 
            analysisResults={analysisResults}
            isProcessing={isProcessing}
            onContinue={() => setCurrentStep(4)}
          />
        )}

        {currentStep === 4 && (
          <>
            {/* Manual Entries Section */}
            <Card className="bg-white shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Manual Cost Entries
                  </span>
                  <Button onClick={addManualEntry} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {manualEntries.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No manual entries yet. Click "Add Item" to add custom cost items.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {manualEntries.map((entry, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 items-center p-3 border rounded-lg">
                        <div className="col-span-4">
                          <Label htmlFor={`desc-${index}`} className="text-sm font-medium">Description</Label>
                          <Input
                            id={`desc-${index}`}
                            placeholder="Enter description"
                            value={entry.description}
                            onChange={(e) => updateManualEntry(index, 'description', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor={`qty-${index}`} className="text-sm font-medium">Quantity</Label>
                          <Input
                            id={`qty-${index}`}
                            type="number"
                            min="0"
                            step="0.1"
                            value={entry.qty}
                            onChange={(e) => updateManualEntry(index, 'qty', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor={`unit-${index}`} className="text-sm font-medium">Unit</Label>
                          <Input
                            id={`unit-${index}`}
                            placeholder="sq ft, hrs, ea"
                            value={entry.unit}
                            onChange={(e) => updateManualEntry(index, 'unit', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor={`cost-${index}`} className="text-sm font-medium">Unit Cost</Label>
                          <Input
                            id={`cost-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={entry.cost}
                            onChange={(e) => updateManualEntry(index, 'cost', e.target.value)}
                          />
                        </div>
                        <div className="col-span-1">
                          <Label className="text-sm font-medium">Total</Label>
                          <div className="text-sm font-semibold pt-2">
                            ${((parseFloat(entry.qty) || 0) * (parseFloat(entry.cost) || 0)).toFixed(2)}
                          </div>
                        </div>
                        <div className="col-span-1">
                          <Button
                            onClick={() => removeManualEntry(index)}
                            variant="outline"
                            size="sm"
                            className="mt-6"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Live Total Display */}
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-4 gap-4 text-right">
                        <div>
                          <div className="text-sm text-gray-600">Manual Entries Subtotal</div>
                          <div className="text-lg font-semibold">${calculateTotals().manualTotal.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Materials Subtotal</div>
                          <div className="text-lg font-semibold">${calculateTotals().materialsTotal.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">AI Analysis Subtotal</div>
                          <div className="text-lg font-semibold">${calculateTotals().aiAnalysisSubtotal.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Grand Total</div>
                          <div className="text-xl font-bold text-blue-600">${calculateTotals().grandTotal.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Suggested Materials */}
            {materials.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    AI Suggested Materials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-700 border-b pb-2">
                      <div className="col-span-2">Material</div>
                      <div>Quantity</div>
                      <div>Unit</div>
                      <div>Unit Price</div>
                      <div>Total</div>
                    </div>
                    {materials.map((material, index) => (
                      <div key={index} className="grid grid-cols-6 gap-4 text-sm">
                        <div className="col-span-2 font-medium">{material.name}</div>
                        <div>{material.quantity}</div>
                        <div>{material.unit}</div>
                        <div>${material.unit_price.toFixed(2)}</div>
                        <div className="font-semibold">${material.total_price.toFixed(2)}</div>
                      </div>
                    ))}
                    <div className="border-t pt-3">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Materials Subtotal</div>
                        <div className="text-lg font-semibold">
                          ${materials.reduce((sum, material) => sum + material.total_price, 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <EstimateBreakdown 
              projectData={projectData}
              estimateData={estimateData}
              analysisResults={analysisResults}
              manualEntries={manualEntries}
              materials={materials}
              totals={calculateTotals()}
              onSave={saveEstimate}
            />
          </>
        )}
      </div>
    </div>
  );
}
