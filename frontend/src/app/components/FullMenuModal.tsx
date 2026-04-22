import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FullMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FullMenuModal({ isOpen, onClose }: FullMenuModalProps) {
  const menuCategories = [
    {
      category: "Ensaladas",
      items: [
        { name: "Ensalada César", price: "$32,000", description: "Lechuga romana, parmesano, crutones y aderezo césar", image: "https://images.unsplash.com/photo-1739436776460-35f309e3f887?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWVzYXIlMjBzYWxhZCUyMGZyZXNofGVufDF8fHx8MTc3NjYyMzU1Mnww&ixlib=rb-4.1.0&q=80&w=400" },
        { name: "Ensalada Griega", price: "$28,000", description: "Tomate, pepino, queso feta, aceitunas y orégano" },
        { name: "Ensalada Caprese", price: "$35,000", description: "Tomate, mozzarella de búfala, albahaca y aceite de oliva", image: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400&h=300&fit=crop" },
        { name: "Ensalada Niçoise", price: "$42,000", description: "Atún, huevo, judías verdes, tomate y aceitunas" }
      ]
    },
    {
      category: "Platos Europeos",
      items: [
        { name: "Coq au Vin", price: "$68,000", description: "Pollo estofado en vino tinto con champiñones y tocino", image: "https://images.unsplash.com/photo-1768238907887-023b7ac9f450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBjdWlzaW5lJTIwbWFpbiUyMGNvdXJzZXxlbnwxfHx8fDE3NzY3MDQ1Nzl8MA&ixlib=rb-4.1.0&q=80&w=400" },
        { name: "Ossobuco alla Milanese", price: "$85,000", description: "Jarrete de ternera braseado con risotto azafranado" },
        { name: "Bouillabaisse", price: "$92,000", description: "Auténtica sopa de pescado provenzal con mariscos frescos", image: "https://images.unsplash.com/photo-1648889095175-1757165415e5?w=400&h=300&fit=crop" },
        { name: "Beef Wellington", price: "$110,000", description: "Solomillo en hojaldre con duxelles de champiñones", image: "https://images.unsplash.com/photo-1652690772694-ac68867c30f1?w=400&h=300&fit=crop" },
        { name: "Paella Valenciana", price: "$78,000", description: "Arroz con mariscos, pollo y azafrán" },
        { name: "Wiener Schnitzel", price: "$62,000", description: "Escalope de ternera empanado al estilo vienés" }
      ]
    },
    {
      category: "Hamburguesas",
      items: [
        { name: "Europa Classic Burger", price: "$38,000", description: "Carne angus, queso cheddar, lechuga, tomate y cebolla", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop" },
        { name: "Truffle Mushroom Burger", price: "$45,000", description: "Carne angus, champiñones salteados y aceite de trufa" },
        { name: "Blue Cheese Burger", price: "$42,000", description: "Carne angus, queso azul, cebolla caramelizada y rúcula" },
        { name: "Mediterranean Burger", price: "$40,000", description: "Carne angus, queso feta, aceitunas y tzatziki" }
      ]
    },
    {
      category: "Pizzas",
      items: [
        { name: "Pizza Margherita", price: "$35,000", description: "Salsa de tomate, mozzarella y albahaca fresca", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop" },
        { name: "Pizza Quattro Formaggi", price: "$42,000", description: "Mozzarella, gorgonzola, parmesano y fontina" },
        { name: "Pizza Prosciutto e Funghi", price: "$48,000", description: "Jamón serrano, champiñones y mozzarella", image: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop" },
        { name: "Pizza Diavola", price: "$45,000", description: "Salami picante, mozzarella y aceite de chile" },
        { name: "Pizza Capricciosa", price: "$50,000", description: "Jamón, champiñones, alcachofas y aceitunas" }
      ]
    },
    {
      category: "Bebidas",
      items: [
        { name: "Agua Mineral", price: "$8,000", description: "Con gas o sin gas" },
        { name: "Jugos Naturales", price: "$12,000", description: "Naranja, limón, mango o mora" },
        { name: "Limonada de Hierbabuena", price: "$10,000", description: "Refrescante limonada con menta fresca" },
        { name: "Café Espresso", price: "$7,000", description: "Café italiano de primera calidad" },
        { name: "Cappuccino", price: "$10,000", description: "Espresso con leche vaporizada y espuma" },
        { name: "Té Premium", price: "$8,000", description: "Selección de tés europeos" }
      ]
    },
    {
      category: "Postres",
      items: [
        { name: "Tiramisú", price: "$22,000", description: "Clásico postre italiano con café y mascarpone", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop" },
        { name: "Crème Brûlée", price: "$24,000", description: "Crema francesa con costra de azúcar caramelizada", image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=300&fit=crop" },
        { name: "Tarta Sacher", price: "$26,000", description: "Bizcocho de chocolate vienés con mermelada de albaricoque", image: "https://images.unsplash.com/photo-1736840334919-aac2d5af73e4?w=400&h=300&fit=crop" },
        { name: "Panna Cotta", price: "$20,000", description: "Crema italiana con coulis de frutos rojos" },
        { name: "Profiteroles", price: "$23,000", description: "Bolitas de masa choux rellenas de crema y chocolate" },
        { name: "Strudel de Manzana", price: "$21,000", description: "Masa filo con manzana, canela y helado de vainilla" }
      ]
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl">Menú Completo</DialogTitle>
          <DialogDescription>
            Explora nuestra selección completa de platos europeos organizados por categoría
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-8">
            {menuCategories.map((category, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className="bg-accent text-white text-sm px-3 py-1 border-0">
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
                            <h4 className="font-medium text-base">{item.name}</h4>
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
