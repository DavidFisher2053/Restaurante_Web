import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Star, Clock } from 'lucide-react';
import { FullMenuModal } from './FullMenuModal';
import { WineMenuModal } from './WineMenuModal';

export function MenuSection() {
  const [isFullMenuOpen, setIsFullMenuOpen] = useState(false);
  const [isWineMenuOpen, setIsWineMenuOpen] = useState(false);
  const menuCategories = [
    {
      title: "Entrantes & Tapas",
      time: "Todo el día",
      image: "https://images.unsplash.com/photo-1629386207842-806c2b41a4ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldXJvcGVhbiUyMGN1aXNpbmUlMjBhcHBldGl6ZXJzfGVufDF8fHx8MTc3NjcwNDU3OXww&ixlib=rb-4.1.0&q=80&w=1080",
      items: [
        { name: "Carpaccio de Ternera", price: "$38,000", description: "Finas láminas de ternera con rúcula, parmesano y aceite de trufa" },
        { name: "Foie Gras Mi-Cuit", price: "$58,000", description: "Foie gras con compota de higos y pan brioche tostado" },
        { name: "Tabla de Quesos Europeos", price: "$48,000", description: "Selección de 5 quesos artesanales con mermeladas y frutos secos" }
      ]
    },
    {
      title: "Platos Principales",
      time: "14:00 - 23:00",
      image: "https://images.unsplash.com/photo-1768238907887-023b7ac9f450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBjdWlzaW5lJTIwbWFpbiUyMGNvdXJzZXxlbnwxfHx8fDE3NzY3MDQ1Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      items: [
        { name: "Coq au Vin", price: "$68,000", description: "Pollo estofado en vino tinto con champiñones y tocino" },
        { name: "Ossobuco alla Milanese", price: "$85,000", description: "Jarrete de ternera braseado con risotto azafranado" },
        { name: "Lubina a la Plancha", price: "$75,000", description: "Lubina mediterránea con verduras asadas y salsa virgen" }
      ]
    },
    {
      title: "Especialidades del Chef",
      time: "18:00 - 22:00",
      image: "https://images.unsplash.com/photo-1663530761401-15eefb544889?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwZXVyb3BlYW4lMjBmb29kJTIwcGxhdGluZ3xlbnwxfHx8fDE3NzY3MDQ1Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      items: [
        { name: "Chateaubriand para Dos", price: "$155,000", description: "Solomillo de ternera con salsa bearnesa y papas gratinadas" },
        { name: "Bouillabaisse", price: "$92,000", description: "Auténtica sopa de pescado provenzal con mariscos frescos" },
        { name: "Cordero Wellington", price: "$110,000", description: "Cordero en hojaldre con duxelles de champiñones y reducción de oporto" }
      ]
    }
  ];

  return (
    <section id="menu-section" className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <Badge variant="outline" className="mb-3 sm:mb-4 text-xs sm:text-sm">
            Excelencia Culinaria
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-4 sm:mb-6 leading-tight px-4">
            Nuestras Especialidades
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4 leading-relaxed">
            Descubre nuestra cuidadosa selección de platos europeos clásicos y contemporáneos, 
            todos preparados con ingredientes de la más alta calidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {menuCategories.map((category, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-warm transition-all duration-300 border-border">
              <CardHeader className="p-0">
                <div className="relative">
                  <ImageWithFallback
                    src={category.image}
                    alt={category.title}
                    className="w-full h-44 sm:h-48 object-cover"
                  />
                  <Badge className="absolute top-3 sm:top-4 right-3 sm:right-4 glass-effect text-foreground text-xs border-0 shadow-soft">
                    <Clock className="w-3 h-3 mr-1" />
                    {category.time}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl mb-4">{category.title}</CardTitle>
                
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="border-b border-border last:border-b-0 pb-3 sm:pb-4 last:pb-0">
                      <div className="flex justify-between items-start mb-1.5 sm:mb-2 gap-2">
                        <h4 className="font-medium text-sm sm:text-base leading-tight">{item.name}</h4>
                        <span className="font-medium text-primary text-sm sm:text-base flex-shrink-0">{item.price}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          <Button
            size="lg"
            className="gradient-vibrant text-white hover:opacity-90 shadow-vibrant w-full sm:w-auto min-h-12"
            onClick={() => setIsFullMenuOpen(true)}
          >
            Ver Menú Completo
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-accent text-accent hover:bg-accent hover:text-white transition-all w-full sm:w-auto min-h-12"
            onClick={() => setIsWineMenuOpen(true)}
          >
            Carta de Vinos
          </Button>
        </div>
      </div>

      <FullMenuModal isOpen={isFullMenuOpen} onClose={() => setIsFullMenuOpen(false)} />
      <WineMenuModal isOpen={isWineMenuOpen} onClose={() => setIsWineMenuOpen(false)} />
    </section>
  );
}