import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Button } from './ui/button';
import { UtensilsCrossed, LogIn } from 'lucide-react';
import { LoginModal } from './LoginModal';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Only show navbar on landing page
  if (location.pathname.startsWith('/dashboard')) {
    return null;
  }

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect shadow-soft border-b border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <span className="text-lg sm:text-xl font-semibold">Europa Restaurant</span>
            </div>

            {/* Login Button */}
            <Button 
              onClick={() => setIsLoginOpen(true)}
              size="sm"
              className="min-h-10"
            >
              <LogIn className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Iniciar Sesión</span>
              <span className="sm:hidden">Login</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}