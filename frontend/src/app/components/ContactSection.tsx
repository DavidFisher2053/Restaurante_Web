import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Navigation,
  Calendar,
  Instagram,
  Facebook
} from 'lucide-react';

export function ContactSection() {
  const contactInfo = [
    {
      icon: MapPin,
      title: "Dirección",
      details: ["Carrera 13 #82-71", "Zona Rosa, Bogotá", "Colombia"]
    },
    {
      icon: Phone,
      title: "Teléfono",
      details: ["+57 (1) 805-0033", "+57 310 555 1234"]
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@europarestaurant.co", "reservas@europarestaurant.co"]
    },
    {
      icon: Clock,
      title: "Horarios",
      details: ["Lun - Jue: 12:00 - 23:00", "Vie - Sáb: 12:00 - 00:00", "Dom: 12:00 - 22:00"]
    }
  ];

  const socialLinks = [
    { icon: Instagram, name: "Instagram", handle: "@europarestaurant_bogota" },
    { icon: Facebook, name: "Facebook", handle: "Europa Restaurant Bogotá" }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <Badge variant="outline" className="mb-3 sm:mb-4 text-xs sm:text-sm">
            Visítanos
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-4 sm:mb-6 leading-tight px-4">
            Ubicación & Contacto
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4 leading-relaxed">
            Ubicados en el corazón de la Zona Rosa de Bogotá, somos fácilmente accesibles 
            en TransMilenio, taxi o Uber. Esperamos darte la bienvenida pronto.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
          {/* Contact Information */}
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="border-border shadow-soft hover:shadow-warm transition-all duration-300">
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 gradient-primary rounded-lg shadow-soft">
                        <info.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <CardTitle className="text-base sm:text-lg">{info.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {info.details.map((detail, detailIndex) => (
                      <p key={detailIndex} className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {detail}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Button size="lg" className="gradient-vibrant text-white hover:opacity-90 shadow-vibrant w-full min-h-12">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Hacer Reserva
                </Button>
                <Button variant="outline" size="lg" className="border-accent text-accent hover:bg-accent hover:text-white transition-all w-full min-h-12">
                  <Navigation className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Cómo Llegar
                </Button>
              </div>
              
              {/* Social Links */}
              <div className="flex gap-3 sm:gap-4 justify-center sm:justify-start flex-wrap">
                {socialLinks.map((social, index) => (
                  <Button key={index} variant="outline" size="sm" className="min-h-10">
                    <social.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                    {social.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-muted h-80 sm:h-96 flex items-center justify-center relative">
                <div className="text-center px-4">
                  <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl mb-2">Mapa Interactivo</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">
                    Haz clic para ver nuestra ubicación en Google Maps
                  </p>
                  <Button className="min-h-10 sm:min-h-11">
                    <Navigation className="w-4 h-4 mr-2" />
                    Abrir en Maps
                  </Button>
                </div>
                
                {/* Address overlay */}
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                  <Card className="bg-white/95 backdrop-blur">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm sm:text-base">Europa Restaurant</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Carrera 13 #82-71, Zona Rosa, Bogotá
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metro Information */}
        <Card className="mt-8 sm:mt-10 lg:mt-12">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl mb-4 sm:mb-6">Transporte Público</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <Badge variant="secondary" className="mb-2 text-xs">TransMilenio</Badge>
                  <p className="text-xs sm:text-sm text-muted-foreground">Estación Calle 85 (7 min a pie)</p>
                </div>
                <div>
                  <Badge variant="secondary" className="mb-2 text-xs">SITP</Badge>
                  <p className="text-xs sm:text-sm text-muted-foreground">Rutas 11-2, M84, 106 disponibles</p>
                </div>
                <div>
                  <Badge variant="secondary" className="mb-2 text-xs">Taxi</Badge>
                  <p className="text-xs sm:text-sm text-muted-foreground">Uber, Didi, Cabify disponibles</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}