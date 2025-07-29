import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, FileText, Settings, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function QuickActions() {
  const actions = [
    {
      title: "New Estimate",
      description: "Start a new waterproofing project estimate",
      icon: Calculator,
      href: createPageUrl("NewEstimate"),
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "View All Estimates",
      description: "Browse all your project estimates",
      icon: FileText,
      href: createPageUrl("Estimates"),
      color: "bg-slate-600 hover:bg-slate-700"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {actions.map((action, index) => (
            <Link key={index} to={`/app/${action.href}`}>
              <Button className={`w-full justify-start h-auto p-4 ${action.color} text-white`}>
                <action.icon className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">{action.title}</div>
                  <div className="text-sm opacity-90">{action.description}</div>
                </div>
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-8 h-8" />
            <div>
              <h3 className="font-bold text-lg">🧠 AI-Powered Estimates</h3>
              <p className="text-sm opacity-90">Upload blueprints and photos for intelligent project analysis and accurate cost calculations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}