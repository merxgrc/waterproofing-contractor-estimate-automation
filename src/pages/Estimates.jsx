import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { Search, Eye, Plus, Building2 } from "lucide-react";
import { Estimate } from "@/utils/estimate";

const statusColors = {
  draft: "bg-slate-100 text-slate-700",
  pending_review: "bg-yellow-100 text-yellow-700",
  sent: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700"
};

const statusLabels = {
  draft: "Draft",
  pending_review: "Pending Review",
  sent: "Sent",
  approved: "Approved",
  rejected: "Rejected"
};

export default function Estimates() {
  const [estimates, setEstimates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEstimates();
  }, []);

  const loadEstimates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load all estimates for the authenticated user
      const data = await Estimate.list("created_at", false);
      setEstimates(data);
    } catch (error) {
      console.error("Error loading estimates:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEstimates = estimates.filter(estimate =>
    estimate.project_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estimate.building_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estimate.waterproofing_material?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">All Estimates</h1>
            <p className="text-lg text-slate-600">Manage your waterproofing project estimates</p>
          </div>
          <Link to="/app/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-semibold">
              <Plus className="w-5 h-5 mr-2" />
              New Estimate
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Search estimates by project type, building, or material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error loading estimates:</strong> {error}
          </div>
        )}

        {/* Estimates List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">
              Estimates ({filteredEstimates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-slate-600 mt-4">Loading estimates...</p>
              </div>
            ) : filteredEstimates.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {searchTerm ? 'No matching estimates' : 'No estimates yet'}
                </h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm ? 'Try adjusting your search terms' : 'Create your first waterproofing estimate to get started'}
                </p>
                {!searchTerm && (
                  <Link to="/app/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Create First Estimate
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEstimates.map((estimate) => (
                  <div key={estimate.id} className="flex items-center justify-between p-6 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg">
                          {estimate.project_type?.replace(/_/g, ' ') || 'Waterproofing Project'}
                        </h3>
                        <p className="text-slate-600">
                          {estimate.building_type || 'Building'} • {format(new Date(estimate.created_at), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm text-slate-500">
                          {estimate.waterproofing_material?.replace(/_/g, ' ') || 'Standard Material'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-slate-900 text-xl">
                          ${(estimate.total || estimate.total_estimate || 0).toLocaleString()}
                        </p>
                        <Badge className={statusColors[estimate.status] || statusColors.draft}>
                          {statusLabels[estimate.status] || statusLabels.draft}
                        </Badge>
                      </div>
                      <Link to={createPageUrl(`EstimateDetail?id=${estimate.id}`)}>
                        <Button variant="outline" size="sm" className="hover:bg-blue-50">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}