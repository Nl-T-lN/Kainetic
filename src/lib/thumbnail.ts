export function getHighResThumbnail(thumbnails: any[]): string {
  if (!thumbnails || thumbnails.length === 0) return "";
  
  // Sort by width descending to find the largest available in the array
  const sorted = [...thumbnails].sort((a, b) => (b.width || 0) - (a.width || 0));
  let url = sorted[0].url;

  // Handle Google User Content and YT3 images (Album covers, Artist avatars)
  if (url.includes("googleusercontent.com") || url.includes("yt3.ggpht.com")) {
    // Replace size parameters like =w60-h60 or =w226-h226-l90-rj with =w1200-h1200
    // to get a high quality image without breaking the URL completely
    url = url.replace(/=[ws]\d+(?:-h\d+)?(?:-[a-zA-Z0-9_-]+)*/, "=w1200-h1200");
  } 

  return url;
}
