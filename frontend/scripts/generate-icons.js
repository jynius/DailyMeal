#!/usr/bin/env node

/**
 * PWA 아이콘 생성 스크립트
 * 
 * DailyMeal 로고 아이콘 생성
 * - 192x192px (필수)
 * - 512x512px (필수)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SVG 템플릿: DailyMeal 로고
const createIconSVG = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#3B82F6" rx="${size * 0.1}"/>
  <g transform="translate(${size * 0.15}, ${size * 0.2})">
    <!-- Fork -->
    <rect x="${size * 0.1}" y="${size * 0.05}" width="${size * 0.05}" height="${size * 0.5}" fill="white" rx="${size * 0.01}"/>
    <rect x="${size * 0.05}" y="${size * 0.05}" width="${size * 0.05}" height="${size * 0.2}" fill="white" rx="${size * 0.01}"/>
    <rect x="${size * 0.15}" y="${size * 0.05}" width="${size * 0.05}" height="${size * 0.2}" fill="white" rx="${size * 0.01}"/>
    
    <!-- Spoon -->
    <ellipse cx="${size * 0.55}" cy="${size * 0.15}" rx="${size * 0.06}" ry="${size * 0.08}" fill="white"/>
    <rect x="${size * 0.52}" y="${size * 0.2}" width="${size * 0.06}" height="${size * 0.35}" fill="white" rx="${size * 0.01}"/>
  </g>
  <text x="50%" y="${size * 0.85}" font-family="system-ui, -apple-system, sans-serif" 
        font-size="${size * 0.15}" font-weight="bold" fill="white" 
        text-anchor="middle" dominant-baseline="middle">
    DM
  </text>
</svg>
`;

const publicDir = path.join(__dirname, '..', 'public');

// 192x192 아이콘 생성
const icon192 = createIconSVG(192);
fs.writeFileSync(path.join(publicDir, 'icon-192x192.svg'), icon192.trim());
console.log('✅ icon-192x192.svg 생성 완료');

// 512x512 아이콘 생성
const icon512 = createIconSVG(512);
fs.writeFileSync(path.join(publicDir, 'icon-512x512.svg'), icon512.trim());
console.log('✅ icon-512x512.svg 생성 완료');

// Favicon 생성
const favicon = createIconSVG(32);
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), favicon.trim());
console.log('✅ favicon.svg 생성 완료');

console.log('\n📝 다음 단계:');
console.log('1. SVG를 PNG로 변환하려면:');
console.log('   npm install sharp');
console.log('   node frontend/scripts/convert-icons-to-png.js');
console.log('');
console.log('2. 또는 온라인 도구 사용:');
console.log('   https://cloudconvert.com/svg-to-png');
console.log('');
console.log('3. 임시로 manifest.json에서 SVG 사용 가능');
