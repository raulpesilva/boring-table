import { createFileRoute, notFound } from '@tanstack/react-router';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { createServerFn } from '@tanstack/react-start';
import { source } from '@/lib/source';
import browserCollections from 'fumadocs-mdx:collections/browser';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { baseOptions } from '@/lib/layout.shared';
import { useFumadocsLoader } from 'fumadocs-core/source/client';

export const Route = createFileRoute('/docs/$')({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split('/') ?? [];
    const data = await serverLoader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
});

type PageTreeRoot = ReturnType<typeof source.getPageTree>;
type PageTreeNode = PageTreeRoot['children'][number];
type PageTreeFolder = Extract<PageTreeNode, { type: 'folder' }>;

const serverLoader = createServerFn({
  method: 'GET',
})
  .validator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    const fullTree = source.getPageTree();
    let pageTree = fullTree;

    // Filter tree based on current page path
    const subTree = findRoot(fullTree, page.url);
    if (subTree) {
      pageTree = {
        name: subTree.name,
        children: subTree.children,
      };
    }

    return {
      path: page.path,
      pageTree: await source.serializePageTree(pageTree),
    };
  });

function findRoot(tree: PageTreeRoot | PageTreeFolder, path: string): PageTreeFolder | undefined {
  for (const node of tree.children) {
    if (node.type === 'folder') {
      if (hasPath(node, path)) return node;
    }
  }
  return undefined;
}

function hasPath(node: PageTreeNode, path: string): boolean {
  if (node.type === 'page') return node.url === path;
  if (node.type === 'folder') {
    if (node.index?.url === path) return true;
    return node.children.some((child) => hasPath(child, path));
  }
  return false;
}

const clientLoader = browserCollections.docs.createClientLoader({
  component({ toc, frontmatter, default: MDX }) {
    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <DocsBody>
          <MDX
            components={{
              ...defaultMdxComponents,
            }}
          />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Page() {
  const data = Route.useLoaderData();
  const { pageTree } = useFumadocsLoader(data);
  const content = clientLoader.useContent(data.path);

  return (
    <DocsLayout
      {...baseOptions()}
      tree={pageTree}
      sidebar={{
        tabs: [
          {
            title: 'React',
            url: '/docs/react-boring-table',
          },
          {
            title: 'Core',
            url: '/docs/boring-table-core',
          },
        ],
      }}>
      {content}
    </DocsLayout>
  );
}
