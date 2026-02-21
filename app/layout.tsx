import "./globals.css";

export const metadata = {
  title: "TropiShop",
  description: "Le stand de Ruael sur Tropimon — vitrine des Pokémon à l'échange",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
