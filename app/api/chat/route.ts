import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const supabase = await createClient();

    // 1. Get the user's profile from the DB
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .single();

    if (!profile)
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    // 2. Initialize the Model with System Instructions
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `
        You are Scholara, an expert scholarship matching assistant. 
        Your goal is to help the user find scholarships based on their profile use the info you are provided with ask on extra questions.
        
        USER PROFILE:
        - Major: ${profile.major}
        - GPA: ${profile.gpa}
        - Institution: ${profile.enrolled_institution}
        - Interests: ${profile.academic_interests?.join(", ")}
        - Career Goals: ${profile.career_goals}
        - Location: ${profile.location_state}
        
        When a user asks to "match," look for opportunities that fit their specific 
        GPA and field of study. Be encouraging but realistic.
        CRITICAL: If you find specific scholarships, at the very end of your message, 
  include a JSON block wrapped in triple backticks with the key 'scholarship_data'.
  Example format:
  \`\`\`json
  {
    "scholarship_data": {
      "title": "Mastercard Foundation Scholars Program",
      "provider": "University of Ghana",
      "amount": 5000,
      "deadline": "2026-05-30",
      "link": "https://example.com"
    }
  }
  \`\`\`
      `,
    });

    // 3. Generate Content
    const chat = model.startChat({
      history: [], // You can pull previous messages from a 'messages' table here
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;

    return NextResponse.json({ text: response.text() });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to connect to AI" },
      { status: 500 },
    );
  }
}
