import React, { useState, useEffect } from "react";
import { Estimate } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Calculator, FileText, DollarSign, Clock, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

import StatsGrid from "../components/dashboard/StatsGrid";
import RecentEstimates from "../components/dashboard/RecentEstimates";
import QuickActions from "../components/dashboard/QuickActions";

export default function Dashboard() {
  const [estimates, setEstimates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEstimates();
  }, []);

  const loadEstimates = async () => {
    setIsLoading(true);
    try {
      const data = await Estimate.list("-created_date", 10);
      setEstimates(data);
    } catch (error) {
      console.error("Error loading estimates:", error);
    }
    setIsLoading(false);
  };

  const totalValue = estimates.reduce((sum, est) => sum + (est.total_estimate || 0), 0);
  const pendingEstimates = estimates.filter(est => est.status === 'pending_review' || est.status === 'sent').length;
  const approvedEstimates = estimates.filter(est => est.status === 'approved').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-lg text-slate-600">Ready to create your next waterproofing estimate?</p>
          </div>
          <Link to={createPageUrl("NewEstimate")}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-5 h-5 mr-2" />
              New Estimate
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <StatsGrid 
          totalEstimates={estimates.length}
          totalValue={totalValue}
          pendingEstimates={pendingEstimates}
          approvedEstimates={approvedEstimates}
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentEstimates estimates={estimates} isLoading={isLoading} />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}