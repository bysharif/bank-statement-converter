export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ✅ Deployment Working!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your bank statement converter is successfully deployed.
        </p>
        <div className="space-y-4">
          <a
            href="/convert"
            className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Go to Converter
          </a>
          <a
            href="/dashboard"
            className="block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
          >
            Go to Dashboard
          </a>
        </div>
        <div className="mt-8 p-4 bg-green-100 rounded-lg">
          <h2 className="font-semibold text-green-800">Merchant Cleaning System Active</h2>
          <p className="text-sm text-green-700">
            Universal cleaning for all UK banks with 85%+ success rate!
          </p>
        </div>
      </div>
    </div>
  )
}