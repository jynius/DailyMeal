#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 사용법 출력
function printUsage() {
  console.log(`
Usage: node convert-svg-to-png.js <input-file> [output-file] [size]

Arguments:
  input-file   : SVG 또는 PNG 파일 경로 (필수)
  output-file  : 출력 파일 경로 (선택, 기본: 입력 파일 덮어쓰기)
  size         : 출력 크기 (선택, 기본: 원본 크기 유지, 예: 512 또는 512x512)

Examples:
  node convert-svg-to-png.js icon.svg
  node convert-svg-to-png.js icon.svg icon-512.png
  node convert-svg-to-png.js icon.svg icon-512.png 512
  node convert-svg-to-png.js icon.svg icon-wide.png 1024x512
  `);
}

// 크기 파싱 (512 또는 512x512 형식)
function parseSize(sizeArg) {
  if (!sizeArg) return null;
  
  if (sizeArg.includes('x')) {
    const [width, height] = sizeArg.split('x').map(Number);
    return { width, height };
  } else {
    const size = Number(sizeArg);
    return { width: size, height: size };
  }
}

// SVG를 PNG로 변환
async function convertSvgToPng(inputFile, outputFile, size) {
  try {
    // 입력 파일 확인
    if (!fs.existsSync(inputFile)) {
      console.error('❌ Input file not found:', inputFile);
      process.exit(1);
    }
    
    console.log('📄 Input file:', inputFile);
    
    // 파일 읽기
    const fileBuffer = fs.readFileSync(inputFile);
    
    // SVG인지 확인
    const fileContent = fileBuffer.toString('utf8', 0, 100);
    const isSvg = fileContent.includes('<svg') || fileContent.includes('<?xml');
    
    if (isSvg) {
      console.log('✅ Detected SVG file');
    } else {
      console.log('ℹ️  Input is already a raster image (PNG/JPG/etc.)');
    }
    
    // 출력 파일이 입력 파일과 같으면 백업 생성
    if (inputFile === outputFile) {
      const backupFile = inputFile + '.backup';
      fs.copyFileSync(inputFile, backupFile);
      console.log('💾 Backup created:', backupFile);
    }
    
    // 이미지 변환
    let sharpInstance = sharp(fileBuffer);
    
    // 크기 조정
    if (size) {
      console.log(`🔧 Resizing to ${size.width}x${size.height}`);
      sharpInstance = sharpInstance.resize(size.width, size.height, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // 투명 배경
      });
    }
    
    // PNG로 저장
    await sharpInstance
      .png()
      .toFile(outputFile);
    
    // 파일 크기 확인
    const stats = fs.statSync(outputFile);
    const fileSizeKB = (stats.size / 1024).toFixed(2);
    
    console.log('✅ Converted to PNG:', outputFile);
    console.log('📦 File size:', fileSizeKB, 'KB');
    
    // 크기 정보
    const metadata = await sharp(outputFile).metadata();
    console.log(`📐 Dimensions: ${metadata.width}x${metadata.height}`);
    
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

// 메인 실행
async function main() {
  const args = process.argv.slice(2);
  
  // 인자 확인
  if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
    printUsage();
    process.exit(0);
  }
  
  const inputFile = path.resolve(args[0]);
  const outputFile = args[1] ? path.resolve(args[1]) : inputFile;
  const size = parseSize(args[2]);
  
  await convertSvgToPng(inputFile, outputFile, size);
}

main();
