/**
 * Context Videos — shared types.
 *
 * Video entries are configured in:
 *   src/assets/videos/videos.json
 *
 * To add a new video, add an entry to that JSON file:
 *   "my-page-key": { "id": "YOUTUBE_ID", "title": "...", "description": "..." }
 *
 * Supported fields:
 *   id          — YouTube video ID (required)
 *   title       — shown in the modal header
 *   description — shown below the header
 *   start       — start timestamp in seconds (?start=)
 *   playlist    — YouTube playlist ID (?list=)
 */

export interface VideoEntry {
  id: string;
  title?: string;
  description?: string;
  start?: number;
  playlist?: string;
}
