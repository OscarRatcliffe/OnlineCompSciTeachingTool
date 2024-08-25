import "./globals.scss";

export const metadata: any = {
  title: "Knick Knack",
  description: "Created by Oscar Ratcliffe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
