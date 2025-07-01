import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Square, Clock, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

export default function AnalysisResults({ analysisResults, isProcessing, onContinue }) {
  if (isProcessing) {
    return (
      <Card className="bg-white shadow-lg">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <Brain className="w-16 h-16 text-blue-600" />
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin absolute -top-1 -right-1" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">AI Analysis in Progress</h3>
              <p className="text-slate-600">
                Our AI is analyzing your blueprints and project details to generate accurate estimates...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysisResults) {
    return null;
  }

  const complexityColor = analysisResults.complexity_score >= 7 ? 'bg-red-100 text-red-700' : 
                         analysisResults.complexity_score >= 5 ? 'bg-yellow-100 text-yellow-700' : 
                         'bg-green-100 text-green-700';

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Brain className="w-5 h-5 text-blue-600" />
          AI Analysis Complete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Square className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-slate-600 mb-1">Estimated Area</p>
            <p className="text-2xl font-bold text-slate-900">
              {analysisResults.estimated_area?.toLocaleString() || 'N/A'} sq ft
            </p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-slate-600 mb-1">Labor Hours</p>
            <p className="text-2xl font-bold text-slate-900">
              {analysisResults.labor_hours?.toFixed(1) || 'N/A'} hrs
            </p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-600 mb-1">Complexity</p>
            <Badge className={`text-lg font-bold ${complexityColor}`}>
              {analysisResults.complexity_score}/10
            </Badge>
          </div>
        </div>

        {/* Special Considerations */}
        {analysisResults.special_considerations && analysisResults.special_considerations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Special Considerations</h3>
            <div className="space-y-2">
              {analysisResults.special_considerations.map((consideration, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-700">{consideration}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipment Needed */}
        {analysisResults.equipment_needed && analysisResults.equipment_needed.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Equipment Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {analysisResults.equipment_needed.map((equipment, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <p className="text-slate-700">{equipment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Challenges */}
        {analysisResults.challenges && analysisResults.challenges.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Identified Challenges</h3>
            <div className="space-y-2">
              {analysisResults.challenges.map((challenge, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-700">{challenge}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {analysisResults.recommendations && analysisResults.recommendations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">AI Recommendations</h3>
            <div className="space-y-2">
              {analysisResults.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button 
            onClick={onContinue}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg font-semibold"
          >
            Generate Final Estimate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}