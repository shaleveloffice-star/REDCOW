// Login lives under /admin/login with its own layout — do not wrap AdminShell here.
export const metadata = { robots: { index: false, follow: false } };
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
