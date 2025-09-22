export default function TestApp() {
  return (
    <div className="min-h-screen bg-red-500 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Tailwind Test</h1>
        <p className="text-xl">RED background = Tailwind working ✅</p>
        <p className="text-xl">White background = Tailwind broken ❌</p>
      </div>
    </div>
  );
}
