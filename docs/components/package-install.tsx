import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'fumadocs-ui/components/tabs';

const commands = [
  { id: 'npm', label: 'NPM', command: 'npm install boring-table' },
  { id: 'pnpm', label: 'PNPM', command: 'pnpm add boring-table' },
  { id: 'yarn', label: 'YARN', command: 'yarn add boring-table' },
  { id: 'bun', label: 'BUN', command: 'bun add boring-table' },
] as const;

export function PackageInstall() {
  return (
    <Tabs defaultValue='npm' groupId='package-manager' persist className='bt-install-tabs'>
      <TabsList aria-label='Choose a package manager'>
        {commands.map(({ id, label }) => (
          <TabsTrigger value={id} key={id}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      {commands.map(({ id, command }) => (
        <TabsContent value={id} key={id}>
          <CodeBlock className='bt-install-code' allowCopy>
            <Pre>
              <code>{command}</code>
            </Pre>
          </CodeBlock>
        </TabsContent>
      ))}
    </Tabs>
  );
}
