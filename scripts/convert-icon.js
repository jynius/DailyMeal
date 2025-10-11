#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputSvg = path.join(__dirname, '../frontend/public/icon-512x512.png');
const outputDir = path.join(__dirname, '../app/assets');
const outputPng = path.join(outputDir, 'icon-512x512.png');

// SVG 파일을 PNG로 변환
async function convertSvgToPng() {
  try {
    console.log('📄 Input file:', inputSvg);
    console.log('📁 Output directory:', outputDir);
    
    // 출력 디렉토리가 없으면 생성
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 파일 확인
    if (!fs.existsSync(inputSvg)) {
      console.error('❌ Input file not found:', inputSvg);
      process.exit(1);
    }
    
    // 파일 읽기
    const fileBuffer = fs.readFileSync(inputSvg);
    
    // SVG인지 확인
    const fileContent = fileBuffer.toString('utf8', 0, 100);
    const isSvg = fileContent.includes('<svg') || fileContent.includes('<?xml');
    
    if (isSvg) {
      console.log('✅ Detected SVG file');
      
      // SVG → PNG 변환
      await sharp(fileBuffer)
        .resize(512, 512)
        .png()
        .toFile(outputPng);
      
      console.log('✅ Converted SVG to PNG:', outputPng);
    } else {
      console.log('ℹ️  Already PNG, copying...');
      
      // 이미 PNG인 경우 복사 또는 크기 조정
      await sharp(fileBuffer)
        .resize(512, 512)
        .png()
        .toFile(outputPng);
      
      console.log('✅ Resized and saved PNG:', outputPng);
    }
    
    // 파일 정보 출력
    const stats = fs.statSync(outputPng);
    console.log('📦 File size:', (stats.size / 1024).toFixed(2), 'KB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

convertSvgToPng();
