import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Wifi, 
  Car, 
  Music, 
  Wine, 
  UtensilsCrossed, 
  CreditCard, 
  Users, 
  Clock,
  Smartphone,
  Gift
} from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Wifi,
      title: "WiFi Gratis",
      description: "Internet de alta velocidad en todo el restaurante"
    },
    {
      icon: Car,
      title: "Valet Parking",
      description: "Servicio de aparcacoches para nuestros clientes"
    },
    {
      icon: Music,
      title: "Piano en Vivo",
      description: "Música clásica europea todas las noches"
    },
    {
      icon: Wine,
      title: "Bodega Selecta",
      description: "Más de 300 vinos europeos de primera calidad"
    },
    {
      icon: UtensilsCrossed,
      title: "Menú Degustación",
      description: "Experiencias gastronómicas de 5 y 7 tiempos"
    },
    {
      icon: CreditCard,
      title: "Todos los Pagos",
      description: "Efectivo, tarjetas y pagos sin contacto"
    },
    {
      icon: Users,
      title: "Eventos Privados",
      description: "Salones exclusivos para ocasiones especiales"
    },
    {
      icon: Clock,
      title: "Horario Extendido",
      description: "Abierto desde 12:00 PM hasta 11:00 PM"
    },
    {
      icon: Smartphone,
      title: "Reservas Online",
      description: "Sistema de reservas fácil y rápido"
    },
    {
      icon: Gift,
      title: "Tarjetas Regalo",
      description: "El regalo perfecto para amantes de la gastronomía"
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <Badge variant="outline" className="mb-3 sm:mb-4 text-xs sm:text-sm">
            Servicios Premium
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-4 sm:mb-6 leading-tight px-4">
            Todo para una Experiencia Perfecta
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4 leading-relaxed">
            Desde nuestra selecta carta de vinos hasta nuestros menús degustación, 
            cada detalle está diseñado para superar sus expectativas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-soft hover:border-border transition-all duration-300 border-border/60">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="mx-auto mb-3 sm:mb-4 p-2.5 sm:p-3 gradient-primary rounded-full w-fit shadow-soft">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <CardTitle className="text-base sm:text-lg leading-tight">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 sm:px-6">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}