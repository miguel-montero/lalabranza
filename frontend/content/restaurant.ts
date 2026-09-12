import type { Locale } from "./get-dictionary";

export type MenuItem = {
  name: string;
  description: string;
  price: string;
};

export type MenuCategory = {
  category: string;
  items: MenuItem[];
};

export type GalleryPhoto = {
  src: string;
  alt: string;
};

export type RestaurantContent = {
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapEmbedSrc: string;
  heroPhoto: GalleryPhoto;
  gallery: GalleryPhoto[];
  menu: MenuCategory[];
};

const heroPhoto: GalleryPhoto = {
  src: "/images/hero-estate.jpg",
  alt: "The estate at golden hour, table set outdoors among the vines",
};

const gallery: GalleryPhoto[] = [
  { src: "/images/gallery-1.jpg", alt: "Outdoor dining table set among the vineyard rows" },
  { src: "/images/gallery-2.jpg", alt: "Chef preparing a dish tableside" },
  { src: "/images/gallery-3.jpg", alt: "Alpacas grazing on the estate grounds" },
];

const menuEn: MenuCategory[] = [
  {
    category: "To Start",
    items: [
      { name: "Placeholder empanada", description: "Placeholder description", price: "$8" },
      { name: "Placeholder pebre & bread", description: "Placeholder description", price: "$6" },
    ],
  },
  {
    category: "Cooked at Your Table",
    items: [
      { name: "Placeholder parrillada", description: "Placeholder description", price: "$42" },
    ],
  },
];

const menuEs: MenuCategory[] = [
  {
    category: "Para Empezar",
    items: [
      { name: "Empanada de referencia", description: "Descripción de referencia", price: "$8" },
      { name: "Pebre y pan de referencia", description: "Descripción de referencia", price: "$6" },
    ],
  },
  {
    category: "Cocinado en tu Mesa",
    items: [
      { name: "Parrillada de referencia", description: "Descripción de referencia", price: "$42" },
    ],
  },
];

export const restaurantContent: Record<Locale, RestaurantContent> = {
  en: {
    address: "[ADDRESS — REPLACE BEFORE LAUNCH]",
    phone: "+56 [PHONE — REPLACE BEFORE LAUNCH]",
    email: "reservas@lalabranza.example",
    hours: "Seatings Thursday–Sunday, 1:00 PM and 8:00 PM",
    mapEmbedSrc: "https://maps.google.com/maps?q=[COORDINATES]&output=embed",
    heroPhoto,
    gallery,
    menu: menuEn,
  },
  es: {
    address: "[DIRECCIÓN — REEMPLAZAR ANTES DEL LANZAMIENTO]",
    phone: "+56 [TELÉFONO — REEMPLAZAR ANTES DEL LANZAMIENTO]",
    email: "reservas@lalabranza.example",
    hours: "Servicio de jueves a domingo, 13:00 y 20:00 horas",
    mapEmbedSrc: "https://maps.google.com/maps?q=[COORDINATES]&output=embed",
    heroPhoto,
    gallery,
    menu: menuEs,
  },
};
