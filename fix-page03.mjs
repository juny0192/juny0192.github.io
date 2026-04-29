import { createCanvas, loadImage } from 'canvas';
import { writeFileSync } from 'fs';

const imgPath = 'C:\\Projects\\jun-jung-portfolio\\images\\page-03.jpg';
const img = await loadImage(imgPath);
const W = img.width, H = img.height;

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');
ctx.drawImage(img, 0, 0);

// Paint over phone number at y=676-690, x=1584-1720
// Background color is ~(244,244,242)
ctx.fillStyle = 'rgb(244,244,242)';
ctx.fillRect(1584, 672, 140, 22);

// Save
const buf = canvas.toBuffer('image/jpeg', { quality: 0.92 });
writeFileSync(imgPath, buf);
console.log('Phone number removed from page-03.jpg');
