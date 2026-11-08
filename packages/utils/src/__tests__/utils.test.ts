import { describe, it, expect } from 'vitest';
import { slugify, sanitizeInput, fuzzifyCoordinates } from '../format.js';
import { stripJpegExif } from '../media.js';

describe('Format and Privacy Utilities', () => {
  it('slugify should normalize titles into url-safe slugs', () => {
    expect(slugify('KINNIPAW Rescue Case #101')).toBe('kinnipaw-rescue-case-101');
    expect(slugify('  Dhaka Stray Cat Care  ')).toBe('dhaka-stray-cat-care');
  });

  it('sanitizeInput should strip HTML tags', () => {
    expect(sanitizeInput('<script>alert("xss")</script>Hello Animal Guardian')).toBe('Hello Animal Guardian');
    expect(sanitizeInput('<b>Bold Name</b>')).toBe('Bold Name');
  });

  it('fuzzifyCoordinates should coarsen location to ~2 decimal places for privacy', () => {
    // Exact location: 23.810332, 90.412518 (Dhaka)
    const exactLat = 23.810332;
    const exactLng = 90.412518;
    const fuzzed = fuzzifyCoordinates(exactLat, exactLng);

    expect(fuzzed.lat).toBe(23.81);
    expect(fuzzed.lng).toBe(90.41);
    // Never expose raw 6-decimal micro-coordinates
    expect(fuzzed.lat).not.toBe(exactLat);
    expect(fuzzed.lng).not.toBe(exactLng);
  });
});

describe('Media Privacy: EXIF Stripping', () => {
  it('stripJpegExif should strip APP1 EXIF segment while preserving SOI and SOS', () => {
    // Construct a synthetic JPEG with:
    // SOI: 0xFF, 0xD8
    // APP1 (EXIF): 0xFF, 0xE1, Length: 0x00, 0x06, 'E', 'X', 'I', 'F'
    // SOS: 0xFF, 0xDA, 0x00, 0x02, (Scan data...)
    const syntheticJpeg = new Uint8Array([
      0xff, 0xd8, // SOI
      0xff, 0xe1, 0x00, 0x06, 0x45, 0x58, 0x49, 0x46, // APP1 marker + 6 bytes payload
      0xff, 0xda, 0x00, 0x02, 0xaa, 0xbb, 0xcc, // SOS + scan data
    ]);

    const stripped = stripJpegExif(syntheticJpeg);

    // Stripped length should be SOI (2) + SOS block (7) = 9 bytes
    expect(stripped.length).toBe(9);
    expect(stripped[0]).toBe(0xff);
    expect(stripped[1]).toBe(0xd8); // SOI preserved
    expect(stripped[2]).toBe(0xff);
    expect(stripped[3]).toBe(0xda); // SOS directly follows SOI (APP1 stripped)
  });

  it('stripJpegExif should return non-JPEG bytes intact', () => {
    const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const result = stripJpegExif(pngHeader);
    expect(result).toEqual(pngHeader);
  });
});
