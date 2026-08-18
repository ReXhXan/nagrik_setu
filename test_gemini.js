import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

async function test() {
  try {
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.6-flash",
      safetySettings 
    });
    
    const response = await fetch('https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Pothole_in_the_road.jpg/640px-Pothole_in_the_road.jpg');
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');
    
    const imagePart = {
      inlineData: {
        data: base64String,
        mimeType: 'image/jpeg'
      },
    };

    const prompt = `Hello, what model are you?`;

    const result = await model.generateContent([prompt]);
    const response2 = await result.response;
    const text = response2.text().trim();
    console.log("Raw Gemini Response:", text); 
    
    const lowerText = text.toLowerCase();
    for (const cat of validCategories) {
      if (lowerText.includes(cat.toLowerCase())) {
        console.log("Final Category Assigned:", cat);
        return;
      }
    }
    
    console.log("Final Category Assigned: Other");
  } catch (error) {
    console.error("Gemini API Error:", error);
  }
}

test();
