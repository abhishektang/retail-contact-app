export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-bold text-xs">RA</span>
            </div>
            <span className="text-sm text-gray-300">RetailAgent</span>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} RetailAgent. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
