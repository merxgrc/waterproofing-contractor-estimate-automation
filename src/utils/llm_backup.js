// Fixed version of llm.js with proper async initialization

// NOTE: This implementation uses dangerouslyAllowBrowser for development/demo purposes only.
// For production, you should:
// 1. Move API calls to a backend server
// 2. Use server-side API routes (Next.js API routes, Express endpoints, etc.)
// 3. Never expose API keys in client-side code

// Initialize OpenAI client inside the function to avoid race conditions
async function getOpenAIClient() {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    console.warn("⚠️ No OpenAI API key found in environment variables");
    return null;
  }

  try {
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true, // Only for development
    });
    console.log("✅ OpenAI client initialized successfully");
    return client;
  } catch (error) {
    console.warn("❌ OpenAI client initialization failed:", error);
    return null;
  }
}

export async function InvokeLLM({ prompt, projectDescription, imageUrl }) {
  // Enhanced debug logging
  console.log("🔧 LLM Debug:", {
    hasPrompt: !!prompt,
    hasProjectDescription: !!projectDescription,
    hasImageUrl: !!imageUrl,
    imageUrl: imageUrl,
    apiKeyExists: !!import.meta.env.VITE_OPENAI_API_KEY,
    apiKeyLength: import.meta.env.VITE_OPENAI_API_KEY?.length || 0,
    mode: import.meta.env.MODE
  });

  // Try to get OpenAI client
  const client = await getOpenAIClient();

  // If no client available, use mock data for demo purposes
  if (!client) {
    console.warn("⚠️ OpenAI client not available. Using mock analysis data.");
    return getMockAnalysis(prompt, projectDescription);
  }

  console.log("🚀 Making OpenAI API call...");

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
        }
        
        Provide accurate analysis based on the project details and any uploaded images.
        Focus on:
        1. Realistic square footage estimation
        2. Material quantity calculations based on actual coverage rates
        3. Labor hour estimates based on complexity and access conditions
        4. Provide accurate unit prices based on current market rates for waterproofing materials
        5. Calculate total_price = quantity * unit_price for each material
        6. Include ai_analysis_subtotal covering labor, equipment, overhead (excluding materials)
        `
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
    // Provide helpful waterproofing responses based on keywords in the prompt
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('elevator pit')) {
      return `For elevator pit waterproofing, I recommend:

**Primary System:**
- Hot-applied rubberized asphalt membrane or crystalline admixture concrete
- Bentonite waterproofing for hydrostatic pressure situations

**Key Considerations:**
- Hydrostatic pressure is critical in elevator pits
- Use positive-side waterproofing when possible
- Ensure proper drainage and sump pump systems
- Apply primer to clean, dry concrete surfaces
- Pay special attention to wall-to-floor joints

**Materials to Consider:**
- Crystalline waterproofing (penetrates concrete)
- Modified bitumen sheet membrane
- Liquid-applied membrane with reinforcement

Note: This is general guidance. For AI-powered analysis with your specific project details, configure your OpenAI API key.`;
    }
    
    if (lowerPrompt.includes('membrane') || lowerPrompt.includes('sheet') || lowerPrompt.includes('liquid')) {
      return `**Sheet vs Liquid Membrane Comparison:**

**Sheet Membrane Pros:**
- Consistent thickness
- Good for large, simple areas
- Excellent puncture resistance
- Long-term durability

**Sheet Membrane Cons:**
- Seam vulnerabilities
- Difficult around penetrations
- Requires skilled installation

**Liquid Membrane Pros:**
- Seamless application
- Great for complex geometries
- Easy detail work
- Self-healing properties

**Liquid Membrane Cons:**
- Weather-dependent application
- Thickness variations possible
- Longer cure times

For AI-powered project-specific recommendations, add your OpenAI API key to get detailed analysis.`;
    }
    
    if (lowerPrompt.includes('surface prep') || lowerPrompt.includes('preparation')) {
      return `**Surface Preparation Guidelines:**

**Concrete Surfaces:**
1. Clean all dirt, oil, loose material
2. Repair cracks and voids
3. Achieve proper surface profile (CSP 1-3)
4. Ensure moisture content <4%
5. Apply primer if required

**Critical Steps:**
- Shot blasting or grinding for contaminated surfaces
- Fill honeycombing and bug holes
- Round off sharp edges
- Test for surface moisture
- Check for previous coatings

**Quality Control:**
- Pull-off adhesion tests
- Moisture meter readings
- Visual inspection checklist

Configure OpenAI API key for detailed, project-specific surface prep specifications.`;
    }
    
    // Generic helpful response for other questions
    return `I'm a waterproofing expert assistant. While I can provide general guidance, for detailed AI-powered analysis specific to your project, please configure your OpenAI API key.

**Common Waterproofing Topics I Can Help With:**
- Material selection (membranes, coatings, sealants)
- Surface preparation requirements
- Application techniques and best practices
- Problem diagnosis and troubleshooting
- Safety protocols and standards

**Popular Questions:**
- "What materials for elevator pit waterproofing?"
- "Sheet membrane vs liquid membrane comparison"
- "Surface preparation for hot-applied systems"
- "Leak diagnosis techniques"

Ask me about any waterproofing topic!`;
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
