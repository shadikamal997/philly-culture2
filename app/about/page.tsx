export const metadata = {
  title: 'About Us | Philly Culture Academy',
  description: 'Learn about our mission to provide world-class culinary education',
};

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-8">About Philly Culture Academy</h1>
      
      <div className="prose prose-lg">
        <p className="text-lg text-gray-700 mb-6">
          Welcome to Philly Culture Academy, your premier destination for professional culinary education.
        </p>
        
        <h2 className="text-2xl font-bold mb-4 mt-8">Our Mission</h2>
        <p className="text-gray-700 mb-6">
          We're dedicated to preserving and teaching authentic Philadelphia food culture through 
          comprehensive online programs.
        </p>
        
        <h2 className="text-2xl font-bold mb-4 mt-8">What We Offer</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
          <li>Intensive certification programs</li>
          <li>Weekly masterclasses</li>
          <li>Professional culinary training</li>
          <li>Authentic recipes and techniques</li>
        </ul>
      </div>
    </main>
  );
}
