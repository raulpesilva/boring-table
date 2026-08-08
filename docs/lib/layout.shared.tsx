import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

const repositoryUrl = 'https://github.com/raulpesilva/boring-table';

function Brand() {
  return (
    <span className='bt-brand'>
      <img className='bt-brand-logo bt-brand-logo--light' src='/logo.svg' alt='' aria-hidden='true' />
      <img className='bt-brand-logo bt-brand-logo--dark' src='/logo-dark.svg' alt='' aria-hidden='true' />
      <span>Boring Table</span>
    </span>
  );
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Brand />,
      url: '/',
      transparentMode: 'none',
    },
    links: [
      {
        text: 'Documentation',
        url: '/docs',
        active: 'nested-url',
      },
      {
        text: 'API reference',
        url: '/docs/api-reference',
        active: 'url',
      },
    ],
    githubUrl: repositoryUrl,
  };
}

export function homeOptions(): BaseLayoutProps {
  return {
    ...baseOptions(),
    searchToggle: { enabled: false },
    themeSwitch: { enabled: false },
  };
}
