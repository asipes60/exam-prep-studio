import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <div className="text-center px-4">
        <h1 className="font-montserrat text-6xl font-bold text-slate-300 mb-4">404</h1>
        <h2 className="font-montserrat text-xl font-semibold text-slate-800 mb-2">
          Page Not Found
        </h2>
        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
          The page you're looking for doesn't exist. Let's get you back to studying.
        </p>
        <Link to="/">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <BookOpen className="w-4 h-4 mr-2" />
            Back to Exam Prep
          </Button>
        </Link>
      </div>
    </div>
  );
}
