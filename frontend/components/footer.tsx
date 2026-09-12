import type { Dictionary } from "@/content/get-dictionary";

export function Footer({ dictionary }: { dictionary: Dictionary }) {
  return (
    <footer className="px-6 py-8 md:px-12 text-sm font-body">
      <p className="font-label uppercase tracking-wide">{dictionary.footer.partOf}</p>
      <p>&copy; {new Date().getFullYear()} La Labranza. {dictionary.footer.rights}</p>
    </footer>
  );
}
