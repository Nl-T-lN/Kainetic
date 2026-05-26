export function getVibrantColorFromImage(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject("Canvas not supported");
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0;
        let count = 0;

        for (let i = 0; i < imageData.length; i += 4 * 10) { // Sample every 10th pixel for speed
          r += imageData[i];
          g += imageData[i + 1];
          b += imageData[i + 2];
          count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        // Enhance vibrancy
        let brightness = (r * 299 + g * 587 + b * 114) / 1000;
        // In dark mode, if it's too dark, lighten it
        while (brightness < 80) {
            r = Math.min(255, Math.max(r + 1, Math.floor(r * 1.15)));
            g = Math.min(255, Math.max(g + 1, Math.floor(g * 1.15)));
            b = Math.min(255, Math.max(b + 1, Math.floor(b * 1.15)));
            brightness = (r * 299 + g * 587 + b * 114) / 1000;
            if (r >= 255 && g >= 255 && b >= 255) break;
        }

        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        resolve(hex);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}
