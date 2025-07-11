const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// 替換生成圖標的函數，使用提供的自定義圖像
function generateIcons(customImagePath) {
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  const outputDir = path.join(__dirname, "public/icons");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  sizes.forEach((size) => {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    sharp(customImagePath)
      .resize(size, size)
      .toFile(outputPath, (err) => {
        if (err) {
          console.error(`Error generating icon of size ${size}:`, err);
        } else {
          console.log(`Generated icon: ${outputPath}`);
        }
      });
  });
}

// 使用提供的圖像生成圖標
const customImagePath = path.join(__dirname, "yo-icon.png");
generateIcons(customImagePath);

console.log("\n✅ 所有圖標已生成完成！");
console.log("\n📝 接下來步驟：");
console.log("1. 將 SVG 檔案轉換為 PNG（可使用線上工具如 convertio.co）");
console.log("2. 或者使用瀏覽器開啟 generate-icons.html 直接下載 PNG 檔案");
console.log("3. 將新圖標檔案替換到 public/icons/ 資料夾");
