import { brand } from '@/shared/config/brand';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Minimal header for game pages */}
      <header className="p-4 text-center">
        <h1 className="text-xl font-bold text-primary">{brand.name}</h1>
      </header>

      {/* Main content */}
      <main>{children}</main>
    </div>
  );
}
