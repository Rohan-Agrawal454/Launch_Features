export default function RewritePage() {
  return (
    <div className="min-h-screen bg-purple-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-purple-600 mb-4">
          🔄 Rewrite Source Page
        </h1>
        <p className="text-gray-700 mb-4">
          This is the <code className="bg-gray-100 px-2 py-1 rounded">/rewrite</code> page
        </p>
        
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-4">
          <p className="font-semibold mb-2">Current Route:</p>
          <code className="text-sm">/rewrite</code>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <p className="font-semibold mb-2">Note:</p>
          <p className="text-sm">
            If this route is configured for rewrite in launch.json, 
            the URL will stay as /rewrite but content from another route will be shown.
          </p>
        </div>
      </div>
    </div>
  );
}
