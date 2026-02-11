
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AutoTextarea from "@/components/common/AutoTextarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Package } from "lucide-react";

const categories = [
  "Technology", "Health & Wellness", "Fashion & Apparel", "Home & Garden",
  "Food & Beverage", "Sports & Recreation", "Education", "Finance",
  "Travel & Tourism", "Entertainment", "Automotive", "Beauty & Personal Care"
];

const goals = [
  { value: "awareness", label: "Brand Awareness" },
  { value: "leads", label: "Lead Generation" },
  { value: "sales", label: "Direct Sales" },
  { value: "trial", label: "Free Trial/Signup" }
];

export default function ProductForm({ formData, setFormData, onEnrich, isEnriching }) {
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canEnrich = formData.product_name && formData.description && formData.category;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          Product Details
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="font-medium text-slate-700">Project Name</Label>
          <Input
            id="name"
            placeholder="e.g., EcoWater Bottle Launch Q1"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product_name" className="font-medium text-slate-700">Product Name *</Label>
          <Input
            id="product_name"
            placeholder="e.g., EcoWater Pro"
            value={formData.product_name}
            onChange={(e) => handleChange("product_name", e.target.value)}
            className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="font-medium text-slate-700">Category *</Label>
          <Select onValueChange={(value) => handleChange("category", value)}>
            <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select product category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price" className="font-medium text-slate-700">Price</Label>
            <Input 
              id="price"
              type="number" 
              step="0.01" 
              value={formData.price || ""} 
              onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)} 
              placeholder="e.g., 29.00" 
              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency" className="font-medium text-slate-700">Currency</Label>
            <Select value={formData.currency || "USD"} onValueChange={(v) => handleChange("currency", v)}>
              <SelectTrigger id="currency" className="border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="INR">INR</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="font-medium text-slate-700">Product Description *</Label>
          <AutoTextarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Describe your product's key features, benefits, and target use cases..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="target_budget" className="font-medium text-slate-700">Launch Budget ($)</Label>
            <Input
              id="target_budget"
              type="number"
              placeholder="10000"
              value={formData.target_budget}
              onChange={(e) => handleChange("target_budget", e.target.value)}
              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="launch_date" className="font-medium text-slate-700">Launch Date</Label>
            <Input
              id="launch_date"
              type="date"
              value={formData.launch_date}
              onChange={(e) => handleChange("launch_date", e.target.value)}
              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="primary_goal" className="font-medium text-slate-700">Primary Goal</Label>
          <Select onValueChange={(value) => handleChange("primary_goal", value)}>
            <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select campaign objective" />
            </SelectTrigger>
            <SelectContent>
              {goals.map((goal) => (
                <SelectItem key={goal.value} value={goal.value}>
                  {goal.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={onEnrich}
          disabled={!canEnrich || isEnriching}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isEnriching ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Analyzing Product...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Analyze Product
            </>
          )}
        </Button>

        <p className="text-xs text-slate-500 text-center">
          * Required fields for AI analysis
        </p>
      </CardContent>
    </Card>
  );
}
