/**
 * Owner Admin Layout
 *
 * Resets the brand colors to Modulary defaults for the owner's admin panel.
 * The public-facing pages use the owner's custom brand colors,
 * but the admin panel should use consistent Modulary styling.
 */
export default function OwnerAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={
        {
          // Reset to Modulary defaults (indigo)
          '--primary': '239 84% 67%',
          '--primary-foreground': '0 0% 100%',
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
