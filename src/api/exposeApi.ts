/**
 * Expose API - Manage public exposure of Tlon content via %expose agent
 *
 * The %expose agent allows publishing Tlon posts to the clearweb.
 * Posts can be exposed at URLs like: https://ship.tlon.network/expose/chan/diary/~host/channel/note/123
 */

import { poke, scry } from './urbit';

/** Channel kind for cite paths */
export type ChannelKind = 'chat' | 'diary' | 'heap';

/** Content type mapping for each channel kind */
const CONTENT_TYPE_MAP: Record<ChannelKind, string> = {
  chat: 'msg',
  diary: 'note',
  heap: 'curio',
};

/** A cite reference to a post */
export interface Cite {
  chan?: {
    nest: [string, [string, string]]; // [kind, [ship, name]]
    wer: string[]; // [type, id, ...]
  };
  group?: [string, string]; // [ship, name]
  desk?: {
    flag: [string, string];
    wer: string[];
  };
}

/**
 * Expand a simplified cite path to full format
 *
 * @example
 * expandCitePath('chat/~host/channel/170.141...')
 * // Returns: '/1/chan/chat/~host/channel/msg/170.141...'
 *
 * expandCitePath('diary/~host/blog/170.141...')
 * // Returns: '/1/chan/diary/~host/blog/note/170.141...'
 */
export function expandCitePath(input: string): string {
  // Already in full format
  if (input.startsWith('/1/')) {
    return input;
  }

  // Handle simplified format: kind/~host/channel/post-id
  const parts = input.split('/');
  if (parts.length < 4) {
    throw new Error(
      `Invalid cite path. Expected format: chat/~host/channel/post-id or /1/chan/chat/~host/channel/msg/post-id`
    );
  }

  const kind = parts[0] as ChannelKind;
  const host = parts[1]; // ~ship
  const channel = parts[2]; // channel-name
  const postId = parts.slice(3).join('/'); // post-id (may have dots)

  const contentType = CONTENT_TYPE_MAP[kind];
  if (!contentType) {
    throw new Error(
      `Unknown channel kind: ${kind}. Expected chat, diary, or heap.`
    );
  }

  return `/1/chan/${kind}/${host}/${channel}/${contentType}/${postId}`;
}

/**
 * Convert a cite path to a URL path for the public endpoint
 *
 * @example
 * citePathToUrlPath('/1/chan/chat/~host/channel/msg/123')
 * // Returns: '/chan/chat/~host/channel/msg/123'
 */
export function citePathToUrlPath(citePath: string): string {
  // Remove leading /1/ version prefix for URL
  if (citePath.startsWith('/1/')) {
    return citePath.slice(2);
  }
  return citePath;
}

/**
 * Get the public URL for an exposed post
 *
 * @param citePath - The cite path (simplified or full format)
 * @param shipUrl - The ship's base URL (e.g., 'https://ship.tlon.network')
 * @returns The full public URL
 *
 * @example
 * getExposedPostUrl('diary/~host/blog/170.141...', 'https://zod.tlon.network')
 * // Returns: 'https://zod.tlon.network/expose/chan/diary/~host/blog/note/170.141...'
 */
export function getExposedPostUrl(citePath: string, shipUrl: string): string {
  const fullPath = expandCitePath(citePath);
  const urlPath = citePathToUrlPath(fullPath);
  return `${shipUrl}/expose${urlPath}`;
}

/**
 * Format a cite object (from scry) to a readable path string
 */
export function formatCite(cite: Cite | string): string {
  if (typeof cite === 'string') {
    return cite;
  }

  // Handle structured cite format from Urbit
  if (cite.chan) {
    const { nest, wer } = cite.chan;
    const [kind, [ship, name]] = nest;
    const werPath = Array.isArray(wer) ? wer.join('/') : wer;
    return `/1/chan/${kind}/~${ship}/${name}/${werPath}`;
  }

  // Fallback: JSON stringify
  return JSON.stringify(cite);
}

/**
 * List all currently exposed content
 *
 * @returns Array of cite paths for all exposed posts
 */
export async function listExposedContent(): Promise<string[]> {
  try {
    const result = await scry<unknown>({
      app: 'expose',
      path: '/show',
    });

    // Result is a set of cites
    if (Array.isArray(result)) {
      return result.map((cite: Cite | string) => formatCite(cite));
    }

    // Handle set representation (object with values)
    if (result && typeof result === 'object') {
      const values = Object.values(result);
      return values.map((cite: Cite | string) => formatCite(cite));
    }

    return [];
  } catch (err: any) {
    if (
      err?.message?.includes('404') ||
      err?.message?.includes('not found')
    ) {
      return [];
    }
    throw err;
  }
}

/**
 * Check if a specific post is currently exposed
 *
 * @param citePath - The cite path (simplified or full format)
 * @returns true if the post is exposed, false otherwise
 */
export async function checkPostExposed(citePath: string): Promise<boolean> {
  const fullPath = expandCitePath(citePath);

  try {
    const result = await scry<boolean>({
      app: 'expose',
      path: `/show${fullPath}`,
    });
    return !!result;
  } catch (err: any) {
    // 404 means not exposed
    if (
      err?.message?.includes('404') ||
      err?.message?.includes('not found')
    ) {
      return false;
    }
    throw err;
  }
}

/**
 * Expose a post publicly on the clearweb
 *
 * @param citePath - The cite path (simplified or full format)
 *
 * @example
 * await exposePost('diary/~zod/blog/170.141.184.507...')
 */
export async function exposePost(citePath: string): Promise<void> {
  const fullPath = expandCitePath(citePath);

  await poke({
    app: 'expose',
    mark: 'json',
    json: {
      show: fullPath,
    },
  });
}

/**
 * Hide a previously exposed post
 *
 * @param citePath - The cite path (simplified or full format)
 */
export async function hideExposedPost(citePath: string): Promise<void> {
  const fullPath = expandCitePath(citePath);

  await poke({
    app: 'expose',
    mark: 'json',
    json: {
      hide: fullPath,
    },
  });
}

/**
 * Set eager mode for expose agent
 *
 * When eager mode is enabled, the agent will pre-fetch pinned posts
 * from other ships to prime the cache.
 *
 * @param eager - Whether to enable eager mode
 */
export async function setExposeEagerMode(eager: boolean): Promise<void> {
  await poke({
    app: 'expose',
    mark: 'noun',
    json: {
      eager,
    },
  });
}
