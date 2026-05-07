import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get all query parameters from the request
    const searchParams = request.nextUrl.searchParams;
    const params: Record<string, string> = {};
    
    // Convert URLSearchParams to a plain object
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const response = NextResponse.json({
      success: true,
      message: 'Query parameters retrieved successfully',
      params: params,
      requestPath: request.nextUrl.pathname + request.nextUrl.search,
      fullUrl: request.url,
      timestamp: new Date().toISOString(),
    });

    // Add caching headers - cache for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    response.headers.set('Content-Type', 'application/json');
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to retrieve parameters',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}