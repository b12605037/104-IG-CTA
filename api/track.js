// Vercel Serverless Function — 代理到 Google Apps Script
//
// 為什麼需要這個檔案：
// 瀏覽器直接 fetch() Google Apps Script 的網址時，Google 回傳的內容
// 沒有附上 CORS 需要的 Access-Control-Allow-Origin 標頭，導致瀏覽器直接擋掉請求
// （這是 Google Workspace 網域（例如 g.ntu.edu.tw）綁定的 Apps Script 常見的限制）。
//
// 解法：讓瀏覽器改成呼叫「自己網站底下」的這支 API（同網域，不會有 CORS 問題），
// 再由這支 API 在伺服器端去呼叫 Google Apps Script（伺服器對伺服器的請求，
// 本來就不受 CORS 限制），拿到資料後回傳給瀏覽器。
//
// 部署方式：
// 把這個檔案連同資料夾結構 api/track.js 一起上傳到你的 GitHub repo
// （跟 index.html 同一個專案），Vercel 會自動偵測 /api 底下的檔案，
// 部署成 serverless function，不用額外設定。

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyuh08HyowSfmnq_zToyILUN_y9b7kMUxB6Tik1MHlIuAoNlfjpwF0gNg977rVnQIrE/exec';

export default async function handler(req, res) {
  const { action, type, button, resultType } = req.query;

  const params = new URLSearchParams();
  if (action) params.set('action', action);
  if (type) params.set('type', type);
  if (button) params.set('button', button);
  if (resultType) params.set('resultType', resultType);

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'proxy failed', message: String(error) });
  }
}
