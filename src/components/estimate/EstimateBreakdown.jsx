import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign, Save, Edit3 } from "lucide-react";

export default function EstimateBreakdown({ 
  projectData, 
  estimateData, 
  analysisResults, 
  manualEntries = [], 
  totals = { manualTotal: 0, aiTotal: 0, grandTotal: 0 }, 
  onSave 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(estimateData);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({ 
      ...editedData, 
      notes,
      total_estimate: calculateTotal()
    });
    setIsSaving(false);
  };

  const calculateTotal = () => {
    return (editedData.labor_cost || 0) + 
           (editedData.material_cost || 0) + 
           (editedData.equipment_cost || 0) + 
           (editedData.mobilization_cost || 0) + 
           (editedData.contingency_amount || 0) + 
           (editedData.markup_amount || 0);
  };

  const handleFieldChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const lineItems = [
    { 
      label: 'Labor Cost', 
      field: 'labor_cost', 
      value: editedData.labor_cost,
      description: `${editedData.labor_hours?.toFixed(1)} hours @ $${projectData.labor_rate}/hr`
    },
    { 
      label: 'Material Cost', 
      field: 'material_cost', 
      value: editedData.material_cost,
      description: `${analysisResults?.estimated_area?.toLocaleString()} sq ft waterproofing material`
    },
    { 
      label: 'Equipment & Staging', 
      field: 'equipment_cost', 
      value: editedData.equipment_cost,
      description: 'Lifts, scaffolding, tools, and safety equipment'
    },
    { 
      label: 'Mobilization & Overhead', 
      field: 'mobilization_cost', 
      value: editedData.mobilization_cost,
      description: 'Transportation, setup, and project management'
    },
    { 
      label: 'Contingency Buffer', 
      field: 'contingency_amount', 
      value: editedData.contingency_amount,
      description: 'Risk mitigation and unexpected conditions'
    },
    { 
      label: 'Contractor Markup', 
      field: 'markup_amount', 
      value: editedData.markup_amount,
      description: 'Profit margin and business overhead'
    }
  ];

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Calculator className="w-5 h-5" />
            Estimate Breakdown
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            {isEditing ? 'View Mode' : 'Edit Mode'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Project Summary */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 mb-2">Project Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Project Type</p>
              <p className="font-medium">{projectData.project_type?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-slate-600">Material</p>
              <p className="font-medium">{projectData.waterproofing_material?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-slate-600">Area</p>
              <p className="font-medium">{analysisResults?.estimated_area?.toLocaleString()} sq ft</p>
            </div>
            <div>
              <p className="text-slate-600">Complexity</p>
              <Badge className="bg-slate-100 text-slate-700">
                {analysisResults?.complexity_score}/10
              </Badge>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Cost Breakdown</h3>
          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{item.label}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                </div>
                <div className="text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={item.value}
                      onChange={(e) => handleFieldChange(item.field, e.target.value)}
                      className="w-32 text-right"
                      step="0.01"
                    />
                  ) : (
                    <span className="text-lg font-bold text-slate-900">
                      ${item.value?.toLocaleString() || '0'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <span className="text-xl font-bold text-slate-900">Total Estimate</span>
            <span className="text-2xl font-bold text-blue-600">
              ${calculateTotal().toLocaleString()}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Project Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes, special conditions, or clarifications for the client..."
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg font-semibold"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? 'Saving...' : 'Save Estimate'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}