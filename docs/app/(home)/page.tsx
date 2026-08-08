import { HomeCodeShowcase } from '@/components/home-code-showcase';
import { PackageInstall } from '@/components/package-install';
import Link from 'next/link';
import packageMetadata from '../../../packages/boring-table-core/package.json';

const repositoryUrl = 'https://github.com/raulpesilva/boring-table';
const npmUrl = 'https://www.npmjs.com/package/boring-table';

const principles = [
  {
    index: '01',
    label: 'RENDERING CONTROL',
    title: 'Own every element',
    description:
      'The core returns rows and cells, never markup. Use semantic tables, div grids, canvas, or your own components.',
    diagram: 'markup',
  },
  {
    index: '02',
    label: 'PLUGIN PIPELINE',
    title: 'Compose behavior',
    description:
      'Filtering, pagination, selection, fetching, and custom behavior travel through one ordered plugin lifecycle.',
    diagram: 'pipeline',
  },
  {
    index: '03',
    label: 'RUNTIME BOUNDARY',
    title: 'Core first. React when needed.',
    description:
      'The core has zero runtime dependencies; the React binding synchronizes the same model through useTable.',
    diagram: 'runtime',
  },
] as const;

const apiRows = [
  {
    index: '01',
    name: 'createBoringTable',
    description: 'Build a typed head, body, customBody, and footer from one options object.',
    href: '/docs/api-reference#createboringtable',
  },
  {
    index: '02',
    name: 'useTable',
    description: 'Create and subscribe to the same table model from React 18 or 19.',
    href: '/docs/api-reference#usetable',
  },
  {
    index: '03',
    name: 'BoringPlugin',
    description: 'Extend lifecycle stages, row shapes, events, and table.extensions.',
    href: '/docs/api-reference#boringplugin',
  },
] as const;

function Arrow() {
  return (
    <svg viewBox='0 0 20 20' aria-hidden='true'>
      <path d='M3 10h13M11 5l5 5-5 5' fill='none' stroke='currentColor' strokeWidth='1.5' />
    </svg>
  );
}

function PrincipleDiagram({ kind }: { kind: (typeof principles)[number]['diagram'] }) {
  if (kind === 'markup') {
    return (
      <svg viewBox='0 0 320 112' role='img' aria-label='One row model feeding three custom render surfaces'>
        <g fill='none' stroke='currentColor' strokeWidth='1' vectorEffect='non-scaling-stroke'>
          <rect x='13' y='35' width='78' height='42' />
          <path d='M91 56h48M139 20v72M139 20h36M139 56h36M139 92h36' />
          <rect x='175' y='7' width='130' height='26' />
          <rect x='175' y='43' width='130' height='26' />
          <rect x='175' y='79' width='130' height='26' />
          <path d='M188 16h58M188 24h92M188 52h92M188 60h72M188 88h45M188 96h91' opacity='0.65' />
        </g>
        <g className='bt-principle-svg-type'>
          <text x='52' y='52' textAnchor='middle'>
            ROW
          </text>
          <text x='52' y='65' textAnchor='middle'>
            MODEL
          </text>
          <text x='258' y='25'>
            TABLE
          </text>
          <text x='258' y='61'>
            GRID
          </text>
          <text x='258' y='97'>
            CANVAS
          </text>
        </g>
      </svg>
    );
  }

  if (kind === 'pipeline') {
    return (
      <svg viewBox='0 0 320 112' role='img' aria-label='Plugins connected in a row processing pipeline'>
        <g fill='none' stroke='currentColor' strokeWidth='1' vectorEffect='non-scaling-stroke'>
          <path d='M14 56h292' />
          <circle cx='44' cy='56' r='22' />
          <circle cx='121' cy='56' r='22' />
          <circle cx='198' cy='56' r='22' />
          <circle cx='275' cy='56' r='22' />
          <path d='M66 56h33M143 56h33M220 56h33' strokeDasharray='4 4' />
          <path d='M36 48h16v16H36zM113 48h16v16h-16zM190 48h16v16h-16zM267 48h16v16h-16z' />
        </g>
        <g className='bt-principle-svg-type'>
          <text x='44' y='95' textAnchor='middle'>
            FILTER
          </text>
          <text x='121' y='95' textAnchor='middle'>
            PAGE
          </text>
          <text x='198' y='95' textAnchor='middle'>
            SELECT
          </text>
          <text x='275' y='95' textAnchor='middle'>
            CUSTOM
          </text>
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox='0 0 320 112' role='img' aria-label='Framework-agnostic core connected to a React binding'>
      <g fill='none' stroke='currentColor' strokeWidth='1' vectorEffect='non-scaling-stroke'>
        <rect x='17' y='20' width='128' height='72' />
        <rect x='175' y='20' width='128' height='72' />
        <path d='M145 56h30M151 50l-6 6 6 6M169 50l6 6-6 6' />
        <path d='M30 35h102M30 47h70M30 59h91M30 71h54' opacity='0.65' />
        <circle cx='239' cy='56' r='23' />
        <ellipse cx='239' cy='56' rx='9' ry='23' transform='rotate(60 239 56)' />
        <ellipse cx='239' cy='56' rx='9' ry='23' transform='rotate(-60 239 56)' />
        <circle cx='239' cy='56' r='3' fill='currentColor' />
      </g>
      <g className='bt-principle-svg-type'>
        <text x='81' y='106' textAnchor='middle'>
          ZERO-DEPS CORE
        </text>
        <text x='239' y='106' textAnchor='middle'>
          REACT BINDING
        </text>
      </g>
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className='bt-home'>
      <section className='bt-hero bt-sheet' aria-labelledby='hero-title'>
        <span className='bt-register-corner bt-register-corner--tl' aria-hidden='true' />
        <span className='bt-register-corner bt-register-corner--br' aria-hidden='true' />

        <div className='bt-hero-grid'>
          <div className='bt-hero-copy'>
            <p className='bt-overline'>HEADLESS TABLE ENGINE / ASSEMBLY 01</p>
            <h1 id='hero-title'>Build the table. Keep the markup.</h1>
            <p className='bt-hero-description'>
              Typed data, column functions, and composable plugins go in. A render-ready row model comes out—with no UI
              decisions made for you.
            </p>

            <div className='bt-hero-actions'>
              <Link className='bt-action bt-action--primary' href='/docs'>
                <span className='bt-action-index'>01</span>
                <span>
                  <small>OPEN SPECIFICATION</small>
                  Read the documentation
                </span>
                <Arrow />
              </Link>
              <a className='bt-action' href={repositoryUrl} target='_blank' rel='noreferrer'>
                <span className='bt-action-index'>02</span>
                <span>
                  <small>INSPECT SOURCE</small>
                  View on GitHub
                </span>
                <Arrow />
              </a>
            </div>

            <div className='bt-install'>
              <span className='bt-install-heading'>N-01 / INSTALL CORE</span>
              <PackageInstall />
            </div>
          </div>

          <div className='bt-hero-blueprint'>
            <HomeCodeShowcase packageVersion={packageMetadata.version} />
          </div>
        </div>

        <dl className='bt-project-specs'>
          <div>
            <dt>RUNTIME</dt>
            <dd>JAVASCRIPT / TYPESCRIPT</dd>
          </div>
          <div>
            <dt>ARCHITECTURE</dt>
            <dd>HEADLESS PLUGIN CORE</dd>
          </div>
          <div>
            <dt>REACT BINDING</dt>
            <dd>REACT 18 / 19</dd>
          </div>
          <div>
            <dt>LICENSE</dt>
            <dd>MIT</dd>
          </div>
        </dl>
      </section>

      <section className='bt-principles bt-sheet' aria-labelledby='principles-title'>
        <div className='bt-section-heading'>
          <p>OPERATING PRINCIPLES / 03</p>
          <h2 id='principles-title'>The engine stays out of the way.</h2>
        </div>
        <div className='bt-principle-grid'>
          {principles.map((principle) => (
            <article className='bt-principle' key={principle.index}>
              <header>
                <span>{principle.index}</span>
                <p>{principle.label}</p>
              </header>
              <div className='bt-principle-diagram'>
                <PrincipleDiagram kind={principle.diagram} />
              </div>
              <h3>{principle.title}</h3>
              <p>{principle.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className='bt-api bt-sheet' aria-labelledby='api-title'>
        <div className='bt-api-intro'>
          <p className='bt-overline'>A SMALL, COMPOSABLE SURFACE</p>
          <h2 id='api-title'>Start with one factory. Extend only what you need.</h2>
          <dl>
            <div>
              <dt>ENTRY POINTS</dt>
              <dd>02 PACKAGES</dd>
            </div>
            <div>
              <dt>BUILT-IN PLUGINS</dt>
              <dd>07 MODULES</dd>
            </div>
            <div>
              <dt>CORE DEPENDENCIES</dt>
              <dd>00</dd>
            </div>
          </dl>
        </div>

        <div className='bt-api-table' role='table' aria-label='Selected public APIs'>
          <div className='bt-api-header' role='row'>
            <span role='columnheader'>REF</span>
            <span role='columnheader'>METHOD / ENTRY POINT</span>
            <span role='columnheader'>SPECIFICATION</span>
            <span role='columnheader'>OPEN</span>
          </div>
          {apiRows.map((row) => (
            <Link className='bt-api-row' href={row.href} key={row.index} role='row'>
              <span className='bt-api-index' role='cell'>
                {row.index}
              </span>
              <code role='cell'>{row.name}</code>
              <span role='cell'>{row.description}</span>
              <span className='bt-api-open' role='cell'>
                <Arrow />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className='bt-cta bt-sheet' aria-labelledby='cta-title'>
        <div className='bt-cta-index' aria-hidden='true'>
          01
        </div>
        <div className='bt-cta-copy'>
          <p>APPROVED FOR IMPLEMENTATION</p>
          <h2 id='cta-title'>Your first row model is one options object away.</h2>
          <span>Install the core, define typed columns, and render the output on your terms.</span>
        </div>
        <Link className='bt-cta-link' href='/docs/installation'>
          <span>NEXT DRAWING / I-01</span>
          <strong>Open the installation plan</strong>
          <Arrow />
        </Link>
        <div className='bt-approval-stamp' aria-label='Boring Table ready stamp'>
          <span>BORING TABLE</span>
          <strong>READY</strong>
          <small>MARKUP YOURS</small>
        </div>
      </section>

      <footer className='bt-footer bt-sheet'>
        <div className='bt-footer-project'>
          <p>PROJECT / BORING TABLE</p>
          <div className='bt-footer-brand'>
            <img src='/logo-dark.svg' alt='' aria-hidden='true' />
            <span>Boring Table</span>
          </div>
        </div>
        <div className='bt-footer-license'>
          <p>LICENSE</p>
          <span>MIT / OPEN SOURCE</span>
        </div>
        <nav aria-label='Footer navigation'>
          <Link href='/docs'>
            <span>01</span>Documentation
          </Link>
          <a href={npmUrl} target='_blank' rel='noreferrer'>
            <span>02</span>npm
          </a>
          <a href={repositoryUrl} target='_blank' rel='noreferrer'>
            <span>03</span>GitHub
          </a>
        </nav>
      </footer>
    </div>
  );
}
