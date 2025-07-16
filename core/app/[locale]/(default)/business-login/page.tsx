export default async function BusinessLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Business Login Test
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This is a test page to check if routing works.
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-center text-gray-600">
            If you can see this, routing is working!
          </p>
        </div>
      </div>
    </div>
  );
} 