/** Object URLs belong to the preview session, and are never upload tickets. */
const urls = new Set<string>();
export function previewUrl(file: File) {
  const url = URL.createObjectURL(file);
  urls.add(url);
  return url;
}
export function releaseUrl(url: string) {
  if (urls.delete(url)) URL.revokeObjectURL(url);
}
export function clearUrls() {
  for (const url of urls) URL.revokeObjectURL(url);
  urls.clear();
}
window.addEventListener("beforeunload", clearUrls);
