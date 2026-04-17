# mochikuro.com デプロイ手順

## 📦 ファイル構成

```
mochikuro-site/
├─ index.html              トップページ（城下町マップ）
├─ about.html              会社概要
├─ ceo.html                代表挨拶
├─ ai-dx.html              AI・DX事業
├─ community.html          SHIZUKU Lab
├─ contact.html            お問い合わせフォーム
├─ contact.php             フォーム送信処理（PHP）
├─ privacy.html            プライバシーポリシー
├─ sitemap.xml             サイトマップ
├─ robots.txt              クローラー制御
├─ .htaccess               Xサーバー設定
├─ mochiage-ec/
│   ├─ index.html          モチアゲEC概要
│   ├─ for-agencies.html   代理店募集
│   ├─ for-owners.html     オーナー企業募集
│   └─ faq.html            よくあるご質問
├─ css/
│   └─ style.css           和モダンデザインシステム
├─ js/
│   └─ main.js             遊び心インタラクション全部載せ
└─ assets/
    ├─ cats/
    │   ├─ omochi.svg      白猫おもち
    │   ├─ kuro.svg        黒猫くろ
    │   └─ paw.svg         肉球スタンプ
    └─ patterns/
        └─ seigaiha.svg    青海波パターン
```

## 🚀 Xサーバーへのアップロード手順

### 1. 事前準備
- `contact.php` の **★要変更箇所を書き換える**:
  - `$TO_EMAIL = 'info@mochikuro.com';` を**実際の受信先メールアドレス**に変更
  - `$FROM_EMAIL = 'noreply@mochikuro.com';` を**送信元に使うメールアドレス**に変更
  - Xサーバーのメール設定で `noreply@mochikuro.com` が存在している必要あり（サーバーパネル→メール→メールアカウント設定で作成）

### 2. FTPでアップロード
1. Xサーバーのサーバーパネル → FTP設定 からFTPアカウント情報を取得
2. FileZilla等のFTPクライアントで接続
3. 接続先は `/home/[サーバーID]/mochikuro.com/public_html/`
4. **既存のファイルをバックアップ**（念のため別フォルダに退避）
5. `mochikuro-site/` 配下のファイルを**すべて** `public_html/` にアップロード
   - `.htaccess` を見落とさないよう、隠しファイル表示をONに

### 3. 動作確認チェックリスト
- [ ] `https://mochikuro.com/` でトップページが表示される
- [ ] 各ページへのリンクが機能する（about, ceo, ai-dx, mochiage-ec/, community, contact, privacy）
- [ ] スマホ表示で崩れていない
- [ ] お問い合わせフォームから送信 → 管理者宛・ユーザー宛メールが届く
- [ ] 右下の肉球スタンプラリーが動作する
- [ ] 各ページ訪問でスタンプが増える
- [ ] カーソル追従の猫が表示される（PCのみ）

## 🔧 よくあるトラブル

### お問い合わせメールが届かない
1. Xサーバーのサーバーパネルでメールアカウントを作成
2. `contact.php` の `$FROM_EMAIL` を実在するメールアドレスに
3. ブラウザの開発者ツール → Networkタブで `contact.php` のレスポンスを確認
4. それでもダメなら、Xサーバーの「PHPエラーログ」を確認

### 日本語が文字化けする
- `.htaccess` の `AddDefaultCharset UTF-8` が効いているか確認
- ファイルの文字コードがUTF-8になっているか確認（BOMなし推奨）

### 肉球スタンプラリーが壊れる
- ブラウザのlocalStorageが無効になっていないか確認
- 初期化したい場合はブラウザのコンソールで
  `localStorage.removeItem('mochikuro_stamps_v1')`

## 🎨 カスタマイズポイント

### カラー変更
`css/style.css` 先頭の `:root` 変数を編集

### 代表の写真差し替え
`ceo.html` の「代表写真」と書かれたプレースホルダーを `<img>` に変更

### サービス追加
`index.html` の `.district-grid` に新しい `.district-card` を追加

### 猫のイラスト差し替え
`assets/cats/omochi.svg` と `kuro.svg` を好みのイラストに置き換え
（SVGのviewBoxを 200×200 に合わせれば現レイアウトのまま動作）

## 📞 サポート
ご質問・修正依頼はいつでも遠慮なくどうぞ。
