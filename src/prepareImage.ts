import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** Downscale the photo so the upload is fast; Claude doesn't need full resolution. */
export async function toBase64Jpeg(uri: string): Promise<string> {
  const ref = await ImageManipulator.manipulate(uri).resize({ width: 1024 }).renderAsync();
  const out = await ref.saveAsync({ base64: true, compress: 0.7, format: SaveFormat.JPEG });
  if (!out.base64) throw new Error('Could not read the photo.');
  return out.base64;
}
