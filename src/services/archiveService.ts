import { ArchiveItem } from '../types';

const BASE_URL = 'https://archive.org/advancedsearch.php';

const MYSTERY_TOPICS = [
  'subject:"unidentified flying objects"',
  'subject:"occult"',
  'subject:"classified"',
  'subject:"secret"',
  'subject:"cryptography"',
  'subject:"vintage technology"',
  'subject:"strange signals"',
  'subject:"paranormal"',
  'subject:"conspiracy"',
  'subject:"lost history"',
  'collection:nasa',
  'collection:cia',
  'collection:fbi',
  'collection:prelinger',
  'collection:oldtimeradio',
  'collection:opensource_movies',
  'subject:"cybernetics"',
  'subject:"artificial intelligence"',
  'subject:"space exploration"',
  'subject:"ancient mysteries"'
];

export const archiveService = {
  getMysteriousQuery(): string {
    const randomTopic = MYSTERY_TOPICS[Math.floor(Math.random() * MYSTERY_TOPICS.length)];
    return `(${randomTopic}) AND (mediatype:movies OR mediatype:texts OR mediatype:audio)`;
  },

  async search(query?: string, page: number = 1, rows: number = 20): Promise<ArchiveItem[]> {
    // If no query, get a random mystery topic
    const searchQuery = query || this.getMysteriousQuery();
    
    const params = new URLSearchParams({
      q: searchQuery,
      fl: 'identifier,title,description,mediatype,date,creator,downloads,subject,collection',
      output: 'json',
      rows: rows.toString(),
      page: page.toString(),
      sort: 'downloads desc'
    });

    try {
      const response = await fetch(`${BASE_URL}?${params.toString()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data.response.docs as ArchiveItem[];
    } catch (error) {
      console.error('Archive search error:', error);
      return [];
    }
  },

  getItemImageUrl(identifier: string): string {
    return `https://archive.org/services/img/${identifier}`;
  },

  getEmbedUrl(identifier: string): string {
    // The official embed player handles video, audio, and books
    return `https://archive.org/embed/${identifier}`;
  },

  getDetailsUrl(identifier: string): string {
    return `https://archive.org/details/${identifier}`;
  }
};
