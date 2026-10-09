// Display derivatives only; original artwork is kept intact for sharing and downloads.
export const responsiveImages = {
  "/images/baad-menni-wa-menk-cover.jpg": {
    "width": 902,
    "variants": [
      {
        "src": "/images/baad-menni-wa-menk-cover-480.webp",
        "width": 480
      }
    ]
  },
  "/images/articles/al-hob-wahdahu-la-yakfi.jpg": {
    "width": 1280,
    "variants": [
      {
        "src": "/images/articles/al-hob-wahdahu-la-yakfi-480.webp",
        "width": 480
      },
      {
        "src": "/images/articles/al-hob-wahdahu-la-yakfi-768.webp",
        "width": 768
      }
    ]
  },
  "/images/articles/al-fadfada.jpg": {
    "width": 1280,
    "variants": [
      {
        "src": "/images/articles/al-fadfada-480.webp",
        "width": 480
      },
      {
        "src": "/images/articles/al-fadfada-768.webp",
        "width": 768
      }
    ]
  },
  "/images/articles/al-nakhl-la-yastaajil-al-balah.jpg": {
    "width": 1280,
    "variants": [
      {
        "src": "/images/articles/al-nakhl-la-yastaajil-al-balah-480.webp",
        "width": 480
      },
      {
        "src": "/images/articles/al-nakhl-la-yastaajil-al-balah-768.webp",
        "width": 768
      }
    ]
  }
};

export const imageVariants = Object.values(responsiveImages).flatMap(image => image.variants.map(variant => variant.src));
export function responsiveAttributes(src, sizes, escape) {
  const image = responsiveImages[src];
  if (!image) return "";
  const srcset = [...image.variants.map(variant => `${variant.src} ${variant.width}w`), `${src} ${image.width}w`].join(", ");
  return `srcset="${escape(srcset)}" sizes="${escape(sizes)}"`;
}
