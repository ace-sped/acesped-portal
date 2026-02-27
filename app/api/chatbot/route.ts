import { NextRequest, NextResponse } from 'next/server';
import { findRelevantKnowledge, generateAnswer } from '@/lib/ace-sped-knowledge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please provide a valid message',
          answer: 'Please provide a valid message. How can I help you today?'
        },
        { status: 400 }
      );
    }

    try {
      // Find relevant knowledge entries
      const relevantEntries = findRelevantKnowledge(message);

      // Generate answer
      const answer = generateAnswer(message, relevantEntries);

      return NextResponse.json({
        success: true,
        answer,
        timestamp: new Date().toISOString(),
      });
    } catch (knowledgeError: any) {
      console.error('Knowledge base error:', knowledgeError);
      // Fallback response if knowledge base fails
      return NextResponse.json({
        success: true,
        answer: `I can help you with information about ACE-SPED programs, admission, research, laboratories, and more. Could you please rephrase your question?`,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error('Chatbot API error:', error);
    // Return a helpful response even on error
    return NextResponse.json(
      {
        success: true,
        answer: `I'm here to help with information about ACE-SPED. I can assist you with:
        
- Programs and courses
- Admission process
- Research and laboratories
- Contact information
- Student services

What would you like to know?`,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}

// Allow GET for health check
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'ACE-SPED Chatbot API is running',
    version: '1.0.0',
  });
}

