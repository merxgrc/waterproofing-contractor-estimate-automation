// src/utils/llm.js
export async function InvokeLLM({ prompt }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`LLM API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response";
} 