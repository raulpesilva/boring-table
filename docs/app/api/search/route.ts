import { source } from '@/utils/source';
import { createFromSource } from 'fumadocs-core/search/server';

const search = createFromSource(source, {
  language: 'english',
});

export const { GET } = search;
