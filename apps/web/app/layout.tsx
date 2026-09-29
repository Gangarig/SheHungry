import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'SheHungry — Find your next bite', description: 'Swipe nearby restaurants and follow your appetite.' };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
