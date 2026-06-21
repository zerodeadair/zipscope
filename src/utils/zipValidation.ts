export function isValidZip(zip: string) {
  return /^\d{5}$/.test(zip.trim());
}
