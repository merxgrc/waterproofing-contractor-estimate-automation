// NOTE: This implementation uses dangerouslyAllowBrowser for development/demo purposes only.
// For production, you should:
// 1. Move API calls to a backend server
// 2. Use server-side API routes (Next.js API routes, Express endpoints, etc.)
// 3. Never expose API keys in client-side code

// Check if we're in a development environment and have an API key
const isDevelopment = import.meta.env.MODE === 'development';
const hasApiKey = import.meta.env.VITE_OPENAI_API_KEY;

let client = null;

if (isDevelopment && hasApiKey) {
  try {
    const OpenAI = (await import("openai")).default;
    client = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true, // Only for development
    });
  } catch (error) {
    console.warn("OpenAI client initialization failed:", error);
  }
}

export async function InvokeLLM({ prompt, projectDescription, imageUrl }) {
  // Debug logging
  console.log("🔧 LLM Debug:", {
    hasClient: !!client,
    hasPrompt: !!prompt,
    hasProjectDescription: !!projectDescription,
    hasImageUrl: !!imageUrl,
    imageUrl: imageUrl
  });

  // If no client available, use mock data for demo purposes
  if (!client) {
    console.warn("OpenAI client not available. Using mock analysis data.");
    return getMockAnalysis(prompt, projectDescription);
  }

  try {
    // Handle both old prompt-based calls and new structured calls
    const messages = [];
    let isPromptBased = false;
    
    if (prompt) {
      // Legacy support for existing prompt-based calls (like chatbot)
      isPromptBased = true;
      messages.push({
        role: "system",
        content: `You are an expert waterproofing consultant. Provide clear, helpful responses about waterproofing topics.`
      });
      
      messages.push({
        role: "user",
        content: prompt
      });
    } else if (projectDescription) {
      // New structured approach for estimate analysis
      messages.push({
        role: "system",
        content: `You are an expert waterproofing project estimator. 
        Your job is to analyze project details and uploaded images to estimate 
        square footage, labor hours, complexity, and special considerations.
        
        Return your response as a JSON object with the following structure:
        {
          "estimated_area": number (square feet),
          "complexity_score": number (1-10 scale),
          "labor_hours": number,
          "special_considerations": array of strings,
          "challenges": array of strings,
          "equipment_needed": array of strings,
          "recommendations": array of strings,
          "ai_analysis_subtotal": number (total cost for labor, equipment, overhead),
          "materials": array of objects with structure {
            "name": string (specific material name),
            "quantity": number (numeric quantity needed),
            "unit": string (unit of measurement like "square feet", "gallons", "rolls"),
            "unit_price": number (current market price per unit),
            "total_price": number (quantity * unit_price)
          }
        }`
      });
      
      const userContent = [
        {
          type: "text",
          text: `
          Project Description:
          ${projectDescription}

          Analyze the project details and any uploaded image/blueprint and return a JSON response 
          with the required fields for waterproofing estimation, including:
          
          1. A detailed materials list with realistic quantities, units, and current market prices
          2. Each material must include: name, quantity, unit, unit_price, and total_price
          3. Use specific material names (e.g., "Modified Bitumen Membrane", "EPDM Primer")
          4. Provide accurate unit prices based on current market rates for waterproofing materials
          5. Calculate total_price = quantity * unit_price for each material
          6. Include ai_analysis_subtotal covering labor, equipment, overhead (excluding materials)
          `
        }
      ];

      // Add image if provided
      if (imageUrl) {
        console.log("📸 Adding image to AI analysis:", imageUrl);
        userContent.push({
          type: "image_url",
          image_url: {
            url: imageUrl,
            detail: "high"
          }
        });
      } else {
        console.log("📷 No image provided for analysis");
      }

      messages.push({
        role: "user",
        content: userContent
      });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o", // Vision-capable model
      messages: messages,
      temperature: 0.2,
      max_tokens: isPromptBased ? 500 : 800,
      ...(isPromptBased ? {} : { response_format: { type: "json_object" } })
    });

    const content = response.choices[0].message.content;
    
    // For prompt-based calls, return the text directly
    if (isPromptBased) {
      return content;
    }
    
    // For structured calls, parse JSON and normalize
    const parsed = JSON.parse(content);

    // Ensure materials have all required fields and calculate missing unit_price
    const materials = (parsed.materials || []).map(material => {
      let unit_price = material.unit_price;
      let total_price = material.total_price;
      
      // If unit_price is missing but total_price exists, calculate unit_price
      if (!unit_price && total_price && material.quantity) {
        unit_price = total_price / material.quantity;
      }
      
      // If total_price is missing, calculate it
      if (!total_price && unit_price && material.quantity) {
        total_price = unit_price * material.quantity;
      }
      
      return {
        name: material.name || "Unknown Material",
        quantity: parseFloat(material.quantity) || 1,
        unit: material.unit || "units",
        unit_price: parseFloat(unit_price) || 0,
        total_price: parseFloat(total_price) || 0
      };
    });

    return {
      estimated_area: parsed.estimated_area || parsed.area_sq_ft || 1000,
      complexity_score: parsed.complexity_score || 5,
      labor_hours: parsed.labor_hours || 50,
      special_considerations: parsed.special_considerations || ["Standard waterproofing project"],
      challenges: parsed.challenges || [],
      equipment_needed: parsed.equipment_needed || ["Basic waterproofing tools"],
      recommendations: parsed.recommendations || ["Follow standard waterproofing practices"],
      ai_analysis_subtotal: parseFloat(parsed.ai_analysis_subtotal) || 0,
      materials: materials
    };
  } catch (error) {
    console.error("Error in InvokeLLM:", error);
    return getErrorFallback(prompt);
  }
}

// Mock analysis for demo/development when API is not available
function getMockAnalysis(prompt, projectDescription) {
  if (prompt) {
    return "I'm a waterproofing expert assistant. For a full AI experience, please configure your OpenAI API key. I can help with general waterproofing questions, material selection, and best practices.";
  }

  // Extract some basic info from project description for more realistic mock data
  const area = projectDescription?.includes('roof') ? 2500 : 
               projectDescription?.includes('foundation') ? 800 :
               projectDescription?.includes('deck') ? 1200 : 1000;
  
  const complexity = projectDescription?.includes('high_elevation') ? 8 :
                    projectDescription?.includes('confined_space') ? 7 :
                    projectDescription?.includes('restricted') ? 6 : 5;

  return {
    estimated_area: area,
    complexity_score: complexity,
    labor_hours: Math.round(area * 0.04 + complexity * 5),
    special_considerations: [
      "Mock analysis - Configure OpenAI API key for AI-powered estimates",
      "Standard surface preparation required",
      "Weather conditions may affect timeline"
    ],
    challenges: [
      "Demo mode - Real AI analysis available with API key",
      "Access coordination with other trades"
    ],
    equipment_needed: [
      "Standard waterproofing tools",
      "Safety equipment",
      "Surface preparation equipment"
    ],
    recommendations: [
      "Add OpenAI API key to .env file for intelligent analysis",
      "Upload clear blueprints for accurate estimates",
      "Consider weather protection during application"
    ],
    ai_analysis_subtotal: area * 8.5 + complexity * 500, // Mock labor/equipment cost
    materials: [
      {
        name: "Modified Bitumen Membrane",
        quantity: area,
        unit: "square feet",
        unit_price: 1.5,
        total_price: area * 1.5
      },
      {
        name: "Primer",
        quantity: Math.ceil(area / 200),
        unit: "gallons",
        unit_price: 45,
        total_price: Math.ceil(area / 200) * 45
      },
      {
        name: "Polyurethane Sealant",
        quantity: Math.ceil(area / 100),
        unit: "tubes",
        unit_price: 15,
        total_price: Math.ceil(area / 100) * 15
      }
    ]
  };
}

// Error fallback function
function getErrorFallback(prompt) {
  if (prompt) {
    return "I'm experiencing technical difficulties. Please try again later or contact support if the issue persists.";
  }
  
  return {
    estimated_area: 1000,
    complexity_score: 5,
    labor_hours: 50,
    special_considerations: ["Standard waterproofing job - AI analysis unavailable"],
    challenges: ["Unable to perform detailed analysis"],
    equipment_needed: ["Basic waterproofing equipment"],
    recommendations: ["Manual review recommended due to AI analysis failure"],
    ai_analysis_subtotal: 12000, // Mock labor/equipment cost
    materials: [
      {
        name: "Basic Waterproof Membrane",
        quantity: 1000,
        unit: "square feet",
        unit_price: 1.2,
        total_price: 1200
      }
    ]
  };
}
