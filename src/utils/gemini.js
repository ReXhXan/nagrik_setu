import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

function fileToGenerativePart(file, base64Data) {
  const base64String = base64Data.split(',')[1];
  return {
    inlineData: {
      data: base64String,
      mimeType: file.type
    },
  };
}

export async function categorizeIssueImage(file, base64Data) {
  try {
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      safetySettings 
    });
    
    const imagePart = fileToGenerativePart(file, base64Data);

    const prompt = `Look at this image. Categorize the civic issue into exactly one of these words: Pothole, Waterlogging, Streetlight, Garbage, StrayAnimal, SewageLeak, WaterLeak. Reply with ONLY the exact word from this list. If it does not fit any, reply with Other.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().trim();
    console.log("Raw Gemini Response:", text); // Helpful for debugging
    
    const validCategories = ["Pothole", "Waterlogging", "Streetlight", "Garbage", "StrayAnimal", "SewageLeak", "WaterLeak", "Other"];
    
    // Robust checking: if the response contains the word anywhere
    const lowerText = text.toLowerCase();
    for (const cat of validCategories) {
      if (lowerText.includes(cat.toLowerCase())) {
        return cat;
      }
    }
    
    return "Other";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Other"; 
  }
}
