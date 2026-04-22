import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapPin, Clock, Star, UtensilsCrossed } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1768697358705-c1b60333da35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZXVyb3BlYW4lMjByZXN0YXVyYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzc2NzA0NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Europa Restaurant Interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/50 to-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-4xl mx-auto py-20 sm:py-0">
        <Badge variant="secondary" className="mb-4 glass-effect text-foreground border-border text-xs sm:text-sm">
          <Star className="w-3 h-3 mr-1 fill-current text-yellow-500" />
          4.9 Rating • Fine Dining Experience
        </Badge>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 sm:mb-6 text-white font-bold">
          Europa Restaurant
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed px-2">
          Descubre la auténtica esencia de la cocina europea en el corazón de Bogotá. 
          Sabores refinados, ambiente elegante y una experiencia gastronómica inolvidable.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 text-xs sm:text-sm mb-8 sm:mb-10 px-4">
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-center sm:text-left">Zona Rosa, Centro de Bogotá</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>Abierto Diariamente 12:00 - 23:00</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
          <Button size="lg" className="gradient-vibrant text-white hover:opacity-95 shadow-vibrant w-full sm:w-auto min-h-12">
            <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Reservar Mesa
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white/80 bg-accent/90 text-white hover:bg-accent backdrop-blur-sm shadow-accent w-full sm:w-auto min-h-12"
            onClick={() => {
              const menuSection = document.querySelector('#menu-section');
              if (menuSection) {
                menuSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Menú
          </Button>
        </div>
      </div>

      {/* Scroll Indicator - Hidden on mobile */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 hidden sm:block">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </div>
      </div>
    </section>
  );
}