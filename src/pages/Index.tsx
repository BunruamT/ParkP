
import { useAuth } from '../context/AuthContext';
import { LandingPage } from './LandingPage';
import { HomePage } from './HomePage';

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return <LandingPage />;
  }

  // Show home page for authenticated users with navbar
  return (
    <>
      <div className="pt-16">
        <HomePage />
      </div>
    </>
  );
};

export default Index;
