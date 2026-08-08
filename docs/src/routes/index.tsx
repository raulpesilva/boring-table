import { baseOptions } from '@/lib/layout.shared';
import { createFileRoute, Link } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { codeToHtml } from 'shiki';

const codeSnippet = `import { createBoringTable } from 'boring-table'

const table = createBoringTable({
  data: users,
  getId: (user) => user.id,
  columns: [
    { head: () => 'Name', body: (user) => user.name },
    { head: () => 'Email', body: (user) => user.email },
  ],
})`;

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => {
    const html = await codeToHtml(codeSnippet, {
      lang: 'typescript',
      theme: 'github-dark',
    });
    return { codeHtml: html };
  },
});

function Home() {
  const { codeHtml } = Route.useLoaderData();

  return (
    <HomeLayout {...baseOptions()}>
      <div className='home-container'>
        {/* Grain overlay */}
        <div className='grain-overlay' />

        {/* Floating decorative elements */}
        <div className='floating-shapes'>
          <div className='shape shape-1' />
          <div className='shape shape-2' />
          <div className='shape shape-3' />
        </div>

        <main className='hero-section'>
          {/* Left content */}
          <div className='hero-content'>
            <div className='badge-container'>
              <span className='version-badge'>v1.0</span>
              <span className='status-badge'>Headless</span>
              <span className='status-badge'>TypeScript</span>
            </div>

            <h1 className='hero-title'>
              <span className='title-line title-line-1'>Tables don't</span>
              <span className='title-line title-line-2'>have to be</span>
              <span className='title-line title-line-3 title-accent'>boring.</span>
            </h1>

            <p className='hero-description'>
              A headless, framework-agnostic table library with a powerful plugin system. Full control over your UI.
              Zero opinions. Infinite possibilities.
            </p>

            <div className='feature-pills'>
              <div className='pill'>
                <span className='pill-icon'>
                  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M12 2L2 7l10 5 10-5-10-5z' />
                    <path d='M2 17l10 5 10-5' />
                    <path d='M2 12l10 5 10-5' />
                  </svg>
                </span>
                <span>Plugin Architecture</span>
              </div>
              <div className='pill'>
                <span className='pill-icon'>
                  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <polyline points='16,18 22,12 16,6' />
                    <polyline points='8,6 2,12 8,18' />
                  </svg>
                </span>
                <span>Framework Agnostic</span>
              </div>
              <div className='pill'>
                <span className='pill-icon'>
                  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
                  </svg>
                </span>
                <span>Type Safe</span>
              </div>
              <div className='pill'>
                <span className='pill-icon'>
                  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <circle cx='12' cy='12' r='10' />
                    <path d='M12 6v6l4 2' />
                  </svg>
                </span>
                <span>Zero Dependencies</span>
              </div>
            </div>

            <div className='cta-group'>
              <Link to='/docs/$' params={{ _splat: '' }} className='cta-primary'>
                <span>Read the Docs</span>
                <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' className='cta-arrow'>
                  <path d='M5 12h14M12 5l7 7-7 7' />
                </svg>
              </Link>
              <a
                href='https://github.com/AugustinSorel/boring-table'
                target='_blank'
                rel='noopener noreferrer'
                className='cta-secondary'>
                <svg viewBox='0 0 24 24' fill='currentColor' className='github-icon'>
                  <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
                </svg>
                <span>GitHub</span>
              </a>
            </div>

            {/* Code preview */}
            <div className='code-preview'>
              <div className='code-header'>
                <div className='code-dots'>
                  <span className='dot dot-red' />
                  <span className='dot dot-yellow' />
                  <span className='dot dot-green' />
                </div>
                <span className='code-filename'>table.ts</span>
              </div>
              <div className='code-content' dangerouslySetInnerHTML={{ __html: codeHtml }} />
            </div>
          </div>

          {/* Right mascot */}
          <div className='hero-mascot'>
            <div className='mascot-glow' />
            <img
              src='/logo.svg'
              alt='Boring Table mascot - a friendly mole holding a table'
              className='mascot-image mascot-light'
            />
            <img
              src='/logo-dark.svg'
              alt='Boring Table mascot - a friendly mole holding a table'
              className='mascot-image mascot-dark'
            />
            <div className='mascot-shadow' />
          </div>
        </main>

        {/* Bottom feature strip */}
        <div className='feature-strip'>
          <div className='strip-item'>
            <span className='strip-number'>01</span>
            <span className='strip-text'>Headless by design</span>
          </div>
          <div className='strip-divider' />
          <div className='strip-item'>
            <span className='strip-number'>02</span>
            <span className='strip-text'>Plugin system</span>
          </div>
          <div className='strip-divider' />
          <div className='strip-item'>
            <span className='strip-number'>03</span>
            <span className='strip-text'>React bindings</span>
          </div>
          <div className='strip-divider' />
          <div className='strip-item'>
            <span className='strip-number'>04</span>
            <span className='strip-text'>Full TypeScript</span>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
