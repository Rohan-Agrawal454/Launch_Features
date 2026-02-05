export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Contentstack Launch Test
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              A minimal Next.js app for testing Contentstack Launch features
            </p>
          </header>
        </div>
      </main>
    </div>
  );
}
