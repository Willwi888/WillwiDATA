# Supabase 設定指南

本指南將協助您設定 Supabase 資料庫以使用 WillwiDATA 應用程式。

## 前置需求

- Supabase 帳號 (可在 https://supabase.com 免費註冊)
- 已建立的 Supabase 專案

## 步驟 1：建立 Supabase 專案

如果您還沒有 Supabase 專案：

1. 前往 https://supabase.com
2. 登入您的帳號
3. 點擊「New Project」建立新專案
4. 填寫專案資訊：
   - Name: `WillwiDATA` (或您喜歡的名稱)
   - Database Password: 設定一個強密碼
   - Region: 選擇離您最近的區域
5. 等待專案建立完成（約 2 分鐘）

## 步驟 2：執行資料庫遷移腳本

1. 在 Supabase Dashboard 中，選擇您的專案
2. 點擊左側選單的「SQL Editor」
3. 點擊「New Query」建立新查詢
4. 複製 `supabase/migrations/001_initial_schema.sql` 檔案的完整內容
5. 貼上到 SQL 編輯器中
6. 點擊「Run」執行腳本
7. 確認執行成功（應該會看到綠色的成功訊息）

## 步驟 3：驗證資料表建立

1. 在 Supabase Dashboard 中，點擊左側選單的「Table Editor」
2. 您應該會看到以下三個表格：
   - `songs` - 儲存歌曲資料
   - `users` - 儲存使用者資料
   - `transactions` - 儲存交易記錄

## 步驟 4：取得 API 金鑰

1. 在 Supabase Dashboard 中，點擊左側選單的「Settings」
2. 點擊「API」
3. 找到以下資訊：
   - **Project URL**: 您的 Supabase 專案 URL
   - **anon public**: 您的匿名公開金鑰（Anon Key）

## 步驟 5：設定環境變數

1. 複製專案根目錄中的 `.env.local.example` 檔案
2. 重新命名為 `.env.local`
3. 填入您的實際金鑰：

```bash
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

**注意**：`.env.local` 檔案已被加入 `.gitignore`，不會被提交到 Git。

## 步驟 6：測試連線

1. 啟動開發伺服器：
   ```bash
   npm run dev
   ```

2. 開啟瀏覽器，前往 `http://localhost:3000`

3. 測試功能：
   - 新增一首歌曲
   - 檢查 Supabase Dashboard 中的 `songs` 表格是否有新資料
   - 嘗試更新或刪除歌曲

## 步驟 7：（可選）設定 Row Level Security (RLS)

我們的遷移腳本已經啟用了 RLS 並設定了基本的策略。您可以根據需求調整策略：

1. 在 Supabase Dashboard 中，前往「Authentication」> 「Policies」
2. 選擇 `songs`、`users` 或 `transactions` 表格
3. 檢視或編輯現有策略

### 目前的策略

- **songs**: 所有人可讀取，認證使用者可以新增/更新/刪除
- **users**: 所有人可讀取自己的資料，可以新增和更新
- **transactions**: 所有人可讀取，認證使用者可以新增

## 步驟 8：匯入現有資料（可選）

如果您有從 IndexedDB 匯出的資料：

1. 在應用程式中，前往「資料管理」頁面
2. 點擊「匯入資料」
3. 選擇您的 JSON 檔案
4. 資料將會自動上傳到 Supabase

## 疑難排解

### 無法連線到 Supabase

- 檢查 `.env.local` 檔案中的 URL 和金鑰是否正確
- 確認您的網路連線正常
- 檢查瀏覽器控制台是否有錯誤訊息

### 資料沒有同步

- 檢查 Supabase Dashboard 中的「Logs」查看錯誤
- 確認 RLS 策略沒有阻止操作
- 嘗試重新整理頁面

### 資料庫錯誤

- 確認 SQL 遷移腳本執行成功
- 檢查表格結構是否與預期一致
- 查看 Supabase Dashboard 的「Logs」分頁

## 即時同步功能

應用程式已啟用 Supabase Realtime，當其他裝置或使用者更新資料時，您的畫面會自動更新。

### 測試即時同步

1. 在兩個不同的瀏覽器視窗開啟應用程式
2. 在一個視窗中新增歌曲
3. 另一個視窗應該會自動顯示新歌曲

## 安全性建議

1. **不要分享您的 API 金鑰**：`.env.local` 檔案應該保密
2. **使用環境變數**：不要在程式碼中硬編碼金鑰
3. **定期備份**：使用 Supabase Dashboard 的「Database」>「Backups」功能
4. **監控使用量**：定期檢查「Settings」>「Usage」確保在免費額度內

## 生產環境部署

當您準備部署到生產環境時：

1. 在部署平台（如 Vercel、Netlify）設定環境變數
2. 確認所有環境變數都已正確設定
3. 考慮設定更嚴格的 RLS 策略
4. 啟用 Supabase 的備份功能

## 支援

如果您遇到問題：

- 查看 Supabase 官方文件：https://supabase.com/docs
- 查看專案的 README.md
- 在 GitHub Issues 中回報問題

## 相關資源

- [Supabase 文件](https://supabase.com/docs)
- [Supabase JavaScript 客戶端](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security 指南](https://supabase.com/docs/guides/auth/row-level-security)
