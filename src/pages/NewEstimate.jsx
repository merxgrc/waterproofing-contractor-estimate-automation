
import React, { useState } from "react";
import { Estimate } from "@/api/entities";
import { UploadFile, ExtractDataFromUploadedFile, InvokeLLM } from "@/api/integrations";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Upload, Brain, FileText, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import ProjectInfoForm from "../components/estimate/ProjectInfoForm";
import FileUploadSection from "../components/estimate/FileUploadSection";
import AnalysisResults from "../components/estimate/AnalysisResults";
import EstimateBreakdown from "../components/estimate/EstimateBreakdown";

export default function NewEstimate() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [analysisResults, setAnalysisResults] = useState(null);
  const [estimateData, setEstimateData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleProjectSubmit = (data) => {
    setProjectData(data);
    setCurrentStep(2);
  };

  const handleFilesUploaded = async (files) => {
    setUploadedFiles(files);
    setCurrentStep(3);
    await analyzeProject();
  };

  const analyzeProject = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Prepare analysis prompt
      const analysisPrompt = `
        Analyze this waterproofing project for commercial estimation:
        
        Project Details:
        - Type: ${projectData.project_type}
        - Building: ${projectData.building_type}
        - Material: ${projectData.waterproofing_material}
        - Access: ${projectData.access_conditions}
        - Urgency: ${projectData.urgency_level}
        - Location: ${projectData.zip_code}
        
        ${uploadedFiles.blueprint ? 'Blueprint has been uploaded for analysis.' : ''}
        ${uploadedFiles.photos?.length ? `${uploadedFiles.photos.length} site photos have been uploaded.` : ''}
        
        Please provide a detailed analysis including:
        1. Estimated square footage of waterproofing area
        2. Complexity assessment (1-10 scale)
        3. Labor hours estimation
        4. Special considerations or challenges
        5. Equipment requirements
        6. Material quantity estimates
        
        Consider factors like:
        - Surface preparation requirements
        - Detail work complexity (corners, penetrations, joints)
        - Access challenges and staging needs
        - Weather protection requirements
        - Quality control and testing needs
      `;

      const fileUrls = [];
      if (uploadedFiles.blueprint) fileUrls.push(uploadedFiles.blueprint);
      if (uploadedFiles.photos) fileUrls.push(...uploadedFiles.photos);

      const analysis = await InvokeLLM({
        prompt: analysisPrompt,
        file_urls: fileUrls.length > 0 ? fileUrls : null,
        response_json_schema: {
          type: "object",
          properties: {
            estimated_area: { type: "number" },
            complexity_score: { type: "number" },
            labor_hours: { type: "number" },
            special_considerations: { type: "array", items: { type: "string" } },
            equipment_needed: { type: "array", items: { type: "string" } },
            material_quantities: { type: "object" },
            challenges: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAnalysisResults(analysis);
      generateEstimate(analysis);
      
    } catch (error) {
      setError("Error analyzing project. Please try again.");
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
      const estimateRecord = {
        ...projectData,
        ...uploadedFiles,
        ...estimateData,
        ...finalData,
        ai_analysis: analysisResults,
        status: 'draft'
      };

      const saved = await Estimate.create(estimateRecord);
      navigate(createPageUrl(`EstimateDetail?id=${saved.id}`));
    } catch (error) {
      setError("Error saving estimate. Please try again.");
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
          <EstimateBreakdown 
            projectData={projectData}
            estimateData={estimateData}
            analysisResults={analysisResults}
            onSave={saveEstimate}
          />
        )}
      </div>
    </div>
  );
}
