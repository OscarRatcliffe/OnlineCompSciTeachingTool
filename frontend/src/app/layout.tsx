import "./globals.scss";

export const metadata: Metadata = {
  title: "CompSciTeachingTool",
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
