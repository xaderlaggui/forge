const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const mapping = {
  39: 'blaze-double-flex',
  40: 'ignite-fists-roar',
  41: 'dasher-cycling',
  42: 'forge-pointing',
  43: 'titan-thumbsup',
  44: 'grizzly-arms-crossed',
  45: 'summit-podium',
  46: 'highfive-duo',
  47: 'rocket-sprint',
  48: 'scaler-climbing',
  49: 'shredder-kickflip',
  50: 'surfer-wave',
  51: 'knockout-hook',
  52: 'ace-tennis',
  53: 'striker-flyingkick',
  54: 'spiker-volleyball',
  55: 'deadlift-row',
  56: 'presser-overhead',
  57: 'curl-bicep',
  58: 'puller-pullup',
  59: 'cable-row',
  60: 'ironback-barbell',
  61: 'goalkeeper-dive',
  62: 'slugger-baseball',
  63: 'crusher-freekick',
  64: 'eagle-archery',
  65: 'quarterback-throw',
  66: 'slapshot-hockey',
  67: 'netmaster-spike',
  68: 'swinger-golf',
  69: 'snowcrusher-ski',
  70: 'wakemaster-board',
  71: 'diver-scuba',
  72: 'rower-machine',
  73: 'squatter-barbell',
  74: 'romanian-deadlift',
  75: 'legpress-machine',
  76: 'lunger-dumbbells',
  77: 'warrior-yoga',
  78: 'handstand-pushup',
  79: 'cage-maxsquat',
  80: 'judoka-throw',
  81: 'rugby-charge',
  82: 'homerun-swing',
  83: 'iceman-hockey',
  84: 'guardian-save',
  85: 'champ-victory',
  86: 'doublepoint-callout'
};

const sourceDir = path.join(__dirname, 'assets', 'images', 'mascot');
const targetDir = path.join(__dirname, 'assets', 'sprites', 'forge-bear');

function findFilesRecursive(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFilesRecursive(filePath, fileList);
    } else if (file.endsWith('.png')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function processSprites() {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const allPngs = findFilesRecursive(sourceDir);
  console.log(`Found ${allPngs.length} total PNGs in source directory.`);

  for (const [id, newName] of Object.entries(mapping)) {
    const filename = `${id}.png`;
    const sourcePath = allPngs.find(p => path.basename(p) === filename);
    
    if (!sourcePath) {
      console.error(`Missing file: ${filename}`);
      continue;
    }

    try {
      const metadata = await sharp(sourcePath).metadata();
      // Assume the original image is the @3x size or close to it
      // Let's cap max width/height to 600px for @3x, 400 for @2x, 200 for 1x
      let baseWidth = metadata.width;
      if (baseWidth > 600) baseWidth = 600; // Just in case they are massive
      
      const w3x = baseWidth;
      const w2x = Math.round(baseWidth * 0.66);
      const w1x = Math.round(baseWidth * 0.33);

      const targetPath1x = path.join(targetDir, `${newName}.png`);
      const targetPath2x = path.join(targetDir, `${newName}@2x.png`);
      const targetPath3x = path.join(targetDir, `${newName}@3x.png`);

      await sharp(sourcePath).resize(w3x).png({ quality: 80, compressionLevel: 9 }).toFile(targetPath3x);
      await sharp(sourcePath).resize(w2x).png({ quality: 80, compressionLevel: 9 }).toFile(targetPath2x);
      await sharp(sourcePath).resize(w1x).png({ quality: 80, compressionLevel: 9 }).toFile(targetPath1x);
      
      console.log(`Processed ${filename} -> ${newName} (1x, 2x, 3x)`);
    } catch (e) {
      console.error(`Error processing ${filename}:`, e);
    }
  }
}

processSprites().then(() => console.log('Done!'));
