/**
 * Test user reference component
 */

export function TestUserReference() {
  return (
    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-3">Test User Reference</h3>
      <div className="space-y-2 text-sm">
        <p className="text-gray-600">
          All test users use password: 
          <code className="bg-white px-2 py-1 rounded ml-2">TestPass123!</code>
        </p>
        <div>
          <p className="text-gray-600 mb-2">Team codes:</p>
          <ul className="ml-4 space-y-1">
            <li>
              <code className="bg-white px-2 py-1 rounded">TEST-TEAM-2024</code>
              <span className="text-gray-500 ml-2">- General test team</span>
            </li>
            <li>
              <code className="bg-white px-2 py-1 rounded">ELITE-2024</code>
              <span className="text-gray-500 ml-2">- Coach Smith's team</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}