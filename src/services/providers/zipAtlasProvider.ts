export type ZipAtlasReference = {
  label: string;
  href: string;
};

export function getZipAtlasReference(zip: string): ZipAtlasReference {
  return {
    label: "ZipAtlas public ZIP reference",
    href: `https://zipatlas.com/us/zip-code/${zip}.htm`,
  };
}
