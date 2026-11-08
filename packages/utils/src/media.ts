/**
 * Strips EXIF metadata (APP1 marker 0xFFE1) from JPEG ArrayBuffer or Uint8Array.
 * Complies with AGENTS.md §16: "Strip image EXIF/GPS metadata before public delivery".
 */
export function stripJpegExif(bytes: Uint8Array): Uint8Array {
  // Check JPEG SOI marker (0xFFD8)
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return bytes; // Not a JPEG, return as-is
  }

  const result: number[] = [0xff, 0xd8];
  let offset = 2;

  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) {
      // Stream is corrupted or reached image scan data; copy remainder
      for (let i = offset; i < bytes.length; i++) {
        result.push(bytes[i]);
      }
      break;
    }

    const marker = bytes[offset + 1];

    // SOS (Start of Scan - 0xDA) or EOI (End of Image - 0xD9)
    if (marker === 0xda || marker === 0xd9) {
      for (let i = offset; i < bytes.length; i++) {
        result.push(bytes[i]);
      }
      break;
    }

    // Segment length is a 16-bit big-endian integer
    const length = (bytes[offset + 2] << 8) + bytes[offset + 3];

    // Marker 0xE1 is APP1 (EXIF / GPS metadata)
    // Marker 0xE2 is sometimes APP2 (FlashPix / extended metadata)
    if (marker === 0xe1) {
      // Skip this EXIF segment
      offset += 2 + length;
    } else {
      // Keep other segments (like quantization tables 0xDB, SOF 0xC0, Huffman tables 0xC4)
      for (let i = offset; i < offset + 2 + length; i++) {
        result.push(bytes[i]);
      }
      offset += 2 + length;
    }
  }

  return new Uint8Array(result);
}
