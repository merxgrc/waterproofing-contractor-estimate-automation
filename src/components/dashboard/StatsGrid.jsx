import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, DollarSign, Clock, CheckCircle } from "lucide-react";

export default function StatsGrid({ totalEstimates, totalValue, pendingEstimates, approvedEstimates }) {
  const stats = [
    {
      title: "Total Estimates",
      value: totalEstimates,
      icon: Calculator,
      color: "bg-blue-500",
      textColor: "text-blue-600"
    },
    {
      title: "Total Value",
      value: `$${totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-500",
      textColor: "text-green-600"
    },
    {
      title: "Pending Review",
      value: pendingEstimates,
      icon: Clock,
      color: "bg-orange-500",
      textColor: "text-orange-600"
    },
    {
      title: "Approved",
      value: approvedEstimates,
      icon: CheckCircle,
      color: "bg-emerald-500",
      textColor: "text-emerald-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.color} bg-opacity-20`}>
              <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}