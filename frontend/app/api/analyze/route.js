export async function POST(request) {
  try {
    const { fileUrl, fileType } = await request.json();

    if (!fileUrl || !fileType) {
      return new Response(
        JSON.stringify({
          error: 'File URL and type are required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward analysis request to backend at localhost:5000
    const response = await fetch('http://localhost:5000/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileUrl,
        fileType,
      }),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: `Backend error: ${response.statusText}`,
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Analysis API error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Analysis failed',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
