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

const heroPhotoEn: GalleryPhoto = {
  src: "/images/hero-estate.webp",
  alt: "Guests gathered around the long communal table, wine poured, sunlight through the curtains",
};

const heroPhotoEs: GalleryPhoto = {
  src: "/images/hero-estate.webp",
  alt: "Invitados reunidos en la mesa larga, vino servido, luz de sol entrando por las cortinas",
};

const galleryEn: GalleryPhoto[] = [
  { src: "/images/gallery-toast.webp", alt: "Guests raising a toast together at the long table" },
  { src: "/images/gallery-grapes.webp", alt: "Wine grapes ripening on the vine at the estate" },
  { src: "/images/gallery-alpaca.webp", alt: "One of the estate's alpacas, close up" },
  { src: "/images/gallery-horse.webp", alt: "A guest feeding one of the estate's horses at golden hour" },
  { src: "/images/gallery-tasting-room.webp", alt: "Guests enjoying a flight in the tasting room" },
  { src: "/images/gallery-bar.webp", alt: "The tasting bar, set with spirits and snacks" },
  { src: "/images/gallery-table-set.webp", alt: "The long table set for guests, wine and flowers along its length" },
  { src: "/images/gallery-pisco-tasting.webp", alt: "A flight of pisco tastings lined up at the bar" },
  { src: "/images/gallery-alpaca-portrait.webp", alt: "A close portrait of a young dark alpaca" },
  { src: "/images/gallery-tasting-bar.webp", alt: "Guests raising a toast at the tasting bar" },
  { src: "/images/gallery-horse-closeup.webp", alt: "A guest's hand reaching to feed one of the estate's horses" },
];

const galleryEs: GalleryPhoto[] = [
  { src: "/images/gallery-toast.webp", alt: "Invitados brindando juntos en la mesa larga" },
  { src: "/images/gallery-grapes.webp", alt: "Uvas madurando en la viña del fundo" },
  { src: "/images/gallery-alpaca.webp", alt: "Una de las alpacas del fundo, de cerca" },
  { src: "/images/gallery-horse.webp", alt: "Una visitante alimentando a uno de los caballos del fundo al atardecer" },
  { src: "/images/gallery-tasting-room.webp", alt: "Invitados disfrutando una degustación en la sala de cata" },
  { src: "/images/gallery-bar.webp", alt: "La barra de degustación, con destilados y aperitivos" },
  { src: "/images/gallery-table-set.webp", alt: "La mesa larga lista para los invitados, con vino y flores" },
  { src: "/images/gallery-pisco-tasting.webp", alt: "Una degustación de piscos servida en la barra" },
  { src: "/images/gallery-alpaca-portrait.webp", alt: "Retrato de cerca de una alpaca joven de color oscuro" },
  { src: "/images/gallery-tasting-bar.webp", alt: "Invitados brindando en la barra de degustación" },
  { src: "/images/gallery-horse-closeup.webp", alt: "La mano de un invitado alimentando a uno de los caballos del fundo" },
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
    address: "Sector D 431, Los Muñoces, Isla de Maipo, Región Metropolitana, Chile",
    phone: "+56 [PHONE — REPLACE BEFORE LAUNCH]",
    email: "reservas@lalabranza.cl",
    hours: "Seatings Monday–Friday, 11:00 AM and 2:00 PM",
    mapEmbedSrc:
      "https://maps.google.com/maps?q=" +
      encodeURIComponent("Sector D 431, Los Muñoces, Isla de Maipo, Región Metropolitana, Chile") +
      "&output=embed",
    heroPhoto: heroPhotoEn,
    gallery: galleryEn,
    menu: menuEn,
  },
  es: {
    address: "Sector D 431, Los Muñoces, Isla de Maipo, Región Metropolitana, Chile",
    phone: "+56 [TELÉFONO — REEMPLAZAR ANTES DEL LANZAMIENTO]",
    email: "reservas@lalabranza.cl",
    hours: "Servicio de lunes a viernes, 11:00 y 14:00 horas",
    mapEmbedSrc:
      "https://maps.google.com/maps?q=" +
      encodeURIComponent("Sector D 431, Los Muñoces, Isla de Maipo, Región Metropolitana, Chile") +
      "&output=embed",
    heroPhoto: heroPhotoEs,
    gallery: galleryEs,
    menu: menuEs,
  },
};
