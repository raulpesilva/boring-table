type HomeCodeShowcaseProps = {
  packageVersion: string;
};

const outputs = [
  ['01', 'createBoringTable', 'FACTORY'],
  ['02', 'useTable', 'REACT HOOK'],
  ['03', 'BoringPlugin', 'EXTENSION'],
  ['04', 'PaginationPlugin', 'ROW PIPE'],
  ['05', 'FilterPlugin', 'TRANSFORM'],
] as const;

export function HomeCodeShowcase({ packageVersion }: HomeCodeShowcaseProps) {
  return (
    <div className='bt-blueprint-scroll' tabIndex={0} aria-label='Scrollable blueprint drawing'>
      <svg
        className='bt-blueprint'
        viewBox='0 0 800 600'
        role='img'
        aria-labelledby='boring-table-blueprint-title boring-table-blueprint-description'>
        <title id='boring-table-blueprint-title'>Boring Table row model assembly</title>
        <desc id='boring-table-blueprint-description'>
          An exploded technical drawing showing data, column functions, and plugins assembled by Boring Table into a row
          model, with public APIs listed as outputs.
        </desc>

        <defs>
          <pattern id='bt-blueprint-small-grid' width='12' height='12' patternUnits='userSpaceOnUse'>
            <path d='M 12 0 L 0 0 0 12' fill='none' stroke='currentColor' strokeOpacity='0.12' strokeWidth='0.55' />
          </pattern>
          <pattern id='bt-blueprint-grid' width='60' height='60' patternUnits='userSpaceOnUse'>
            <rect width='60' height='60' fill='url(#bt-blueprint-small-grid)' />
            <path d='M 60 0 L 0 0 0 60' fill='none' stroke='currentColor' strokeOpacity='0.24' strokeWidth='0.8' />
          </pattern>
          <marker
            id='bt-arrow'
            viewBox='0 0 8 8'
            refX='7'
            refY='4'
            markerWidth='5'
            markerHeight='5'
            orient='auto-start-reverse'>
            <path d='M 0 0 L 8 4 L 0 8 z' fill='currentColor' />
          </marker>
          <filter id='bt-paper-noise' x='-15%' y='-15%' width='130%' height='130%'>
            <feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' seed='7' result='noise' />
            <feColorMatrix in='noise' type='saturate' values='0' result='mono' />
            <feComponentTransfer in='mono'>
              <feFuncA type='table' tableValues='0 0.045' />
            </feComponentTransfer>
          </filter>
        </defs>

        <rect width='800' height='600' className='bp-paper' />
        <rect width='800' height='600' fill='url(#bt-blueprint-grid)' aria-hidden='true' />
        <rect width='800' height='600' filter='url(#bt-paper-noise)' opacity='0.55' aria-hidden='true' />

        <g className='bp-lines'>
          <rect x='16' y='16' width='768' height='568' />
          <path d='M16 29h22M16 16v22M762 16h22M784 16v22M16 562v22M16 584h22M762 584h22M784 562v22' />

          <line x1='48' y1='64' x2='534' y2='64' markerStart='url(#bt-arrow)' markerEnd='url(#bt-arrow)' />
          <line x1='48' y1='58' x2='48' y2='70' />
          <line x1='534' y1='58' x2='534' y2='70' />

          <line x1='44' y1='91' x2='44' y2='406' markerStart='url(#bt-arrow)' markerEnd='url(#bt-arrow)' />
          <line x1='38' y1='91' x2='50' y2='91' />
          <line x1='38' y1='406' x2='50' y2='406' />

          <path d='M176 103l97-31 97 31-97 32-97-32z' className='bp-part' />
          <path d='M176 103v30l97 32 97-32v-30' />
          <path d='M273 135v30' />

          <path d='M176 186l97-31 97 31-97 32-97-32z' className='bp-part bp-part--soft' />
          <path d='M176 186v30l97 32 97-32v-30' />
          <path d='M273 218v30' />

          <path d='M156 278l117-38 117 38-117 39-117-39z' className='bp-core' />
          <path d='M156 278v58l117 39 117-39v-58' className='bp-core' />
          <path d='M273 317v58' />
          <path d='M191 291l82-27 82 27-82 27-82-27z' />

          <path d='M176 396l97-31 97 31-97 32-97-32z' className='bp-part' />
          <path d='M176 396v24l97 32 97-32v-24' />
          <path d='M273 428v24' />

          <rect x='70' y='176' width='73' height='74' className='bp-module' />
          <path d='M81 190h51M81 202h35M81 214h45M81 228h26' />
          <line x1='143' y1='213' x2='174' y2='226' markerEnd='url(#bt-arrow)' />

          <rect x='405' y='174' width='118' height='82' className='bp-module' />
          <path d='M417 189h94M417 202h62M417 215h83M417 229h49M417 242h78' />
          <line x1='405' y1='218' x2='372' y2='245' markerEnd='url(#bt-arrow)' />

          <line x1='273' y1='165' x2='273' y2='154' markerEnd='url(#bt-arrow)' />
          <line x1='273' y1='248' x2='273' y2='238' markerEnd='url(#bt-arrow)' />
          <line x1='273' y1='375' x2='273' y2='364' markerEnd='url(#bt-arrow)' />

          <path d='M165 105H91V91H54' />
          <circle cx='165' cy='105' r='3' className='bp-node' />
          <path d='M372 185h66v-45h94' />
          <circle cx='372' cy='185' r='3' className='bp-node' />
          <path d='M389 303h95v-25h48' />
          <circle cx='389' cy='303' r='3' className='bp-node' />
          <path d='M371 407h74v41h87' />
          <circle cx='371' cy='407' r='3' className='bp-node' />

          <rect x='58' y='466' width='210' height='45' />
          <path d='M72 479h57v18H72zM139 479h52v18h-52zM201 479h53v18h-53z' />
          <rect x='289' y='466' width='245' height='45' />
          <path d='M304 479h51v18h-51zM363 479h156v18H363z' />

          <rect x='558' y='44' width='204' height='410' className='bp-output-panel' />
          <line x1='558' y1='88' x2='762' y2='88' />
          {outputs.map(([index], outputIndex) => {
            const y = 88 + outputIndex * 54;
            return <line key={index} x1='558' y1={y + 54} x2='762' y2={y + 54} />;
          })}
          <line x1='558' y1='358' x2='762' y2='358' />

          <line x1='16' y1='520' x2='784' y2='520' />
          <line x1='420' y1='520' x2='420' y2='584' />
          <line x1='590' y1='520' x2='590' y2='584' />
          <line x1='684' y1='520' x2='684' y2='584' />
        </g>

        <g className='bp-type'>
          <text x='291' y='55' textAnchor='middle' className='bp-dimension'>
            INPUT SPAN / DATA + COLUMNS + PLUGINS
          </text>
          <text x='35' y='250' transform='rotate(-90 35 250)' textAnchor='middle' className='bp-dimension'>
            ASSEMBLY HEIGHT / 04 STAGES
          </text>

          <text x='55' y='85' className='bp-label'>
            INPUT A / TYPED DATA[]
          </text>
          <text x='532' y='126' textAnchor='end' className='bp-label'>
            INPUT B / COLUMN FUNCTIONS
          </text>
          <text x='532' y='270' textAnchor='end' className='bp-label'>
            BEHAVIOR / PLUGIN CHAIN
          </text>
          <text x='532' y='438' textAnchor='end' className='bp-label'>
            OUTPUT / ROW MODEL
          </text>

          <text x='273' y='99' textAnchor='middle' className='bp-part-label'>
            DATA
          </text>
          <text x='273' y='182' textAnchor='middle' className='bp-part-label'>
            COLUMNS
          </text>
          <text x='273' y='285' textAnchor='middle' className='bp-core-label'>
            BORING TABLE
          </text>
          <text x='273' y='301' textAnchor='middle' className='bp-small'>
            CORE ASSEMBLY
          </text>
          <text x='273' y='393' textAnchor='middle' className='bp-part-label'>
            ROW MODEL
          </text>
          <text x='106' y='166' textAnchor='middle' className='bp-small'>
            OPTIONS
          </text>
          <text x='464' y='164' textAnchor='middle' className='bp-small'>
            PLUGINS
          </text>

          <text x='58' y='459' className='bp-small'>
            CORE ELEVATION
          </text>
          <text x='289' y='459' className='bp-small'>
            REACT ELEVATION
          </text>
          <text x='72' y='490' className='bp-mini'>
            HEAD
          </text>
          <text x='142' y='490' className='bp-mini'>
            BODY
          </text>
          <text x='203' y='490' className='bp-mini'>
            FOOTER
          </text>
          <text x='308' y='490' className='bp-mini'>
            STORE
          </text>
          <text x='370' y='490' className='bp-mini'>
            USE SYNC EXTERNAL STORE
          </text>

          <text x='575' y='63' className='bp-small'>
            OUTPUT ASSEMBLY
          </text>
          <text x='575' y='78' className='bp-mini'>
            PUBLIC SURFACES / 05
          </text>
          {outputs.map(([index, name, role], outputIndex) => {
            const y = 108 + outputIndex * 54;
            return (
              <g key={index}>
                <text x='575' y={y} className='bp-output-index'>
                  {index}
                </text>
                <text x='605' y={y} className='bp-output-name'>
                  {name}
                </text>
                <text x='605' y={y + 15} className='bp-output-role'>
                  {role}
                </text>
              </g>
            );
          })}
          <text x='575' y='383' className='bp-small'>
            ASSEMBLY NOTE
          </text>
          <text x='575' y='403' className='bp-note'>
            ONE MODEL.
          </text>
          <text x='575' y='420' className='bp-note'>
            YOUR MARKUP.
          </text>
          <text x='575' y='438' className='bp-mini'>
            PLUGINS SHARE THE SAME ROW PIPE.
          </text>

          <text x='29' y='539' className='bp-title-label'>
            PROJECT
          </text>
          <text x='29' y='555' className='bp-title-value'>
            BORING TABLE / HEADLESS DATA GRID
          </text>
          <text x='29' y='573' className='bp-title-label'>
            DRAWING
          </text>
          <text x='100' y='573' className='bp-title-value'>
            ROW MODEL ASSEMBLY
          </text>

          <text x='436' y='539' className='bp-title-label'>
            SHEET
          </text>
          <text x='436' y='570' className='bp-title-number'>
            A-01
          </text>
          <text x='606' y='539' className='bp-title-label'>
            PACKAGE
          </text>
          <text x='606' y='570' className='bp-title-value'>
            boring-table
          </text>
          <text x='700' y='539' className='bp-title-label'>
            REV
          </text>
          <text x='700' y='570' className='bp-title-number'>
            v{packageVersion}
          </text>
        </g>
      </svg>
    </div>
  );
}
