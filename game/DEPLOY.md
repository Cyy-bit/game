# 資訊迷霧：雲端部署說明

這個版本可以部署成公開網址，讓不同 Wi-Fi、手機網路、校外網路的玩家一起進入。

## 推薦平台：Render

Render 可以直接執行 `server.js` 這種 Node 常駐伺服器。這個遊戲需要即時同步，所以不建議部署到只支援純靜態網站的平台。

## 部署前準備

1. 把這個資料夾上傳到 GitHub repository。
2. 確認 repository 裡有這些檔案：
   - `server.js`
   - `host.html`
   - `player.html`
   - `package.json`
   - `render.yaml`

## Render 部署步驟

1. 到 Render 建立新的 Web Service。
2. 連接你的 GitHub repository。
3. Runtime 選 Node。
4. Start Command 使用：

```bash
npm start
```

5. 環境變數新增：

```text
HOST_PIN=你想設定的主持人密碼
```

6. 部署完成後，Render 會給你一個公開網址，例如：

```text
https://your-game-name.onrender.com
```

## 上課時使用

主持人頁：

```text
https://your-game-name.onrender.com/host.html
```

玩家頁：

```text
https://your-game-name.onrender.com/player.html
```

主持人在 `host.html` 輸入 `HOST_PIN` 後，就可以控制流程。玩家不需要密碼。

## 重要限制

這個版本不使用資料庫，遊戲狀態存在伺服器記憶體中。因此：

- 伺服器重新啟動後，遊戲會回到初始狀態。
- 免費雲端服務可能會休眠，第一次開啟可能需要等一下。
- 同一個公開網址同一時間適合跑一場遊戲。

如果之後要同時開很多班級、保存歷史紀錄或固定帳號登入，就需要再加資料庫與房間代碼。
