// src/pages/EstimateDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, MapPin, Calendar, DollarSign, Wrench, AlertTriangle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Estimate } from "@/utils/estimate";

export default function EstimateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [estimate, setEstimate] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        if (!id) {
          throw new Error("No estimate ID provided");
        }
        
        const data = await Estimate.getById(id);
        setEstimate(data);
        setMaterials(data.materials || []);
      } catch (error) {
        setError(error.message);
        console.error("Error loading estimate:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimate();
  }, [id]);

  // Material management functions
  const updateMaterialQuantity = (index, newQuantity) => {
    const updatedMaterials = [...materials];
    const quantity = parseFloat(newQuantity) || 0;
    updatedMaterials[index] = {
      ...updatedMaterials[index],
      quantity: quantity,
      total_price: quantity * updatedMaterials[index].unit_price
    };
    setMaterials(updatedMaterials);
  };

  const updateMaterialPrice = (index, newPrice) => {
    const updatedMaterials = [...materials];
    const unit_price = parseFloat(newPrice) || 0;
    updatedMaterials[index] = {
      ...updatedMaterials[index],
      unit_price: unit_price,
      total_price: updatedMaterials[index].quantity * unit_price
    };
    setMaterials(updatedMaterials);
  };

  const saveMaterialChanges = async () => {
    setIsSaving(true);
    try {
      const materialsSubtotal = materials.reduce((sum, material) => sum + (material.total_price || 0), 0);
      const aiAnalysisSubtotal = estimate.ai_analysis?.ai_analysis_subtotal || estimate.total_estimate || 0;
      const manualTotal = (estimate.manual_entries || []).reduce((sum, entry) => {
        const qty = parseFloat(entry.qty) || 0;
        const cost = parseFloat(entry.cost) || 0;
        return sum + (qty * cost);
      }, 0);
      const grandTotal = aiAnalysisSubtotal + materialsSubtotal + manualTotal;

      await Estimate.update(id, { 
        materials,
        materials_subtotal: materialsSubtotal,
        grand_total: grandTotal
      });
      
      // Update the estimate state to reflect changes
      setEstimate(prev => ({ 
        ...prev, 
        materials,
        materials_subtotal: materialsSubtotal,
        grand_total: grandTotal
      }));
      
      alert('Material prices updated successfully!');
    } catch (error) {
      console.error('Error saving materials:', error);
      alert('Error saving material changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading estimate details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error loading estimate: {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Estimate not found.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Calculate totals dynamically
  const manualEntries = estimate.manual_entries || [];
  const manualTotal = manualEntries.reduce((sum, entry) => {
    const qty = parseFloat(entry.qty) || 0;
    const cost = parseFloat(entry.cost) || 0;
    return sum + (qty * cost);
  }, 0);

  // Calculate materials total from current state (reflects live edits)
  const materialsTotal = materials.reduce((sum, material) => sum + (material.total_price || 0), 0);

  // AI Analysis Subtotal from AI response or fallback to total_estimate
  const aiAnalysisSubtotal = estimate.ai_analysis?.ai_analysis_subtotal || estimate.total_estimate || estimate.total_cost || 0;
  
  // Grand total includes all components - use saved value or calculate dynamically
  const grandTotal = estimate.grand_total || (manualTotal + aiAnalysisSubtotal + materialsTotal);

  // Debug logging to see what fields are available
  console.log("🔍 EstimateDetail Debug:", {
    estimate_total: estimate.total,
    estimate_total_estimate: estimate.total_estimate,
    estimate_total_cost: estimate.total_cost,
    calculated_aiAnalysisSubtotal: aiAnalysisSubtotal,
    calculated_manualTotal: manualTotal,
    calculated_materialsTotal: materialsTotal,
    calculated_grandTotal: grandTotal
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/app")}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Estimate Details
              </h1>
              <p className="text-gray-600">
                Created {new Date(estimate.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge variant={estimate.status === 'draft' ? 'outline' : 'default'}>
            {estimate.status || 'draft'}
          </Badge>
        </div>

        {/* Project Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Project Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Project Type</p>
              <p className="font-semibold">{estimate.project_type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Building Type</p>
              <p className="font-semibold">{estimate.building_type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Material</p>
              <p className="font-semibold">{estimate.waterproofing_material || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Access Conditions</p>
              <p className="font-semibold">{estimate.access_conditions || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Urgency Level</p>
              <p className="font-semibold">{estimate.urgency_level || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-semibold">{estimate.zip_code || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Results */}
        {estimate.ai_analysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                AI Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Estimated Area</p>
                  <p className="text-xl font-bold">{estimate.ai_analysis.estimated_area || 0} sq ft</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Complexity Score</p>
                  <p className="text-xl font-bold">{estimate.ai_analysis.complexity_score || 0}/10</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Labor Hours</p>
                  <p className="text-xl font-bold">{estimate.ai_analysis.labor_hours || 0} hrs</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">AI Subtotal</p>
                  <p className="text-xl font-bold text-blue-600">${aiAnalysisSubtotal.toFixed(2)}</p>
                </div>
              </div>
              
              {estimate.ai_analysis.special_considerations && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Special Considerations</p>
                  <ul className="list-disc list-inside space-y-1">
                    {estimate.ai_analysis.special_considerations.map((item, index) => (
                      <li key={index} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {estimate.ai_analysis.challenges && estimate.ai_analysis.challenges.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Challenges</p>
                  <ul className="list-disc list-inside space-y-1">
                    {estimate.ai_analysis.challenges.map((item, index) => (
                      <li key={index} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {estimate.ai_analysis.recommendations && estimate.ai_analysis.recommendations.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Recommendations</p>
                  <ul className="list-disc list-inside space-y-1">
                    {estimate.ai_analysis.recommendations.map((item, index) => (
                      <li key={index} className="text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Manual Entries */}
        {manualEntries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Manual Cost Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Description</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Unit</th>
                      <th className="text-right py-2">Unit Cost</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manualEntries.map((entry, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{entry.description || 'N/A'}</td>
                        <td className="text-right py-2">{entry.qty || 0}</td>
                        <td className="text-right py-2">{entry.unit || ''}</td>
                        <td className="text-right py-2">${(parseFloat(entry.cost) || 0).toFixed(2)}</td>
                        <td className="text-right py-2 font-semibold">
                          ${((parseFloat(entry.qty) || 0) * (parseFloat(entry.cost) || 0)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-b-2 border-gray-900 font-semibold">
                      <td colSpan="4" className="py-2">Manual Entries Subtotal</td>
                      <td className="text-right py-2">${manualTotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Materials */}
        {materials.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Materials List
                </div>
                <Button
                  onClick={saveMaterialChanges}
                  disabled={isSaving}
                  size="sm"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Material</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Unit</th>
                      <th className="text-right py-2">Unit Price</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 font-medium">{material.name}</td>
                        <td className="text-right py-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={material.quantity}
                            onChange={(e) => updateMaterialQuantity(index, e.target.value)}
                            className="w-20 text-right"
                          />
                        </td>
                        <td className="text-right py-2">{material.unit}</td>
                        <td className="text-right py-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={material.unit_price}
                            onChange={(e) => updateMaterialPrice(index, e.target.value)}
                            className="w-20 text-right"
                          />
                        </td>
                        <td className="text-right py-2 font-semibold">
                          ${material.total_price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-b-2 border-gray-900 font-semibold">
                      <td colSpan="4" className="py-2">Materials Subtotal</td>
                      <td className="text-right py-2">
                        ${materials.reduce((sum, material) => sum + material.total_price, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Total Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Cost Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>AI Analysis Subtotal</span>
                <span className="font-semibold">${aiAnalysisSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Materials Subtotal</span>
                <span className="font-semibold">${materialsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Manual Entries Subtotal</span>
                <span className="font-semibold">${manualTotal.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-xl font-bold">
                <span>Grand Total</span>
                <span className="text-blue-600">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files */}
        {(estimate.blueprint || estimate.photos) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Uploaded Files
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {estimate.blueprint && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Blueprint</p>
                  <img 
                    src={estimate.blueprint} 
                    alt="Blueprint" 
                    className="max-w-full h-auto rounded-lg border"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              )}
              {estimate.photos && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Site Photos</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(Array.isArray(estimate.photos) ? estimate.photos : [estimate.photos]).map((photo, index) => (
                      <img 
                        key={index}
                        src={photo} 
                        alt={`Site photo ${index + 1}`} 
                        className="w-full h-auto rounded-lg border"
                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
