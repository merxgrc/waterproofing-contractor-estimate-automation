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
          "recommendations": array of strings
        }`
      });
      
      const userContent = [
        {
          type: "text",
          text: `
          Project Description:
          ${projectDescription}

          Analyze the project details and any uploaded image/blueprint and return a JSON response 
          with the required fields for waterproofing estimation.
          `
        }
      ];

      // Add image if provided
      if (imageUrl) {
        userContent.push({
          type: "image_url",
          image_url: {
            url: imageUrl,
            detail: "high"
          }
        });
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

    return {
      estimated_area: parsed.estimated_area || parsed.area_sq_ft || 1000,
      complexity_score: parsed.complexity_score || 5,
      labor_hours: parsed.labor_hours || 50,
      special_considerations: parsed.special_considerations || ["Standard waterproofing project"],
      challenges: parsed.challenges || [],
      equipment_needed: parsed.equipment_needed || ["Basic waterproofing tools"],
      recommendations: parsed.recommendations || ["Follow standard waterproofing practices"]
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
    recommendations: ["Manual review recommended due to AI analysis failure"]
  };
}
