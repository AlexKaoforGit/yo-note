const fs = require("fs");
const path = require("path");

// 創建 SVG 記事本圖標
function createNotepadSVG(size) {
  const padding = size * 0.1;
  const noteWidth = size - padding * 2;
  const noteHeight = size - padding * 2;
  const noteX = padding + noteWidth * 0.15;
  const noteY = padding + noteHeight * 0.1;
  const noteW = noteWidth * 0.7;
  const noteH = noteHeight * 0.8;

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <!-- 背景圓形 -->
        <circle cx="${size / 2}" cy="${size / 2}" r="${
    size / 2 - 2
  }" fill="#2196F3"/>
        
        <!-- 記事本背景 -->
        <rect x="${noteX}" y="${noteY}" width="${noteW}" height="${noteH}" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="1"/>
        
        <!-- 裝訂孔 -->
        <circle cx="${noteX + noteW * 0.15}" cy="${noteY + noteH * 0.25}" r="${
    size * 0.02
  }" fill="#2196F3"/>
        <circle cx="${noteX + noteW * 0.15}" cy="${noteY + noteH * 0.5}" r="${
    size * 0.02
  }" fill="#2196F3"/>
        <circle cx="${noteX + noteW * 0.15}" cy="${noteY + noteH * 0.75}" r="${
    size * 0.02
  }" fill="#2196F3"/>
        
        <!-- 文字線條 -->
        <line x1="${noteX + noteW * 0.25}" y1="${noteY + noteH * 0.3}" x2="${
    noteX + noteW * 0.9
  }" y2="${noteY + noteH * 0.3}" stroke="#E8E8E8" stroke-width="${Math.max(
    1,
    size * 0.005
  )}"/>
        <line x1="${noteX + noteW * 0.25}" y1="${noteY + noteH * 0.45}" x2="${
    noteX + noteW * 0.9
  }" y2="${noteY + noteH * 0.45}" stroke="#E8E8E8" stroke-width="${Math.max(
    1,
    size * 0.005
  )}"/>
        <line x1="${noteX + noteW * 0.25}" y1="${noteY + noteH * 0.6}" x2="${
    noteX + noteW * 0.9
  }" y2="${noteY + noteH * 0.6}" stroke="#E8E8E8" stroke-width="${Math.max(
    1,
    size * 0.005
  )}"/>
        <line x1="${noteX + noteW * 0.25}" y1="${noteY + noteH * 0.75}" x2="${
    noteX + noteW * 0.9
  }" y2="${noteY + noteH * 0.75}" stroke="#E8E8E8" stroke-width="${Math.max(
    1,
    size * 0.005
  )}"/>
        
        <!-- 標題區塊 -->
        <rect x="${noteX + noteW * 0.25}" y="${noteY + noteH * 0.15}" width="${
    noteW * 0.5
  }" height="${size * 0.04}" fill="#4CAF50"/>
        
        <!-- 語音麥克風圖標 -->
        <rect x="${noteX + noteW * 0.75 - size * 0.03}" y="${
    noteY + noteH * 0.25
  }" width="${size * 0.06}" height="${size * 0.09}" rx="${
    size * 0.015
  }" fill="#FF5722"/>
        <path d="M ${noteX + noteW * 0.75 - size * 0.042} ${
    noteY + noteH * 0.39
  } A ${size * 0.035} ${size * 0.035} 0 0 1 ${
    noteX + noteW * 0.75 + size * 0.042
  } ${noteY + noteH * 0.39}" stroke="#FF5722" stroke-width="${Math.max(
    1,
    size * 0.008
  )}" fill="none"/>
        <line x1="${noteX + noteW * 0.75}" y1="${noteY + noteH * 0.43}" x2="${
    noteX + noteW * 0.75
  }" y2="${noteY + noteH * 0.48}" stroke="#FF5722" stroke-width="${Math.max(
    1,
    size * 0.008
  )}"/>
    </svg>`;
}

// 生成所有尺寸的圖標
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log("正在生成記事本主題的圖標...");

sizes.forEach((size) => {
  const svg = createNotepadSVG(size);
  const filename = `notepad-icon-${size}x${size}.svg`;

  fs.writeFileSync(filename, svg);
  console.log(`生成 ${filename}`);
});

console.log("\n✅ 所有圖標已生成完成！");
console.log("\n📝 接下來步驟：");
console.log("1. 將 SVG 檔案轉換為 PNG（可使用線上工具如 convertio.co）");
console.log("2. 或者使用瀏覽器開啟 generate-icons.html 直接下載 PNG 檔案");
console.log("3. 將新圖標檔案替換到 public/icons/ 資料夾");
