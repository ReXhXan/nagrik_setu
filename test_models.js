import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const testKey = process.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(testKey);

async function test() {
  const modelsToTest = ["gemini-1.5-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-3.5-flash", "gemini-3.6-flash"];
  
  const fs = await import('fs');
  const buffer = fs.readFileSync('src/assets/hero.png');
  const base64String = buffer.toString('base64');
  
  const imagePart = {
    inlineData: {
      data: base64String,
      mimeType: 'image/png'
    },
  };
  const prompt = `Look at this image. Categorize the civic issue into exactly one of these words: Pothole, Waterlogging, Streetlight, Garbage, StrayAnimal, SewageLeak, WaterLeak. Reply with ONLY the exact word from this list. If it does not fit any, reply with Other.`;

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([prompt, imagePart]);
      const response2 = await result.response;
      console.log(`[SUCCESS] ${modelName}:`, response2.text().trim());
      return; // Stop if we find one that works!
    } catch (error) {
      console.error(`[FAILED] ${modelName}:`, error.message);
    }
  }
}

test();
