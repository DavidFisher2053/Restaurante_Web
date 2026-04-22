import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { AboutSection } from '../components/AboutSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { MenuSection } from '../components/MenuSection';
import { ContactSection } from '../components/ContactSection';
import { UtensilsCrossed, Heart, Star } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Add padding top to account for fixed navbar */}
      <div className="pt-16 sm:pt-20">
        {/* Hero Section */}
        <HeroSection />

        {/* About Section */}
        <AboutSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* Menu Section */}
        <MenuSection />

        {/* Contact Section */}
        <ContactSection />

        {/* Call to Action Section */}
        <section className="py-12 sm:py-16 lg:py-20 gradient-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="flex gap-0.5 sm:gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-6 h-6 sm:w-8 sm:h-8 fill-current text-yellow-300" />
                  ))}
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-4 sm:mb-6 leading-tight px-4">
                Experimenta la Mejor Gastronomía Europea de Bogotá
              </h2>

              <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-95 px-4 leading-relaxed">
                Únete a miles de comensales satisfechos que han hecho de Europa Restaurant
                su destino favorito para una experiencia gastronómica excepcional en Bogotá.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                <Button size="lg" className="bg-vibrant text-white hover:opacity-95 shadow-vibrant w-full sm:w-auto min-h-12">
                  <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Reserva tu Mesa
                </Button>
                <Button size="lg" variant="outline" className="border-white/90 text-white hover:bg-white/20 backdrop-blur-sm w-full sm:w-auto min-h-12">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Regala una Experiencia
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-border py-8 sm:py-10 lg:py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="sm:col-span-2">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <UtensilsCrossed className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  <h3 className="text-xl sm:text-2xl">Europa Restaurant</h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 max-w-md leading-relaxed">
                  El primer destino de gastronomía europea en Bogotá desde 1999. 
                  Experimenta la perfecta fusión de tradición culinaria europea e innovación 
                  en el corazón de la ciudad.
                </p>
                <div className="flex gap-0.5 sm:gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-yellow-400" />
                  ))}
                  <span className="ml-2 text-xs sm:text-sm text-muted-foreground">4.9/5 en Google</span>
                </div>
              </div>
              
              <div>
                <h4 className="mb-3 sm:mb-4 font-semibold text-sm sm:text-base">Enlaces Rápidos</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <li><a href="#menu" className="hover:text-foreground transition-colors">Menú</a></li>
                  <li><a href="#reservations" className="hover:text-foreground transition-colors">Reservaciones</a></li>
                  <li><a href="#events" className="hover:text-foreground transition-colors">Eventos Privados</a></li>
                  <li><a href="#about" className="hover:text-foreground transition-colors">Sobre Nosotros</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="mb-3 sm:mb-4 font-semibold text-sm sm:text-base">Contacto</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <li>Carrera 13 #82-71</li>
                  <li>Zona Rosa, Bogotá</li>
                  <li>+57 (1) 805-0033</li>
                  <li>info@europarestaurant.co</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
              <p>&copy; 2024 Europa Restaurant. Todos los derechos reservados. Hecho con ❤️ en Bogotá.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}