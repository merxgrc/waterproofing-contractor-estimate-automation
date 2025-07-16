# Waterproofing Contractor Estimate Automation - Setup Guide

## 🚀 Quick Start

This application provides an AI-powered estimate creation system for waterproofing contractors. Users can create professional estimates in 4 steps:

1. **Project Details** - Fill out project information form
2. **File Upload** - Upload blueprints and site photos
3. **AI Analysis** - AI analyzes the project and generates estimates
4. **Review & Save** - Review the estimate and save to database

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Supabase account and project

## 🔧 Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration  
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Getting API Keys

1. **OpenAI API Key**: 
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key to your `.env` file

2. **Supabase Setup**:
   - Visit [Supabase](https://supabase.com)
   - Create a new project
   - Go to Settings > API
   - Copy the Project URL and anon/public key
   - Add them to your `.env` file

## 🗄️ Database Setup

Create the following table in your Supabase database:

```sql
CREATE TABLE estimates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  project_type TEXT NOT NULL,
  building_type TEXT NOT NULL,
  waterproofing_material TEXT NOT NULL,
  access_conditions TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  labor_rate DECIMAL(10,2) NOT NULL,
  urgency_level TEXT NOT NULL,
  notes TEXT,
  blueprint TEXT,
  photos TEXT[],
  analyzed_area DECIMAL(10,2),
  complexity_score INTEGER,
  labor_hours DECIMAL(10,2),
  labor_cost DECIMAL(10,2),
  material_cost DECIMAL(10,2),
  equipment_cost DECIMAL(10,2),
  mobilization_cost DECIMAL(10,2),
  contingency_amount DECIMAL(10,2),
  markup_amount DECIMAL(10,2),
  total_estimate DECIMAL(10,2),
  ai_analysis JSONB,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Storage Buckets

Create two storage buckets in Supabase:

1. **blueprints** - For storing blueprint files
2. **photos** - For storing site photos

Set the bucket policies to allow authenticated uploads:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow public access to uploaded files
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (true);
```

## 🏃‍♂️ Running the Application

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`

## 🔧 What Was Fixed

### ✅ Issues Resolved

1. **Missing `InvokeLLM` function**:
   - Created `src/utils/llm.js` with OpenAI API integration
   - Added proper error handling and JSON response parsing
   - Integrated with the existing `fetchOpenAIChat` pattern

2. **Missing `Estimate.create` function**:
   - Created `src/utils/estimate.js` with Supabase integration
   - Added CRUD operations for estimates
   - Proper error handling and data validation

3. **File Upload Button Issues**:
   - Fixed label-input connections with proper `htmlFor` attributes
   - Added `cursor-pointer` classes for better UX
   - Enhanced error handling for file uploads

4. **Enhanced Error Handling**:
   - Added environment variable validation
   - Better error messages with specific details
   - Loading states and user feedback

### 🎯 Features Implemented

- **4-Step Estimate Creation Flow**:
  1. Project information form with validation
  2. File upload with drag-and-drop support
  3. AI analysis using OpenAI GPT-3.5-turbo
  4. Estimate breakdown with editable costs

- **AI-Powered Analysis**:
  - Analyzes project complexity and requirements
  - Estimates labor hours and material quantities
  - Identifies special considerations and challenges
  - Provides equipment recommendations

- **Professional Estimate Generation**:
  - Calculates labor, material, equipment, and overhead costs
  - Applies complexity and urgency multipliers
  - Includes contingency and markup calculations
  - Generates detailed cost breakdown

- **File Management**:
  - Secure file upload to Supabase storage
  - Support for PDF blueprints and image photos
  - File validation and error handling

## 🧪 Testing the Application

1. **Navigate to New Estimate** page
2. **Fill out project form** with sample data:
   - Project Name: "Test Office Building"
   - Client: "Test Construction Co"
   - Project Type: "Flat Roof"
   - Building Type: "Office Building"
   - Material: "Liquid Membrane"
   - Access: "Easy Access"
   - Zip Code: "12345"
   - Labor Rate: "65"
   - Urgency: "Standard"

3. **Upload test files**:
   - Upload a PDF blueprint or image
   - Optionally upload site photos

4. **Review AI analysis** and generated estimate

5. **Save the estimate** to the database

## 🐛 Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**:
   - Check your `.env` file has `VITE_OPENAI_API_KEY`
   - Verify the API key is valid and has credits

2. **"Supabase not configured"**:
   - Check your `.env` file has both Supabase variables
   - Verify the URL and key are correct

3. **File upload fails**:
   - Check Supabase storage buckets are created
   - Verify storage policies allow uploads
   - Check file size limits (default 50MB)

4. **Database errors**:
   - Verify the `estimates` table exists
   - Check table schema matches the application
   - Ensure proper permissions are set

### Debug Mode

Enable debug logging by adding to your `.env`:

```env
VITE_DEBUG=true
```

This will show detailed console logs for API calls and database operations.

## 📚 API Reference

### LLM Integration

The `InvokeLLM` function in `src/utils/llm.js` handles:
- OpenAI API communication
- JSON response parsing
- Error handling and retries
- Temperature control for consistent estimates

### Database Operations

The `Estimate` object in `src/utils/estimate.js` provides:
- `create(data)` - Save new estimate
- `getById(id)` - Retrieve estimate by ID
- `list()` - Get all estimates
- `update(id, updates)` - Update existing estimate

## 🚀 Production Deployment

For production deployment:

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set up environment variables** on your hosting platform

3. **Configure Supabase** with production settings

4. **Set up proper CORS** and security policies

## 📞 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify all environment variables are set
3. Test API keys independently
4. Check Supabase dashboard for database/storage issues

The application includes comprehensive error handling and will display specific error messages to help diagnose issues. 