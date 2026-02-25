export default function NewRewritePage() {
  return (
    <div className="min-h-screen bg-teal-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-teal-600 mb-4">
          ✨ New Rewrite Page
        </h1>
        <p className="text-gray-700 mb-4">
          This is the <code className="bg-gray-100 px-2 py-1 rounded">/new_rewrite</code> page
        </p>
        
        <div className="bg-teal-50 border-l-4 border-teal-500 p-4 mb-4">
          <p className="font-semibold mb-2">Current Route:</p>
          <code className="text-sm">/new_rewrite</code>
        </div>
        
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="font-semibold mb-2">Rewrite Test:</p>
          <p className="text-sm">
            This page can be used as a rewrite destination. When another route 
            rewrites to this page, the browser URL stays the same but shows this content.
          </p>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-600 mb-2">Example launch.json configuration:</p>
          <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`{
  "rewrites": [
    {
      "source": "/some-path",
      "destination": "/new_rewrite"
    }
  ]
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
