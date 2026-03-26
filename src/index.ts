import { ImageAnnotatorClient } from '@google-cloud/vision';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; // Файл уншихад хэрэгтэй

// 1. ES Module орчинд __dirname-ийг тодорхойлох (Node.js стандарт)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new ImageAnnotatorClient();

/**
 * Лабораторийн даалгавар: 
 * Дээрх функцийг async/await болон try/catch ашиглан хэрэгжүүлсэн хувилбар.
 */
async function mainAsync(fileNames: string[]): Promise<void> {
    for (const fileName of fileNames) {
        console.log(`\n--- Running logo detection (Async) on ${fileName} ---`);
        try {
            // Файлыг Buffer болгож унших
            const fileContent = fs.readFileSync(fileName);
            
            // Vision API-аас хариу авах
            const [result] = await client.logoDetection({ image: { content: fileContent } });
            
            const logos = result.logoAnnotations;

            // Хэрэв лого олдоогүй бол
            if (!logos || logos.length === 0) {
                console.log(`No logos found in ${fileName}`);
                continue; 
            }

            let scores: number[] = [];
            console.log(`Found ${logos.length} logo(s) in ${fileName}:`);

            // Лого бүрийг хэвлэх
            logos.forEach((logo) => {
                if (logo.description) {
                    console.log(` - "${logo.description}" found (Score: ${logo.score})`);
                }
                if (logo.score) {
                    scores.push(logo.score);
                }
            });

            // Дундаж оноог тооцоолох
            if (scores.length > 0) {
                const sum = scores.reduce((a, b) => a + b, 0);
                const avg = sum / scores.length;
                console.log(`Average score for ${fileName}: ${avg.toFixed(4)}`);
            }

        } catch (err: any) {
            // Файл олдохгүй эсвэл бусад алдааг барих
            if (err.code === 'ENOENT') {
                console.log(`File ${fileName} not found. Please check the path.`);
            } else {
                console.error(`Error processing ${fileName}:`, err.message);
            }
        }
    }
}
// 2. Файлуудын замыг үнэмлэхүй замаар (Absolute path) тодорхойлох
// process.cwd() нь терминал дээр байгаа одоогийн хавтсыг (s2025-lab09) заана
// Хавтасны нэрийг "Images" (Том үсгээр) болгож засав
const files = [
    path.join(process.cwd(), 'Images/cmu.jpg'), 
    path.join(process.cwd(), 'Images/logo-types-collection.jpg'), 
    path.join(process.cwd(), 'Images/not-a-file.jpg')
];

// 3. Програмыг ажиллуулах
mainAsync(files).then(() => {
    console.log('\n--- Бүх файлуудыг боловсруулж дууслаа ---');
}).catch(err => {
    console.error('Fatal Error:', err);
});