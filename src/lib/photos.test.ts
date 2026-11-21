import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PHOTOS } from "./photos";

const PUBLIC = join(process.cwd(), "public");

// JPEG sections that may appear before the image data. Everything else
// (APP1 to APP15 for EXIF, XMP and ICC profiles, and COM for comments) is metadata.
const ALLOWED = new Set([
  0xe0, // APP0: the basic JFIF header
  0xdb, // quantisation tables
  0xc0, // baseline frame
  0xc2, // progressive frame
  0xc4, // Huffman tables
  0xdd, // restart interval
]);

type JpegScan = { width: number; height: number; metadata: string[] };

/** Reads the sections in front of the image data and reports any metadata. */
function scanJpeg(bytes: Buffer): JpegScan {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error("Not a JPEG file");
  const metadata: string[] = [];
  let width = 0;
  let height = 0;
  let offset = 2;
  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) throw new Error(`Bad section marker at byte ${offset}`);
    const marker = bytes[offset + 1];
    if (marker === 0xda) break; // start of the image data: no more sections
    const length = bytes.readUInt16BE(offset + 2);
    if (marker === 0xc0 || marker === 0xc2) {
      height = bytes.readUInt16BE(offset + 5);
      width = bytes.readUInt16BE(offset + 7);
    }
    if (!ALLOWED.has(marker)) metadata.push(`0xFF${marker.toString(16).toUpperCase()}`);
    offset += 2 + length;
  }
  return { width, height, metadata };
}

function bytesOf(src: string): Buffer {
  return readFileSync(join(PUBLIC, src));
}

describe.each(Object.entries(PHOTOS))("photo %s", (_name, photo) => {
  const bytes = bytesOf(photo.src);

  it("is exactly the approved file (SHA-256)", () => {
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(photo.sha256);
  });

  it("carries no metadata: no EXIF, XMP, ICC profile or comments", () => {
    expect(scanJpeg(bytes).metadata).toEqual([]);
  });

  it("has the size the page declares", () => {
    const { width, height } = scanJpeg(bytes);
    expect({ width, height }).toEqual({ width: photo.width, height: photo.height });
  });

  it("has a metadata-free blurred preview", () => {
    const preview = Buffer.from(photo.blur.replace("data:image/jpeg;base64,", ""), "base64");
    expect(scanJpeg(preview).metadata).toEqual([]);
  });

  it("has a real description for screen readers", () => {
    expect(photo.alt.length).toBeGreaterThan(20);
    expect(photo.alt).not.toMatch(/^(image|photo|picture) of/i);
  });
});

describe("the metadata check itself", () => {
  it("spots an EXIF section added to a clean file", () => {
    const clean = bytesOf(Object.values(PHOTOS)[0].src);
    const exif = Buffer.from([0xff, 0xe1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00]);
    const tainted = Buffer.concat([clean.subarray(0, 2), exif, clean.subarray(2)]);
    expect(scanJpeg(tainted).metadata).toEqual(["0xFFE1"]);
  });
});
