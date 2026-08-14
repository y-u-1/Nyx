export const metadata = {
  title: "Nyx. Dashboard",
  description: "Nyx. Discord Bot Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
