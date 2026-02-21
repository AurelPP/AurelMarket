import "./globals.css";

export const metadata = {
  title: "Cobblemon Market",
  description: "Vitrine des cobblemons vendus par Ruael",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
