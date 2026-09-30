import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SheHungry',
  description: 'Find your next favourite bite.',
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
