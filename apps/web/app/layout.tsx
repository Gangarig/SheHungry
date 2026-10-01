import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'SheHungry — Find your next bite', description: 'Discover curated Vienna restaurants, save your favourites and help shape the friends beta.', robots: { index: false, follow: false }, icons: { icon: '/favicon.svg' } };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
