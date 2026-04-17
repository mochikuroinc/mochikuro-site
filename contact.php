<?php
/**
 * mochikuro.com お問い合わせフォーム受付スクリプト
 *
 * Xサーバー PHP8.x 環境で動作確認
 * ※ 必ず $TO_EMAIL を実際の受信先アドレスに変更してください
 */

// ============================================================
// 設定
// ============================================================
$TO_EMAIL   = 'info@mochikuro.com';           // 受信先メール（★要変更）
$FROM_EMAIL = 'noreply@mochikuro.com';         // 送信元メール
$SITE_NAME  = '株式会社mochikuro';

// ============================================================
// CORS / Response ヘッダー
// ============================================================
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

// POST以外は拒否
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'message' => 'POST メソッドのみ対応しています'], JSON_UNESCAPED_UNICODE);
  exit;
}

// ============================================================
// 入力バリデーション
// ============================================================
function input($key, $default = '') {
  return isset($_POST[$key]) ? trim($_POST[$key]) : $default;
}

// honeypot: ボット対策（hidden fieldに値が入っていたらbotとして無視）
if (!empty($_POST['website'])) {
  echo json_encode(['ok' => true]); // 成功装って黙って捨てる
  exit;
}

$type    = input('type');
$company = input('company');
$name    = input('name');
$email   = input('email');
$phone   = input('phone');
$subject = input('subject');
$message = input('message');

// 必須チェック
$errors = [];
if ($type === '') $errors[] = 'お問い合わせ種別を選択してください';
if ($name === '') $errors[] = 'お名前を入力してください';
if ($email === '') $errors[] = 'メールアドレスを入力してください';
elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'メールアドレスの形式が不正です';
if ($subject === '') $errors[] = '件名を入力してください';
if ($message === '') $errors[] = 'お問い合わせ内容を入力してください';

// 長さチェック
if (mb_strlen($name) > 100) $errors[] = 'お名前が長すぎます';
if (mb_strlen($subject) > 200) $errors[] = '件名が長すぎます';
if (mb_strlen($message) > 4000) $errors[] = 'お問い合わせ内容が長すぎます';

if (!empty($errors)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'message' => implode(' / ', $errors)], JSON_UNESCAPED_UNICODE);
  exit;
}

// 改行コード注入対策
foreach ([$name, $email, $subject] as $field) {
  if (preg_match('/[\r\n]/', $field)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => '不正な入力が含まれています'], JSON_UNESCAPED_UNICODE);
    exit;
  }
}

// ============================================================
// 種別ラベル
// ============================================================
$typeLabels = [
  'agency'    => '代理店として申込',
  'owner'     => 'オーナー企業として申込',
  'ai-dx'     => 'AI・DX相談',
  'community' => 'コミュニティ参加',
  'other'     => 'その他'
];
$typeLabel = isset($typeLabels[$type]) ? $typeLabels[$type] : $type;

// ============================================================
// メール本文生成
// ============================================================
$adminBody  = "━━━━━━━━━━━━━━━━━━━━━━━━\n";
$adminBody .= "【{$SITE_NAME} お問い合わせ】\n";
$adminBody .= "━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$adminBody .= "■ 種別: {$typeLabel}\n";
$adminBody .= "■ 会社名: {$company}\n";
$adminBody .= "■ お名前: {$name}\n";
$adminBody .= "■ メール: {$email}\n";
$adminBody .= "■ 電話: {$phone}\n";
$adminBody .= "■ 件名: {$subject}\n\n";
$adminBody .= "--- お問い合わせ内容 ---\n";
$adminBody .= "{$message}\n\n";
$adminBody .= "--- メタ情報 ---\n";
$adminBody .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? '') . "\n";
$adminBody .= "UA: " . ($_SERVER['HTTP_USER_AGENT'] ?? '') . "\n";
$adminBody .= "受信日時: " . date('Y-m-d H:i:s') . "\n";

$adminSubject = "[お問い合わせ/{$typeLabel}] {$subject}";

$userBody  = "{$name} 様\n\n";
$userBody .= "この度は {$SITE_NAME} へお問い合わせいただき、誠にありがとうございます。\n";
$userBody .= "以下の内容でお問い合わせを受け付けました。\n";
$userBody .= "2営業日以内にご返信いたしますので、今しばらくお待ちください。\n\n";
$userBody .= "━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$userBody .= "■ 種別: {$typeLabel}\n";
$userBody .= "■ 件名: {$subject}\n\n";
$userBody .= "--- お問い合わせ内容 ---\n";
$userBody .= "{$message}\n\n";
$userBody .= "━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$userBody .= "※ 本メールは自動送信です。このアドレスへ返信はできません。\n";
$userBody .= "※ お急ぎの場合は、改めてお問い合わせフォームよりご連絡ください。\n\n";
$userBody .= "----------------------------------------\n";
$userBody .= "{$SITE_NAME}\n";
$userBody .= "https://mochikuro.com/\n";

$userSubject = "[{$SITE_NAME}] お問い合わせありがとうございます";

// ============================================================
// メール送信（日本語対応）
// ============================================================
mb_language('ja');
mb_internal_encoding('UTF-8');

// 管理者宛
$adminHeaders  = "From: {$SITE_NAME} <{$FROM_EMAIL}>\r\n";
$adminHeaders .= "Reply-To: {$name} <{$email}>\r\n";
$adminHeaders .= "X-Mailer: PHP/" . phpversion();

$sentAdmin = mb_send_mail($TO_EMAIL, $adminSubject, $adminBody, $adminHeaders);

// ユーザー宛（自動返信）
$userHeaders  = "From: {$SITE_NAME} <{$FROM_EMAIL}>\r\n";
$userHeaders .= "X-Mailer: PHP/" . phpversion();

$sentUser = mb_send_mail($email, $userSubject, $userBody, $userHeaders);

if (!$sentAdmin) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'message' => 'メール送信に失敗しました。時間をおいて再度お試しください'], JSON_UNESCAPED_UNICODE);
  exit;
}

// 成功
echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
