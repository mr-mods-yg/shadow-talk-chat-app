import pako from "pako";

// Example: Compress string message to Uint8Array
function compressMessage(message) {
  const compressed = pako.deflate(message, { level: 9 }); // max compression
  return compressed;
}

// Decompress Uint8Array back to string
function decompressMessage(compressed) {
    const decompressed = pako.inflate(compressed, { to: 'string' });
    return decompressed;
}
export {compressMessage, decompressMessage};