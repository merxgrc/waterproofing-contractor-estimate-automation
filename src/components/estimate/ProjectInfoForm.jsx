import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, MapPin, Clock, Wrench } from "lucide-react";

export default function ProjectInfoForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    project_name: '',
    client_name: '',
    client_email: '',
    project_type: '',
    building_type: '',
    waterproofing_material: '',
    access_conditions: '',
    zip_code: '',
    labor_rate: '',
    urgency_level: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Building2 className="w-5 h-5" />
          Project Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="project_name">Project Name *</Label>
              <Input
                id="project_name"
                value={formData.project_name}
                onChange={(e) => handleChange('project_name', e.target.value)}
                placeholder="Downtown Office Building Waterproofing"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_name">Client Name *</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => handleChange('client_name', e.target.value)}
                placeholder="ABC Construction Company"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_email">Client Email</Label>
            <Input
              id="client_email"
              type="email"
              value={formData.client_email}
              onChange={(e) => handleChange('client_email', e.target.value)}
              placeholder="contact@abcconstruction.com"
            />
          </div>

          {/* Project Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="project_type">Project Type *</Label>
              <Select value={formData.project_type} onValueChange={(value) => handleChange('project_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat_roof">Flat Roof</SelectItem>
                  <SelectItem value="foundation_wall">Foundation Wall</SelectItem>
                  <SelectItem value="parking_deck">Parking Deck</SelectItem>
                  <SelectItem value="elevator_pit">Elevator Pit</SelectItem>
                  <SelectItem value="below_grade">Below Grade</SelectItem>
                  <SelectItem value="plaza_deck">Plaza Deck</SelectItem>
                  <SelectItem value="tunnel">Tunnel</SelectItem>
                  <SelectItem value="retaining_wall">Retaining Wall</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="building_type">Building Type *</Label>
              <Select value={formData.building_type} onValueChange={(value) => handleChange('building_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select building type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">Office Building</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="retail_center">Retail Center</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="high_rise">High Rise</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="waterproofing_material">Waterproofing Material *</Label>
              <Select value={formData.waterproofing_material} onValueChange={(value) => handleChange('waterproofing_material', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liquid_membrane">Liquid Membrane</SelectItem>
                  <SelectItem value="hot_applied_rubberized_asphalt">Hot Applied Rubberized Asphalt</SelectItem>
                  <SelectItem value="sheet_membrane">Sheet Membrane</SelectItem>
                  <SelectItem value="bentonite">Bentonite</SelectItem>
                  <SelectItem value="crystalline">Crystalline</SelectItem>
                  <SelectItem value="epoxy_injection">Epoxy Injection</SelectItem>
                  <SelectItem value="polyurethane">Polyurethane</SelectItem>
                  <SelectItem value="modified_bitumen">Modified Bitumen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="access_conditions">Access Conditions *</Label>
              <Select value={formData.access_conditions} onValueChange={(value) => handleChange('access_conditions', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy Access</SelectItem>
                  <SelectItem value="restricted">Restricted Access</SelectItem>
                  <SelectItem value="requires_lift_scaffolding">Requires Lift/Scaffolding</SelectItem>
                  <SelectItem value="confined_space">Confined Space</SelectItem>
                  <SelectItem value="high_elevation">High Elevation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="zip_code">
                <MapPin className="w-4 h-4 inline mr-1" />
                Zip Code *
              </Label>
              <Input
                id="zip_code"
                value={formData.zip_code}
                onChange={(e) => handleChange('zip_code', e.target.value)}
                placeholder="12345"
                maxLength={5}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labor_rate">
                <Wrench className="w-4 h-4 inline mr-1" />
                Labor Rate ($/hour) *
              </Label>
              <Input
                id="labor_rate"
                type="number"
                value={formData.labor_rate}
                onChange={(e) => handleChange('labor_rate', parseFloat(e.target.value))}
                placeholder="65"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgency_level">
                <Clock className="w-4 h-4 inline mr-1" />
                Urgency Level *
              </Label>
              <Select value={formData.urgency_level} onValueChange={(value) => handleChange('urgency_level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="rush">Rush Job</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any special requirements, site conditions, or important details..."
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg font-semibold"
              disabled={!formData.project_name || !formData.client_name || !formData.project_type || !formData.building_type || !formData.waterproofing_material || !formData.access_conditions || !formData.zip_code || !formData.labor_rate || !formData.urgency_level}
            >
              Continue to File Upload
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}