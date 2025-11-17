/**
 * Creates a cropped image from a source image and pixel crop data.
 * @param {string} imageSrc - The source image as a data URL or object URL.
 * @param {object} pixelCrop - The pixel crop data from react-easy-crop { x, y, width, height }.
 * @returns {Promise<string>} A promise that resolves with the cropped image as a data URL.
 */
export const getCroppedImg = (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      // Resolve with the cropped image as a data URL
      resolve(canvas.toDataURL("image/jpeg"));
    };
    image.onerror = (error) => reject(error);
  });
};
