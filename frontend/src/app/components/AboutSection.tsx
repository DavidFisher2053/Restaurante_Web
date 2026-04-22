import { ImageWithFallback } from './figma/ImageWithFallback';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ChefHat, Users, Award, Wine } from 'lucide-react';

export function AboutSection() {
  const highlights = [
    {
      icon: ChefHat,
      title: "Chefs Europeos",
      description: "Maestros culinarios de Francia, Italia y España"
    },
    {
      icon: Users,
      title: "Ambiente Refinado",
      description: "Elegancia europea con toques contemporáneos"
    },
    {
      icon: Award,
      title: "Premiado",
      description: "Reconocido como el mejor restaurante europeo de Bogotá"
    },
    {
      icon: Wine,
      title: "Bodega Premium",
      description: "Más de 300 etiquetas de vinos selectos europeos"
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <Badge variant="outline" className="mb-3 sm:mb-4 text-xs sm:text-sm">
              Est. 1999
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-4 sm:mb-6 leading-tight">
              Una Tradición Culinaria Europea
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6 lg:mb-8 leading-relaxed">
              Ubicado en el corazón de la elegante Zona Rosa de Bogotá, Europa Restaurant 
              ha sido un referente de la gastronomía europea durante más de dos décadas. Nuestro 
              interior inspirado en la elegancia clásica europea, combinado con técnicas culinarias 
              contemporáneas, crea una experiencia gastronómica inigualable.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Desde nuestros entrantes mediterráneos hasta nuestros platos principales franceses, 
              cada creación cuenta una historia de tradición, pasión y el espíritu atemporal de 
              la gastronomía europea en el corazón de Colombia.
            </p>
            
            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {highlights.map((highlight, index) => (
                <Card key={index} className="border-border shadow-soft bg-white/80 backdrop-blur-sm hover:shadow-accent hover:border-accent-subtle transition-all duration-300">
                  <CardContent className="p-3 sm:p-4">
                    <highlight.icon className="w-6 h-6 sm:w-8 sm:h-8 text-accent mb-2" />
                    <h4 className="mb-1 sm:mb-2 text-sm sm:text-base font-semibold">{highlight.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {highlight.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="relative order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-3 sm:space-y-4">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400&h=500&fit=crop"
                  alt="Restaurante Interior"
                  className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg"
                />
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1663530761401-15eefb544889?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwZXVyb3BlYW4lMjBmb29kJTIwcGxhdGluZ3xlbnwxfHx8fDE3NzY3MDQ1Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Platillo Gourmet"
                  className="w-full h-40 sm:h-44 lg:h-48 object-cover rounded-lg"
                />
              </div>
              <div className="space-y-3 sm:space-y-4 mt-6 sm:mt-8">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1629386207842-806c2b41a4ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldXJvcGVhbiUyMGN1aXNpbmUlMjBhcHBldGl6ZXJzfGVufDF8fHx8MTc3NjcwNDU3OXww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Entrantes Europeos"
                  className="w-full h-40 sm:h-44 lg:h-48 object-cover rounded-lg"
                />
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1442975631115-c4f7b05b8a2c?w=400&h=500&fit=crop"
                  alt="Ambiente Acogedor"
                  className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}