import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();



const googleAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const geminiModel = googleAI.getGenerativeModel({
    model: 'gemini-pro',
});

async function categorizeEmail(content: string): Promise<string> {
    try {
        
        const result = await geminiModel.generateContent(
            `Categorize the following email content:\n\n"${content}"\n\nCategory: Interested, Not Interested, More information, Neutral`
        )
        const response = result.response.text()
        console.log("Response: ", response);
        
        if (response.includes("Interested")) {
            return "Interested";
        } else if (response.includes("Not Interested")) {
            return "Not Interested";
        } else if (response.includes("More information")) {
            return "More information";
        } else {
            return "Neutral";
        }

    } catch (error) {
        console.log("Error: ", error);
        return "Neutral";
    }
}

async function generateResponseEmail(category: string, content: string): Promise<string> {
    let prompt = "";
    switch (category) {
        case "Interested":
            prompt = `Generate a positive and engaging response email for someone who is interested based on the following email content:\n\n"${content}"\n\nResponse:`;
            break;
        case "Not Interested":
            prompt = `Generate a polite and respectful response email for someone who is not interested based on the following email content:\n\n"${content}"\n\nResponse:`;
            break;
        case "More information":
            prompt = `Generate an informative response email providing more details based on the following email content:\n\n"${content}"\n\nResponse:`;
            break;
        default:
            prompt = `Generate a neutral response email based on the following email content:\n\n"${content}"\n\nResponse:`;
            break;
    }

    const response = (await geminiModel.generateContent(prompt)).response.text();

    console.log("Response: ", response);

    if (response) {
        return response;
    }

    return "No response generated";
}

export async function generateEmail(
    subject: string,
    email: string,
    sender: string,
): Promise<{ label: string, responseEmail: string }> {
    const category = await categorizeEmail(email);
    const responseEmail = await generateResponseEmail(category, email);

    return { label: category, responseEmail };
}

export async function POST(request: NextRequest) {
    const { sub, email, sender } = await request.json();

    if (!sub || !email || !sender) {
        return NextResponse.json(
            {
                status: "error",
                message: "Missing required fields",
            },
            {
                status: 400,
            }
        );
    }

    try {
        const { label, responseEmail } = await generateEmail(sub, email, sender);

        if (responseEmail) {
            return NextResponse.json(
                {
                    status: "success",
                    message: "Email generated successfully",
                    label,
                    email: responseEmail
                },
                {
                    status: 200,
                }
            );
        }

        return NextResponse.json(
            {
                status: "error",
                message: "Email not generated",
            },
            {
                status: 500,
            }
        );

    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json(
            {
                status: "error",
                message: "Email not generated",
            },
            {
                status: 500,
            }
        );
    }
}
