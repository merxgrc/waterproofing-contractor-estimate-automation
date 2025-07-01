import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye, Building2, Droplets } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function RecentEstimates({ estimates, isLoading }) {
  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">Recent Estimates</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : estimates.length === 0 ? (
          <div className="text-center py-12">
            <Droplets className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No estimates yet</h3>
            <p className="text-slate-600 mb-6">Create your first waterproofing estimate to get started</p>
            <Link to={createPageUrl("NewEstimate")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create First Estimate
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {estimates.map((estimate) => (
              <div key={estimate.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{estimate.project_name}</h3>
                    <p className="text-sm text-slate-600">
                      {estimate.client_name} • {format(new Date(estimate.created_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      ${estimate.total_estimate?.toLocaleString() || '0'}
                    </p>
                    <Badge className={statusColors[estimate.status]}>
                      {statusLabels[estimate.status]}
                    </Badge>
                  </div>
                  <Link to={createPageUrl(`EstimateDetail?id=${estimate.id}`)}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}