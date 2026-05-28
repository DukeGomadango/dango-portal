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
    tagline: "リスナーの熱量を、リアルタイムに可視化。",
    description:
      "配信中の参加人数やイベントカウントをワンタップで管理。OBSオーバーレイ対応で、視聴者にもカウントの盛り上がりをリアルタイムに共有できます。",
    features: [
      "ワンタップカウント操作",
      "OBSブラウザソース対応",
      "QRコード共有",
      "カスタムテーマ",
    ],
    color: "green",
    url: "https://app-live-counter-suite.vercel.app",
  },
  {
    id: "calendar",
    name: "だんごカレンダー",
    nameEn: "Dango Calendar",
    tagline: "配信スケジュールを、もっとスマートに。",
    description:
      "ランク配信のスケジュール管理に特化したカレンダーツール。配信枠の可視化とリスナーへのシェアを、美しいUIで実現します。",
    features: [
      "ランクイベント自動追跡",
      "配信枠ビジュアル管理",
      "リスナー共有リンク",
      "OCR自動入力",
    ],
    color: "pink",
    url: "https://rank-calendar-app.vercel.app",
  },
  {
    id: "share",
    name: "だんごシェアリンク",
    nameEn: "Dango Share Link",
    tagline: "ファイル共有を、安全でかっこよく。",
    description:
      "配信素材やファンアートの共有に最適化されたファイルシェアリングサービス。パスワード保護・期限付きリンクで安全に、美しいプレビューで印象的に。",
    features: [
      "ドラッグ&ドロップアップロード",
      "パスワード保護",
      "有効期限付きリンク",
      "リッチプレビュー",
    ],
    color: "yellow",
    url: "https://share-link-app.vercel.app",
  },
  {
    id: "game",
    name: "だんごかくれんぼ",
    nameEn: "Dango Kakurenbo",
    tagline: "リスナー参加型の、新感覚ミニゲーム。",
    description:
      "配信中にリスナーと一緒に遊べるかくれんぼゲーム。配信画面がそのままゲームフィールドになる、新しいインタラクティブ体験。",
    features: [
      "リアルタイムマルチプレイ",
      "配信画面連動",
      "カスタムマップ",
      "ランキング機能",
    ],
    color: "purple",
    url: "https://dango-kakurenbo.vercel.app",
  },
] as const;
