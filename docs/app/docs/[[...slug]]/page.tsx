import { getMDXComponents } from '@/components/mdx';
import { source } from '@/utils/source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle, ViewOptionsPopover } from 'fumadocs-ui/layouts/docs/page';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const repositoryContentUrl = 'https://github.com/raulpesilva/boring-table/blob/main/docs/content/docs';

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

export default async function Page({ params }: PageProps) {
  const { slug = [] } = await params;
  const page = source.getPage(slug);

  if (!page) notFound();

  const MDXContent = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className='mb-6 flex items-center border-b pb-6'>
        <ViewOptionsPopover githubUrl={`${repositoryContentUrl}/${page.path}`} />
      </div>
      <DocsBody>
        <MDXContent components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug = [] } = await params;
  const page = source.getPage(slug);

  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: page.url,
    },
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      type: 'article',
    },
  };
}

export function generateStaticParams() {
  return source.generateParams();
}
