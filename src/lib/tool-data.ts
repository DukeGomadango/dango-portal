/** 4つのだんごツールファミリーの定義データ（型安全） */

export type DangoToolColor = "green" | "pink" | "yellow" | "purple";

export interface DangoTool {
  /** ツールID */
  id: string;
  /** ツール名 */
  name: string;
  /** ツール名（英語） */
  nameEn: string;
  /** 一言キャッチコピー */
  tagline: string;
  /** 詳細説明 */
  description: string;
  /** 主要機能リスト */
  features: string[];
  /** アクセントカラー */
  color: DangoToolColor;
  /** 外部URL（デプロイ先） */
  url: string;
}

export const DANGO_TOOLS: readonly DangoTool[] = [
  {
    id: "counter",
    name: "だんごツール",
    nameEn: "Dango Counter",
    tagline: "あなたの配信を、もっと面白く、もっと直感的に。",
    description:
      "完全無料で登録不要。人数カウンターやリアルタイム計算チャート、ガチャシミュレーターなど、配信を盛り上げ活動を便利にする「配信者・クリエイター向けWebツールキット」です。",
    features: [
      "ワンタップカウント操作",
      "OBSブラウザソース対応",
      "QRコード共有",
      "カスタムテーマ",
    ],
    color: "green",
    url: "https://dango-tool.vercel.app/",
  },
  {
    id: "calendar",
    name: "だんごスケジュール",
    nameEn: "Dango Schedule",
    tagline: "配信スケジュールとランク指標を、スマートに一元管理。",
    description:
      "IRIAMライバー向けの非公式ランク管理・スケジュールツール。デイリーランクの目標・実績、ボーダー、スキップパスを日別に記録し、カレンダーとデータ表で一元管理できます。",
    features: [
      "ランクイベント自動追跡",
      "配信枠ビジュアル管理",
      "リスナー共有リンク",
      "OCR自動入力",
    ],
    color: "pink",
    url: "https://dango-schedule.vercel.app/",
  },
  {
    id: "share",
    name: "だんごシェアリンク",
    nameEn: "Dango Share Link",
    tagline: "一人ひとりに、リンク一つで、安全なファイル配布を。",
    description:
      "配信者・クリエイター向けファイル配布プラットフォーム。音声や限定画像などの配信特典・返礼品を、受取人ごとの安全な限定リンクでスマートに配布・管理できます。",
    features: [
      "ドラッグ&ドロップアップロード",
      "パスワード保護",
      "有効期限付きリンク",
      "リッチプレビュー",
    ],
    color: "yellow",
    url: "https://dango-share-link.vercel.app/",
  },
  {
    id: "game",
    name: "だんごかくれんぼ",
    nameEn: "Dango Kakurenbo",
    tagline: "リスナーの偽名を見破れ！配信進行・推理支援ツール。",
    description:
      "配信で大人気の「かくれんぼ企画（リスナー当てゲーム）」をサポート。リスナーの偽名・質問の回答・本名予想をリアルタイムで整理し、配信しながら楽しく推理を進められます。",
    features: [
      "リアルタイムマルチプレイ",
      "配信画面連動",
      "カスタムマップ",
      "ランキング機能",
    ],
    color: "purple",
    url: "https://dango-kakurenbo.vercel.app/",
  },
] as const;
