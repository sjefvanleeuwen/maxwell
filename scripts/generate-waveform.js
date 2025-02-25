import { createCanvas } from 'canvas';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 24;

async function generateWaveform(audioBuffer, outputPath) {
    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const ctx = canvas.getContext('2d');
    
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / CANVAS_WIDTH);
    const amp = CANVAS_HEIGHT / 2;

    ctx.fillStyle = '#666';
    
    for(let i = 0; i < CANVAS_WIDTH; i++) {
        let min = 1.0;
        let max = -1.0;
        
        for(let j = 0; j < step; j++) {
            const datum = data[(i * step) + j];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }
        
        ctx.fillRect(i, (1 + min) * amp, 1, (max - min) * amp);
    }

    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(outputPath, buffer);
}

async function convertToWav(inputPath) {
    const tempPath = inputPath.replace(/\.[^.]+$/, '.wav');
    
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat('wav')
            .on('error', reject)
            .on('end', () => resolve(tempPath))
            .save(tempPath);
    });
}

async function processAudioFiles() {
    const audioDir = path.join(__dirname, '../audio');
    const waveformDir = path.join(__dirname, '../waveforms');

    // Create waveforms directory if it doesn't exist
    if (!existsSync(waveformDir)) {
        await fs.mkdir(waveformDir, { recursive: true });
    }

    const files = await fs.readdir(audioDir);
    
    for (const file of files) {
        if (file.match(/\.(mp3|m4a|wav)$/i)) {
            const waveformPath = path.join(waveformDir, `${path.parse(file).name}.png`);
            
            // Skip if waveform already exists
            if (existsSync(waveformPath)) {
                console.log(`Skipping ${file} - waveform already exists`);
                continue;
            }

            console.log(`Processing ${file}...`);
            const audioPath = path.join(audioDir, file);
            
            try {
                let processPath = audioPath;
                if (file.toLowerCase().endsWith('.m4a')) {
                    console.log('Converting m4a to wav...');
                    processPath = await convertToWav(audioPath);
                }

                const audioData = await fs.readFile(processPath);
                const audioDecode = (await import('audio-decode')).default;
                const audioBuffer = await audioDecode(audioData);
                
                await generateWaveform(audioBuffer, waveformPath);
                console.log(`Generated waveform for ${file}`);

                // Clean up temporary wav file if we created one
                if (processPath !== audioPath) {
                    await fs.unlink(processPath);
                }
            } catch (error) {
                console.error(`Error processing ${file}:`, error);
            }
        }
    }
}

processAudioFiles().catch(console.error);