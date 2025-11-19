import { NextRequest, NextResponse } from 'next/server';

interface DetectedIngredient {
  name: string;
  confidence: number;
  category: string;
  emoji: string;
}

interface DetectionResponse {
  ingredients: DetectedIngredient[];
  count: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Get YOLO server URL from environment
    const yoloServerUrl = process.env.YOLO_SERVER_URL || 'http://localhost:8000';

    // Convert file to FormData for Python server
    const pythonFormData = new FormData();
    pythonFormData.append('file', file);

    // Call Python YOLO server
    const response = await fetch(`${yoloServerUrl}/detect`, {
      method: 'POST',
      body: pythonFormData,
      // Don't set Content-Type header, let fetch set it with boundary
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('YOLO server error:', errorText);
      
      // Fallback to mock detection if server is unavailable
      if (response.status >= 500) {
        return NextResponse.json({
          ingredients: [
            { name: 'tomato', confidence: 0.95, category: 'Vegetables', emoji: '🍅' },
            { name: 'onion', confidence: 0.87, category: 'Vegetables', emoji: '🧅' },
            { name: 'garlic', confidence: 0.82, category: 'Vegetables', emoji: '🧄' },
            { name: 'chicken', confidence: 0.91, category: 'Meat', emoji: '🍗' },
          ],
          count: 4,
          fallback: true,
        });
      }

      return NextResponse.json(
        { error: 'Failed to detect ingredients', details: errorText },
        { status: response.status }
      );
    }

    const data: DetectionResponse = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Detection API error:', error);
    
    // Fallback to mock detection on error
    return NextResponse.json({
      ingredients: [
        { name: 'tomato', confidence: 0.95, category: 'Vegetables', emoji: '🍅' },
        { name: 'onion', confidence: 0.87, category: 'Vegetables', emoji: '🧅' },
        { name: 'garlic', confidence: 0.82, category: 'Vegetables', emoji: '🧄' },
        { name: 'chicken', confidence: 0.91, category: 'Meat', emoji: '🍗' },
      ],
      count: 4,
      fallback: true,
      error: error.message,
    });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
