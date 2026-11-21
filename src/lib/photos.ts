// The site's photos: stripped web copies (pixels only, no metadata) of
// generated art. Each file is pinned by its SHA-256 hash in the tests, so a
// swapped or edited image is caught.

export type Photo = {
  src: string;
  width: number;
  height: number;
  alt: string;
  sha256: string;
  // A tiny blurred preview shown while the full image loads.
  blur: string;
};

export const PHOTOS = {
  "salon-hero": {
    src: "/images/salon-hero.jpg",
    width: 1536,
    height: 768,
    alt: "A bright salon with tall windows, black styling chairs and round mirrors; a client with shoulder-length hair waits by the window.",
    sha256: "fd2bae57c0698dcef4cc405ef241d1bbd70dd343e73c655df74d5f1704ca0a07",
    blur: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAAIABADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCf/TI7qBbaxDrtb5Aw+c4yeT6DH51nvrrSTXFk9sIJ5Pu7gSQOc4x3HFFFKSKT2P/Z",
  },
} as const satisfies Record<string, Photo>;
