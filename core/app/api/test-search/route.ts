import { NextRequest, NextResponse } from 'next/server';

import { getQuickSearchResults } from '~/client/queries/get-quick-search-results';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('term') || 'test';

    console.log('Test API: Searching for term:', term);

    const results = await getQuickSearchResults({ searchTerm: term });

    console.log('Test API: Search results count:', results.products?.length || 0);

    return NextResponse.json({
      success: true,
      term,
      resultsCount: results.products?.length || 0,
      results: results.products?.slice(0, 3) || [] // Return first 3 results for testing
    });
  } catch (error) {
    console.error('Test API: Search error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 