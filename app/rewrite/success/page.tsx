export default function RewriteSuccessPage() {
  return (
    <div className="min-h-screen bg-green-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          ✅ Rewrite Success (Destination)
        </h1>
        <p className="text-gray-700 mb-4">
          This is the <code className="bg-gray-100 px-2 py-1 rounded">/rewrite/success</code> page
        </p>
        
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="font-semibold mb-2">This is the DESTINATION page</p>
          <p className="text-sm">
            When you visit <code className="bg-white px-2 py-1 rounded">/rewrite</code> on Launch, 
            you should see THIS content but the URL stays as <code className="bg-white px-2 py-1 rounded">/rewrite</code>
          </p>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="font-semibold mb-2">🔍 Debug Info:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Actual Page:</strong> /rewrite/success</li>
            <li><strong>URL in Browser:</strong> Should show /rewrite (if rewritten)</li>
            <li><strong>Rewrite Type:</strong> Server-side (invisible to user)</li>
          </ul>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="font-semibold mb-2">📋 Testing Checklist:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Visit /rewrite directly → Check browser URL</li>
            <li>Look for this GREEN page content</li>
            <li>Open DevTools → Network tab → Check status code (200)</li>
            <li>Compare with visiting /rewrite/success directly</li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-gray-100 rounded">
          <p className="text-sm font-semibold mb-2">launch.json Configuration:</p>
          <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`{
  "rewrites": [
    {
      "source": "/rewrite",
      "destination": "/rewrite/success"
    }
  ]
}`}
          </pre>
        </div>

        <div className="mt-6 p-4 bg-purple-50 rounded border border-purple-200">
          <p className="text-sm font-semibold mb-2">💡 How to Verify Rewrite Works:</p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>On <strong>localhost</strong>: You&apos;ll see different pages at /rewrite and /rewrite/success</li>
            <li>On <strong>Launch deployment</strong>: Visiting /rewrite shows THIS green page, but URL stays /rewrite</li>
            <li>Check <code className="bg-white px-1 rounded">X-Rewrite</code> header in DevTools (if Launch adds it)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
