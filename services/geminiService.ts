
import { GoogleGenAI, GenerateContentResponse } from "@google/genai"; // Ensure correct import if used
import { Task } from "../types";

// IMPORTANT: API Key Handling
// The API key MUST be obtained from `process.env.API_KEY`.
// This service assumes `process.env.API_KEY` is available in the environment.
// DO NOT add UI elements or prompts for API key input.

// const API_KEY = process.env.API_KEY; 
// if (!API_KEY) {
//   console.warn("Gemini API Key not found. AI features will be disabled.");
// }
// const ai = new GoogleGenAI({ apiKey: API_KEY! }); // Initialize if key exists


export const geminiService = {
  /**
   * Provides AI-powered guidance or tutorial steps for a given task.
   * This is a MOCKED implementation.
   */
  getTaskGuidance: async (task: Task): Promise<string> => {
    // const apiKey = process.env.API_KEY; // Get API key from environment
    // if (!apiKey) {
    //   return "AI assistance is currently unavailable (API key not configured).";
    // }
    // const ai = new GoogleGenAI({ apiKey: apiKey });

    const prompt = task.aiAssistancePrompt || `Provide a brief explanation or a few helpful tips for completing the following task: "${task.title} - ${task.description}". Keep it concise and actionable for an intern.`;
    
    console.log("Mocking Gemini API call for task guidance with prompt:", prompt);
    // try {
    //   const response: GenerateContentResponse = await ai.models.generateContent({
    //     model: 'gemini-2.5-flash-preview-04-17', // Use appropriate model
    //     contents: prompt,
    //     config: {
    //       // Optional: Add thinkingConfig if needed for this use case (likely not for simple guidance)
    //       // thinkingConfig: { thinkingBudget: 0 } // if low latency is critical
    //     }
    //   });
    //   return response.text;
    // } catch (error) {
    //   console.error("Gemini API error (getTaskGuidance):", error);
    //   return "Sorry, I couldn't fetch AI guidance at this moment. Please try again later.";
    // }

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`
          <p class="font-semibold">AI Guidance for: ${task.title}</p>
          <ul class="list-disc list-inside mt-2 space-y-1">
            <li><strong>Understand the Goal:</strong> Ensure you clearly understand what needs to be achieved with this task. Re-read the description carefully.</li>
            <li><strong>Break it Down:</strong> If the task seems large, try to break it into smaller, manageable sub-steps.</li>
            <li><strong>Seek Resources:</strong> Look for relevant documentation, examples, or tools that might help. (e.g., search for '${task.title} tutorial').</li>
            <li><strong>Mocked Tip:</strong> For "${task.description.substring(0,30)}...", consider starting with a basic outline.</li>
            <li><strong>Ask Questions:</strong> If you're stuck for more than 15-20 minutes, don't hesitate to ask your mentor or a senior team member for clarification.</li>
          </ul>
          <p class="mt-2 text-xs text-gray-500">This is AI-generated guidance (mocked). Always verify critical information.</p>
        `);
      }, 1000);
    });
  },

  /**
   * Generates a task template based on a high-level description.
   * This is a MOCKED implementation.
   */
  generateTaskTemplate: async (description: string): Promise<{ title: string; description: string; estimatedDuration: string }> => {
    // const apiKey = process.env.API_KEY;
    // if (!apiKey) {
    //   return { title: "Error", description: "AI template generation unavailable.", estimatedDuration: "N/A" };
    // }
    // const ai = new GoogleGenAI({ apiKey: apiKey });

    const prompt = `Based on the following high-level task requirement, generate a concise task title, a detailed task description, and an estimated duration for an intern: "${description}". Format the output as a JSON object with keys: "title", "description", "estimatedDuration".`;

    console.log("Mocking Gemini API call for task template generation with prompt:", prompt);
    // try {
    //   const response: GenerateContentResponse = await ai.models.generateContent({
    //     model: 'gemini-2.5-flash-preview-04-17',
    //     contents: prompt,
    //     config: { responseMimeType: "application/json" }
    //   });
    //   let jsonStr = response.text.trim();
    //   const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    //   const match = jsonStr.match(fenceRegex);
    //   if (match && match[2]) {
    //     jsonStr = match[2].trim();
    //   }
    //   const parsedData = JSON.parse(jsonStr);
    //   return parsedData;
    // } catch (error) {
    //   console.error("Gemini API error (generateTaskTemplate):", error);
    //   return { title: "Error", description: "Failed to generate template.", estimatedDuration: "N/A" };
    // }

    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          title: `AI Generated: ${description.substring(0, 20)}...`,
          description: `This task involves ${description}. Key steps include: 1. Researching the topic. 2. Drafting the content. 3. Reviewing and finalizing. (This is AI-generated placeholder text).`,
          estimatedDuration: "Approx. 4 hours"
        });
      }, 1000);
    });
  },
};