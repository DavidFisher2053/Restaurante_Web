import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Wine } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface WineMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WineMenuModal({ isOpen, onClose }: WineMenuModalProps) {
  const wineCategories = [
    {
      category: "Vinos Tintos Franceses",
      items: [
        { name: "Château Margaux 2015", region: "Burdeos, Francia", price: "$450,000", description: "Elegante y complejo con notas de frutas negras", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop" },
        { name: "Châteauneuf-du-Pape", region: "Valle del Ródano, Francia", price: "$180,000", description: "Potente y especiado con taninos sedosos" },
        { name: "Burgundy Pinot Noir", region: "Borgoña, Francia", price: "$220,000", description: "Delicado y aromático con notas de cereza", image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=400&h=300&fit=crop" },
        { name: "Côtes du Rhône Villages", region: "Ródano, Francia", price: "$95,000", description: "Frutal y accesible, ideal para carnes" }
      ]
    },
    {
      category: "Vinos Tintos Italianos",
      items: [
        { name: "Barolo Riserva", region: "Piamonte, Italia", price: "$280,000", description: "El rey de los vinos, complejo y estructurado", image: "https://images.unsplash.com/photo-1586370434639-0fe43b2d32d6?w=400&h=300&fit=crop" },
        { name: "Brunello di Montalcino", region: "Toscana, Italia", price: "$320,000", description: "Elegante Sangiovese con gran potencial de guarda" },
        { name: "Amarone della Valpolicella", region: "Véneto, Italia", price: "$240,000", description: "Rico y concentrado de uvas pasificadas", image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=300&fit=crop" },
        { name: "Chianti Classico Riserva", region: "Toscana, Italia", price: "$145,000", description: "Equilibrado con notas de cereza y especias" }
      ]
    },
    {
      category: "Vinos Tintos Españoles",
      items: [
        { name: "Vega Sicilia Único", region: "Ribera del Duero, España", price: "$550,000", description: "Legendario vino español de gran complejidad" },
        { name: "Rioja Gran Reserva", region: "La Rioja, España", price: "$165,000", description: "Crianza extendida, elegante y refinado" },
        { name: "Priorat", region: "Cataluña, España", price: "$190,000", description: "Mineral e intenso de viñedos de pizarra" },
        { name: "Ribera del Duero Crianza", region: "Castilla y León, España", price: "$120,000", description: "Potente Tempranillo con carácter" }
      ]
    },
    {
      category: "Vinos Blancos",
      items: [
        { name: "Chablis Premier Cru", region: "Borgoña, Francia", price: "$175,000", description: "Mineral y fresco con notas cítricas", image: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400&h=300&fit=crop" },
        { name: "Sancerre", region: "Valle del Loira, Francia", price: "$130,000", description: "Sauvignon Blanc aromático y vibrante" },
        { name: "Riesling Spätlese", region: "Mosela, Alemania", price: "$110,000", description: "Semi-seco con equilibrio entre dulzor y acidez", image: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=400&h=300&fit=crop" },
        { name: "Gavi di Gavi", region: "Piamonte, Italia", price: "$95,000", description: "Cortese fresco y elegante" },
        { name: "Albariño Rías Baixas", region: "Galicia, España", price: "$85,000", description: "Aromático y refrescante con notas de melocotón" }
      ]
    },
    {
      category: "Vinos Espumosos",
      items: [
        { name: "Champagne Moët & Chandon", region: "Champagne, Francia", price: "$380,000", description: "Burbujas elegantes y refinadas", image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=400&h=300&fit=crop" },
        { name: "Champagne Veuve Clicquot", region: "Champagne, Francia", price: "$420,000", description: "Equilibrado con notas de brioche", image: "https://images.unsplash.com/photo-1625935222473-4739c9deb49c?w=400&h=300&fit=crop" },
        { name: "Prosecco Superiore DOCG", region: "Véneto, Italia", price: "$75,000", description: "Fresco y festivo con burbujas finas" },
        { name: "Cava Reserva", region: "Cataluña, España", price: "$65,000", description: "Método tradicional, cremoso y elegante" }
      ]
    },
    {
      category: "Vinos de Postre",
      items: [
        { name: "Sauternes", region: "Burdeos, Francia", price: "$200,000", description: "Dulce y complejo con notas de miel y albaricoque" },
        { name: "Porto Vintage", region: "Duero, Portugal", price: "$180,000", description: "Fortificado rico con notas de frutos secos" },
        { name: "Moscato d'Asti", region: "Piamonte, Italia", price: "$70,000", description: "Ligero y dulce con aromas florales" },
        { name: "Vin Santo", region: "Toscana, Italia", price: "$95,000", description: "Tradicional vino de postre toscano" }
      ]
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Wine className="w-6 h-6 text-primary" />
            <DialogTitle className="text-2xl sm:text-3xl">Carta de Vinos Europeos</DialogTitle>
          </div>
          <DialogDescription>
            Descubre nuestra exclusiva selección de vinos de las mejores regiones europeas
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-8">
            {wineCategories.map((category, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className="bg-vibrant text-white text-sm px-3 py-1 border-0">
                    {category.category}
                  </Badge>
                  <div className="h-px bg-border flex-1"></div>
                </div>

                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="border-b border-border pb-3 last:border-0">
                      <div className="flex gap-3">
                        {item.image && (
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-4 mb-1">
                            <div>
                              <h4 className="font-medium text-base">{item.name}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">{item.region}</p>
                            </div>
                            <span className="font-medium text-primary flex-shrink-0">{item.price}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
