import { homeOptions } from '@/lib/layout.shared';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import type { ReactNode } from 'react';
// oxlint-disable-next-line import/no-unassigned-import -- Route-scoped styles are loaded by the home layout.
import './home.css';

export default function PresentationLayout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout {...homeOptions()} className='dark'>
      {children}
    </HomeLayout>
  );
}
