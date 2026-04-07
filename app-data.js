const appData = {
    // 【1】 授業・学級 タブのアプリ一覧
    "class-apps": [
        {
            title: "対話が生まれる授業設計GPTs",
            desc: "授業のアイデアを作るツール（質問や活動を考えてくれる）",
            icon: "forum",
            link: "https://chatgpt.com/g/g-6996261b941c819184c29308e1bbaade-dui-hua-kasheng-marerushou-ye-she-ji-gpts",
            isExternal: true
        },
        {
            title: "偉人エピソードリーダー",
            desc: "朝の会などで使える短い話を表示",
            icon: "local_library",
            link: "偉人エピソード集/index.html",
            isExternal: false
        },
        {
            title: "学級トリビア",
            desc: "雑学クイズを出してくれる",
            icon: "lightbulb",
            link: "教室トリビア/index.html",
            isExternal: false
        },
        {
            title: "小学校ジャンプ問題メーカー",
            desc: "少し難しい問題を自動で作る",
            icon: "directions_run",
            link: "ジャンプ問題メーカー/index.html",
            isExternal: false
        },
        {
            title: "今日は何の日？",
            desc: "朝の会や終わりの会での話題に",
            icon: "event",
            link: "今日は何の日/index.html",
            isExternal: false
        },
        {
            title: "ランダムくじ",
            desc: "ボタン1つで当たりを決める",
            icon: "casino",
            link: "ランダムくじ スマホ/index.html",
            isExternal: false
        },
        {
            title: "グループ分け・順番くじ",
            desc: "班分けや発表順を自動で決める",
            icon: "diversity_3",
            link: "グループ分け/index.html",
            isExternal: false
        },
        {
            title: "タイムタイマー",
            desc: "時間をはかる（授業用タイマー）",
            icon: "timer",
            link: "タイムタイマー秒まで/index.html",
            isExternal: false
        },
        {
            title: "ルーレット",
            desc: "回してランダムに選ぶ",
            icon: "cyclone",
            link: "ルーレット スマホサイズ/index.html",
            isExternal: false
        },
        {
            title: "あみだくじ",
            desc: "公平に順番を決める",
            icon: "account_tree",
            link: "あみだくじ/index.html",
            isExternal: false
        },
        {
            title: "一気に順番くじ",
            desc: "一度に全員の順番を決める",
            icon: "format_list_numbered",
            link: "一気に順番くじ/index.html",
            isExternal: false
        },
        {
            title: "サイコロ",
            desc: "デジタルサイコロ1〜3個",
            icon: "view_in_ar",
            link: "サイコロWEBアプリ/index.html",
            isExternal: false
        },
        {
            title: "小テスト作成GPTs",
            desc: "テスト問題を自動で作る",
            icon: "quiz",
            link: "https://chatgpt.com/g/g-69ad069f4e34819183c94ad9b6c134e2-xiao-tesutozuo-cheng-gpt-xiao-zhong-xue-xiao",
            isExternal: true
        },
        {
            title: "がらがら抽選機",
            desc: "ガラガラ抽選みたいに選ぶ",
            icon: "toll",
            link: "ガラガラ抽選機/index.html",
            isExternal: false
        },
        {
            title: "フォルダ自動作成＆ファイルコピー",
            desc: "テキストから複数フォルダを作成し指定ファイルを整理",
            icon: "create_new_folder",
            link: "フォルダ自動生成/index.html",
            isExternal: false
        },
        {
            title: "PDF→JPEG変換アプリ",
            desc: "PDFをJPEGに変換",
            icon: "imagesearch_roller",
            link: "PDF→JPEGコンバーター/index.html",
            isExternal: false
        },
        {
            title: "HEIC写真をJPEG写真へ",
            desc: "iPhoneで撮影したHEICをJPEGに",
            icon: "transform",
            link: "HEIC→JPEG/index.html",
            isExternal: false
        },
        {
            title: "Google専用画像 WEBPファイルをJPEGへ変換",
            desc: "WEBPファイルをJPEGへ変換",
            icon: "collections",
            link: "WEPBをJPEGへ/index.html",
            isExternal: false
        },
        {
            title: "PDFのページを自由に削除、反転、並び替え",
            desc: "PDFのページを自由に編集",
            icon: "picture_as_pdf",
            link: "PDFスタジオ/index.html",
            isExternal: false
        },
        {
            title: "九九アプリ",
            desc: "九九の練習・確認に",
            icon: "calculate",
            link: "九九アプリ/index.html",
            isExternal: false
        },
        {
            title: "心のメーター",
            desc: "子どもたちの今の気持ちを可視化",
            icon: "favorite",
            link: "心のメーター/index.html",
            isExternal: false
        },
 

       {
            title: "歴史の教科書の挿絵を実写化GEM",
            desc: "歴史の学習に役立つ画像",
            icon: "history_edu",
            link: "https://gemini.google.com/gem/1-qRLQU87AFX1eqn7Dj5naN3bnU5wyBas?usp=sharing",
            isExternal: true
        },
        {
            title: "スマホで撮影した写真の文字をテキスト化",
            desc: "画像からテキストを抽出するGPTs",
            icon: "document_scanner",
            link: "https://chatgpt.com/g/g-69d2bb7765a081918ce52b92c90b9e1e-sumahotecuo-ying-sitaxie-zhen-nowen-zi-wotekisutohua",
            isExternal: true
        }
    ],

    // 【2】 所見・事務 タブのアプリ一覧
    "office-apps": [
        {
            title: "保護者対応AI",
            desc: "保護者対応のアドバイスや文面作成",
            icon: "smart_toy",
            link: "保護者対応ナビ/index.html",
            isExternal: false
        },
        {
            title: "小・行動所見作成アプリ改定版",
            desc: "小学校の行動所見を効率的に作成",
            icon: "child_care",
            link: "小学校行動所見/index.html",
            isExternal: false
        },
        {
            title: "中・行動所見作成アプリ改定版",
            desc: "中学校の行動所見を効率的に作成",
            icon: "school",
            link: "中学校行動所見/index.html",
            isExternal: false
        },
        {
            title: "小・道徳所見自動生成アプリ",
            desc: "小学校の道徳所見文例を生成",
            icon: "emoji_people",
            link: "小学校道徳所見/index.html",
            isExternal: false
        },
        {
            title: "中・道徳所見自動生成アプリ",
            desc: "中学校の道徳所見文例を生成",
            icon: "balance",
            link: "中学校道徳所見/index.html",
            isExternal: false
        },
        {
            title: "小・総合学習 所見作成メーカー",
            desc: "小学校の総合的な学習の時間の所見作成",
            icon: "eco",
            link: "小学校総合所見/index.html",
            isExternal: false
        },
        {
            title: "中・総合学習 所見作成メーカー",
            desc: "中学校の総合的な学習の時間の所見作成",
            icon: "public",
            link: "中学校総合所見/index.html",
            isExternal: false
        },
        {
            title: "特別支援学級 教育／指導計画生成ツール",
            desc: "指導計画の作成をサポート",
            icon: "volunteer_activism",
            link: "#",
            isExternal: false
        },
        {
            title: "通知表教科所見作成GPTs",
            desc: "小・中学校の教科所見を作成",
            icon: "assignment",
            link: "#",
            isExternal: false
        },
        {
            title: "個別の支援計画生成AI・プロンプト作成",
            desc: "支援計画の文言案をAIで生成",
            icon: "psychology",
            link: "個別支援計画作成プロンプト/index.html",
            isExternal: false
        }
    ],

    // 【3】 情報・連絡 タブのリンク一覧
    "info-apps": [
        {
            title: "先生の時間を生み出すAIチャンネル",
            desc: "動画をすばやく検索",
            icon: "play_arrow",
            iconClass: "youtube-icon",
            link: "https://countkazu2026.web.app/",
            isExternal: true
        },
        {
            title: "先生の時間を生み出すチャンネル",
            desc: "役立つ時間術やマインドを発信中",
            icon: "play_arrow",
            iconClass: "youtube-icon",
            link: "https://www.youtube.com/@syusyu4717",
            isExternal: true
        },
        {
            title: "理科授業をサポートするチャンネル",
            desc: "理科の授業アイデアや実験動画など",
            icon: "play_arrow",
            iconClass: "youtube-icon",
            link: "https://www.youtube.com/@You-nq5fw",
            isExternal: true
        },
        {
            title: "お問い合わせ",
            desc: "kazu3904@gmail.com\n※ご意見・ご要望はこちらから",
            icon: "mail",
            iconClass: "mail-icon",
            link: "mailto:kazu3904@gmail.com",
            isExternal: true
        }
    ]
};
