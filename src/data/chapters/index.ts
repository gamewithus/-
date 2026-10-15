import { Chapter } from '../../types';
import { chaptersPart1 } from './part1';
import { chaptersPart2 } from './part2';
import { chaptersPart3 } from './part3';
import { chaptersPart4 } from './part4';

export const allChapters: Chapter[] = [
  ...chaptersPart1,
  ...chaptersPart2,
  ...chaptersPart3,
  ...chaptersPart4,
];

export function getChapterById(id: number): Chapter | undefined {
  return allChapters.find(ch => ch.id === id);
}

export function getChapterBySlug(slug: string): Chapter | undefined {
  return allChapters.find(ch => ch.slug === slug);
}
