# 部署指南

## 🚀 CI/CD 部署修正

### 問題描述

```
npm error ERESOLVE could not resolve
npm error Could not resolve dependency:
npm error peer @angular/platform-browser-dynamic@"^20.0.0" from @angular/fire@20.0.1
```

### 解決方案

#### 1. ✅ 新增缺失的依賴

在 `package.json` 中新增：

```json
"@angular/platform-browser-dynamic": "^20.0.0"
```

#### 2. ✅ 配置 npm 相容性

建立 `.npmrc` 檔案：

```
legacy-peer-deps=true
```

#### 3. ✅ 清理並重新安裝

```bash
rm -rf node_modules package-lock.json
npm install
```

## 🔧 技術說明

### 依賴關係

- `@angular/fire@20.0.1` 需要 `@angular/platform-browser-dynamic`
- 但該套件在原始 `package.json` 中遺漏
- 導致版本解析衝突

### .npmrc 配置

- `legacy-peer-deps=true` 使用舊版相依性解析邏輯
- 解決 Angular 生態系統中常見的 peer dependency 警告
- 確保 CI/CD 環境的穩定性

## 📊 驗證步驟

### 本地驗證

```bash
npm ci          # ✅ 應該成功
npm run build   # ✅ 應該成功
```

### 部署環境

```bash
npm ci --production=false
npm run build
```

## ⚠️ 注意事項

1. **版本鎖定**: `package-lock.json` 現在包含正確的版本解析
2. **CI/CD 快取**: 可能需要清除 npm 快取
3. **Node.js 版本**: 建議使用 Node.js 18.x 或 20.x

## 🐛 常見問題

### Q: 仍然出現 ERESOLVE 錯誤？

A: 確保 `.npmrc` 檔案在專案根目錄中

### Q: 建置成功但應用程式不工作？

A: 檢查瀏覽器控制台是否有錯誤訊息

### Q: 部署後 PWA 功能失效？

A: 確保部署到 HTTPS 環境，PWA 需要安全連線

## 📈 效能最佳化

目前建置大小：

- Initial bundle: ~694KB (警告超過 500KB 預算)
- Lazy chunks: 適當分割

建議：

- 考慮代碼分割最佳化
- 移除未使用的依賴
- 啟用生產模式最佳化
