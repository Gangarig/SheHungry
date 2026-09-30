import type { Metadata } from 'next';
import './globals.css';

const deploymentPath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/^\/+|\/+$/g, '') ?? '';
const favicon = `${deploymentPath ? `/${deploymentPath}` : ''}/favicon.svg`;

export const metadata: Metadata = { title: 'SheHungry — Find your next bite', description: 'Discover curated Vienna restaurants, save your favourites and help shape the friends beta.', robots: { index: false, follow: false }, icons: { icon: favicon } };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
