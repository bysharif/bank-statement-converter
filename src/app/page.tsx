export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center px-6">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🏦 Bank Statement Converter
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your UK bank statements into clean, readable CSV files with our
            <span className="font-semibold text-blue-600"> universal merchant cleaning system</span>
          </p>

          {/* Key Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold mb-2">Universal UK Banks</h3>
              <p className="text-sm text-gray-600">Works with Wise, Barclays, HSBC, Monzo, Revolut, and more</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🧹</div>
              <h3 className="font-semibold mb-2">85%+ Clean Names</h3>
              <p className="text-sm text-gray-600">AI-powered merchant cleaning transforms generic descriptions</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold mb-2">Secure & Private</h3>
              <p className="text-sm text-gray-600">All processing happens locally, your data never leaves your device</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <a
              href="/convert"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Convert Your Statement Now
            </a>
            <div className="flex justify-center space-x-4 text-sm">
              <a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a>
              <a href="/help" className="text-blue-600 hover:underline">Help</a>
              <a href="/auth/signin" className="text-blue-600 hover:underline">Sign In</a>
            </div>
          </div>
        </div>

        {/* Success Story */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="font-semibold text-green-800 mb-2">✅ Merchant Cleaning Success</h2>
          <p className="text-green-700 text-sm">
            "Transformed my Wise statement from 51% generic 'Transaction' descriptions to 85% meaningful merchant names like 'TAXFORMED (via Stripe)', 'Amazon (Order: RW8Z85UO4)', and 'McDonald's'"
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 text-sm text-gray-500">
          <p>Supports all major UK banks • Free merchant cleaning • Optional AI enhancement</p>
        </div>
      </div>
    </div>
  )
}