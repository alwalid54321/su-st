
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const directory = 'public/images';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')) {
                results.push(file);
            }
        }
    });
    return results;
}

async function convertToWebp() {
    const files = walk(directory);
    console.log(`Found ${files.length} images to convert.`);

    for (const file of files) {
        const webpFile = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        try {
            await sharp(file)
                .webp({ quality: 80 })
                .toFile(webpFile);
            console.log(`Converted: ${path.basename(file)} -> ${path.basename(webpFile)}`);
            // Optionally remove the original file, but let's keep it for safety during this task
            // fs.unlinkSync(file); 
        } catch (err) {
            console.error(`Failed to convert ${file}:`, err);
        }
    }
}

convertToWebp();
