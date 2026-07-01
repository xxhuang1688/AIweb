import type { DemoPlanJson, DemoPlanSection } from "@/types/agent";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function displayLabel(value: string) {
  const labels: Record<string, string> = {
    hero: "メイン訴求",
    problem: "課題整理",
    services: "サービス",
    features: "必要機能",
    caseStudies: "導入事例",
    pricing: "料金",
    faq: "よくある質問",
    cta: "お問い合わせ",
    contact: "お問い合わせ",
    custom: "詳細設計",
    proof: "信頼材料",
    ai: "AIサービス",
    brand: "ブランドサイト",
    corporate: "企業サイト",
    ec: "ECサイト",
    "EC showcase": "EC展示",
    lp: "LP",
    portfolio: "ポートフォリオ",
    reservation: "予約導線",
    saas: "SaaSサイト",
    "AI service": "AIサービス",
    SaaS: "SaaSサービス",
    "landing page": "LP構成",
    "company profile": "会社概要",
    "service menu": "サービスメニュー",
    "contact form": "お問い合わせフォーム",
    "case studies": "事例紹介",
    "media content": "情報発信",
    booking: "予約受付",
    "product page": "商品・メニュー",
    "site system": "サイト構成",
    "company story": "会社ストーリー",
    "service design": "サービス設計",
    "easy contact": "相談導線",
    editorial: "情報編集",
    support: "サポート",
    strategy: "設計方針",
    "site map": "ページ構成",
    "demo notice": "デモについて",
    "company editorial": "会社紹介",
    "service architecture": "サービス構成",
    "catalog experience": "一覧体験",
    "booking experience": "予約体験",
    "contact flow": "相談フロー",
    "case study": "事例構成",
    profile: "プロフィール",
    "media page": "情報ページ",
    "question guide": "質問ガイド",
    "service matrix": "サービス比較",
    catalog: "一覧",
    schedule: "スケジュール",
    team: "チーム紹介",
    "page design": "ページデザイン",
    "page strategy": "ページ方針",
    "service flow": "サービスの流れ",
    "booking steps": "予約ステップ",
    "before contact": "相談前の確認",
  };

  return labels[value] ?? value;
}

function colorFor(mainColor: string) {
  if (mainColor.includes("ブラック")) return { accent: "#111111", accent2: "#52525b", soft: "#f4f4f5" };
  if (mainColor.includes("グリーン")) return { accent: "#047857", accent2: "#14b8a6", soft: "#ecfdf5" };
  if (mainColor.includes("レッド")) return { accent: "#be123c", accent2: "#fb7185", soft: "#fff1f2" };
  if (mainColor.includes("ゴールド")) return { accent: "#a16207", accent2: "#eab308", soft: "#fefce8" };
  if (mainColor.includes("パープル")) return { accent: "#6d28d9", accent2: "#a78bfa", soft: "#f5f3ff" };
  if (mainColor.includes("オレンジ")) return { accent: "#c2410c", accent2: "#fb923c", soft: "#fff7ed" };
  return { accent: "#1d4ed8", accent2: "#38bdf8", soft: "#eff6ff" };
}

function siteKind(siteType: string) {
  if (siteType.includes("EC")) return "ec";
  if (siteType.includes("予約")) return "reservation";
  if (siteType.includes("SaaS")) return "saas";
  if (siteType.includes("AI")) return "ai";
  if (siteType.includes("LP")) return "lp";
  if (siteType.includes("ブランド")) return "brand";
  if (siteType.includes("ポートフォリオ")) return "portfolio";
  return "corporate";
}

function styleClass(designStyle: string) {
  if (designStyle.includes("ラグジュアリー")) return "style-luxury";
  if (designStyle.includes("ミニマル") || designStyle.includes("Apple")) return "style-minimal";
  if (designStyle.includes("和風")) return "style-japanese";
  if (designStyle.includes("テクノロジー")) return "style-tech";
  return "style-business";
}

function industryClass(industry: string) {
  if (industry.includes("IT")) return "industry-it";
  if (industry.includes("製造")) return "industry-manufacturing";
  if (industry.includes("小売") || industry.includes("EC")) return "industry-retail";
  if (industry.includes("飲食")) return "industry-restaurant";
  if (industry.includes("美容")) return "industry-beauty";
  if (industry.includes("医療")) return "industry-medical";
  if (industry.includes("不動産")) return "industry-real-estate";
  if (industry.includes("教育")) return "industry-education";
  if (industry.includes("金融") || industry.includes("士業")) return "industry-finance";
  if (industry.includes("採用") || industry.includes("人材")) return "industry-recruitment";
  return "industry-other";
}

function industryCss() {
  return `
    html.industry-it {
      --accent: #06b6d4;
      --accent2: #7c3aed;
      --soft: #ecfeff;
      --bg: #070b16;
      --text: #18181b;
      --muted: #52525b;
      --line: rgba(148, 163, 184, .22);
    }
    html.industry-it body {
      background:
        linear-gradient(rgba(148,163,184,.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(148,163,184,.08) 1px, transparent 1px),
        radial-gradient(circle at 20% 10%, rgba(6,182,212,.2), transparent 32%),
        #070b16;
      background-size: 34px 34px, 34px 34px, auto, auto;
    }
    html.industry-it header {
      border-color: rgba(148,163,184,.2);
      background: rgba(7,11,22,.78);
      color: #e5f4ff;
    }
    html.industry-it header nav,
    html.industry-it header footer {
      color: #91a4bd;
    }
    html.industry-it .hero {
      color: #e5f4ff;
      background:
        radial-gradient(circle at 78% 18%, rgba(124,58,237,.32), transparent 32%),
        radial-gradient(circle at 18% 28%, rgba(6,182,212,.24), transparent 34%),
        linear-gradient(135deg, #070b16 0%, #101827 100%);
    }
    html.industry-it .eyebrow, html.industry-it .section-label {
      color: #67e8f9;
      background: rgba(6,182,212,.12);
      border-color: rgba(103,232,249,.26);
    }
    html.industry-it .hero-visual, html.industry-it .hero-panel {
      background:
        linear-gradient(135deg, rgba(6,182,212,.24), rgba(124,58,237,.32)),
        #0f172a;
      box-shadow: 0 44px 130px rgba(6,182,212,.18);
    }
    html.industry-it .site-screen {
      background:
        linear-gradient(90deg, rgba(103,232,249,.16) 1px, transparent 1px),
        linear-gradient(rgba(103,232,249,.16) 1px, transparent 1px),
        rgba(15,23,42,.72);
      background-size: 22px 22px;
    }
    html.industry-it .section, html.industry-it .special, html.industry-it .executive-summary, html.industry-it .page-map {
      color: #e5f4ff;
      border-color: rgba(148,163,184,.22);
      background: rgba(15,23,42,.78);
    }
    html.industry-it .section p,
    html.industry-it .special p,
    html.industry-it .executive-summary p,
    html.industry-it .page-map p,
    html.industry-it .strategy-list span,
    html.industry-it .proof-grid span,
    html.industry-it .map-grid p {
      color: #91a4bd;
    }
    html.industry-it .section h2,
    html.industry-it .special h2,
    html.industry-it .executive-summary h2,
    html.industry-it .page-map h2,
    html.industry-it .feature-cards strong,
    html.industry-it .proof-grid strong,
    html.industry-it .map-grid strong,
    html.industry-it .strategy-list strong {
      color: #e5f4ff;
    }
    html.industry-it .feature-cards article,
    html.industry-it .proof-grid article,
    html.industry-it .map-grid article,
    html.industry-it .strategy-list div {
      background: rgba(2,6,23,.42);
      border-color: rgba(148,163,184,.22);
    }
    html.industry-it .sub-hero:not(.hero-services):not(.hero-reservation):not(.hero-works):not(.hero-process),
    html.industry-it .sub-block,
    html.industry-it .summary-block,
    html.industry-it .service-deep-dive,
    html.industry-it .contact-guide,
    html.industry-it .reservation-guide {
      color: #18181b;
    }
    html.industry-it .sub-hero:not(.hero-services):not(.hero-reservation):not(.hero-works):not(.hero-process) p,
    html.industry-it .sub-block p,
    html.industry-it .summary-block p,
    html.industry-it .service-deep-dive p,
    html.industry-it .contact-guide p,
    html.industry-it .reservation-guide p {
      color: #52525b;
    }

    html.industry-beauty {
      --accent: #be185d;
      --accent2: #d97706;
      --soft: #fff1f2;
    }
    html.industry-beauty body {
      background:
        radial-gradient(circle at 14% 12%, rgba(251,207,232,.55), transparent 30%),
        linear-gradient(135deg, #fff7ed, #fff1f2 48%, #fff);
    }
    html.industry-beauty .hero, html.industry-beauty .hero-product, html.industry-beauty .hero-people {
      background:
        radial-gradient(circle at 86% 12%, rgba(251,207,232,.58), transparent 28%),
        linear-gradient(135deg, #fff 0%, #fff1f2 52%, #fff7ed 100%);
    }
    html.industry-beauty .hero-visual, html.industry-beauty .hero-panel {
      background:
        radial-gradient(circle at 24% 18%, rgba(255,255,255,.88), transparent 30%),
        linear-gradient(145deg, #be185d, #d97706);
    }
    html.industry-beauty .section, html.industry-beauty .special, html.industry-beauty .sub-block {
      border-radius: 34px;
    }

    html.industry-medical {
      --accent: #0f766e;
      --accent2: #38bdf8;
      --soft: #ecfeff;
    }
    html.industry-medical body { background: linear-gradient(135deg, #f8fafc, #ecfeff); }
    html.industry-medical .hero, html.industry-medical .sub-hero {
      background: linear-gradient(135deg, #fff 0%, #ecfeff 58%, #f8fafc 100%);
    }
    html.industry-medical .hero-visual, html.industry-medical .hero-panel {
      background: linear-gradient(145deg, #0f766e, #38bdf8);
    }

    html.industry-restaurant {
      --accent: #b45309;
      --accent2: #dc2626;
      --soft: #fff7ed;
    }
    html.industry-restaurant body { background: linear-gradient(135deg, #fff7ed, #fff 46%, #fef3c7); }
    html.industry-restaurant .hero { background: linear-gradient(135deg, #2b1710 0%, #7c2d12 44%, #fff7ed 44% 100%); color: #fff; }
    html.industry-restaurant .hero p, html.industry-restaurant .hero .meta { color: rgba(255,255,255,.82); }
    html.industry-restaurant .hero-visual { background: linear-gradient(145deg, #b45309, #dc2626); }

    html.industry-manufacturing {
      --accent: #334155;
      --accent2: #0f766e;
      --soft: #f1f5f9;
    }
    html.industry-manufacturing .hero, html.industry-manufacturing .sub-hero {
      background:
        linear-gradient(90deg, rgba(15,23,42,.08) 1px, transparent 1px),
        linear-gradient(135deg, #fff 0%, #f1f5f9 100%);
      background-size: 28px 28px, auto;
    }
    html.industry-manufacturing .section, html.industry-manufacturing .special, html.industry-manufacturing .sub-block {
      border-radius: 14px;
    }

    html.industry-real-estate {
      --accent: #166534;
      --accent2: #0ea5e9;
      --soft: #f0fdf4;
    }
    html.industry-real-estate .hero-visual, html.industry-real-estate .hero-panel {
      background: linear-gradient(145deg, #166534, #0ea5e9);
    }

    html.industry-education {
      --accent: #2563eb;
      --accent2: #f59e0b;
      --soft: #eff6ff;
    }
    html.industry-education body { background: linear-gradient(135deg, #eff6ff, #fff 48%, #fef3c7); }
    html.industry-education .hero-visual { background: linear-gradient(145deg, #2563eb, #f59e0b); }

    html.industry-finance {
      --accent: #1e3a8a;
      --accent2: #64748b;
      --soft: #eff6ff;
    }
    html.industry-finance .hero, html.industry-finance .sub-hero {
      background: linear-gradient(135deg, #fff 0%, #eff6ff 100%);
    }
    html.industry-finance .section, html.industry-finance .special, html.industry-finance .sub-block {
      border-radius: 18px;
    }

    html.industry-recruitment {
      --accent: #7c3aed;
      --accent2: #0ea5e9;
      --soft: #f5f3ff;
    }
    html.industry-recruitment .hero {
      background:
        radial-gradient(circle at 20% 20%, rgba(124,58,237,.16), transparent 28%),
        linear-gradient(135deg, #fff, #f5f3ff);
    }

    html.industry-retail {
      --accent: #db2777;
      --accent2: #f97316;
      --soft: #fff7ed;
    }
    html.industry-retail .hero-visual { background: linear-gradient(145deg, #db2777, #f97316); }
  `;
}

function renderItems(items: string[]) {
  if (items.length === 0) return "";

  return `
    <div class="items">
      ${items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
    </div>
  `;
}

function renderFeaturedItems(items: string[], fallback: string[], limit = 4) {
  const visibleItems = (items.length > 0 ? items : fallback).slice(0, limit);

  return `
    <div class="feature-cards">
      ${visibleItems.map((item, index) => `
        <article>
          <span>0${index + 1}</span>
          <strong>${escapeHtml(item)}</strong>
          <p>${escapeHtml(item)}をユーザー導線に合わせて整理し、初回訪問でも価値が伝わる構成にします。</p>
        </article>
      `).join("")}
    </div>
  `;
}

function businessHighlights(plan: DemoPlanJson) {
  const blocked = ["Apple", "モダン", "ビジネス", "和風", "ラグジュアリー", "ミニマル", "テクノロジー", "ブルー", "ブラック", "グリーン", "レッド", "ゴールド", "パープル", "オレンジ", "週間", "制作費", "無料メンテナンス"];
  const candidates = [
    ...(plan.homeSections[0]?.items ?? []),
    ...plan.requiredFeatures,
    ...plan.pages.slice(1, 4).map((page) => page.name),
  ].filter((item) => !blocked.some((word) => item.includes(word)));

  return Array.from(new Set(candidates)).slice(0, 3);
}

function mainServiceLabel(plan: DemoPlanJson) {
  return plan.homeSections.find((section) => section.type === "services")?.items.slice(0, 2).join("・") || plan.requiredFeatures.slice(0, 2).join("・") || "サービス紹介";
}

function visualGridItems(plan: DemoPlanJson) {
  if (plan.industry.includes("IT")) return [["AI", "活用"], ["DX", "支援"], ["API", "連携"], ["Cloud", "運用"]];
  if (plan.industry.includes("製造")) return [["技術", "紹介"], ["設備", "整理"], ["品質", "保証"], ["納期", "対応"]];
  if (plan.industry.includes("小売") || plan.industry.includes("EC")) return [["商品", "一覧"], ["比較", "導線"], ["決済", "設計"], ["レビュー", "掲載"]];
  if (plan.industry.includes("飲食")) return [["料理", "魅力"], ["席", "予約"], ["店舗", "案内"], ["季節", "情報"]];
  if (plan.industry.includes("美容")) return [["施術", "紹介"], ["料金", "整理"], ["予約", "導線"], ["スタッフ", "紹介"]];
  if (plan.industry.includes("医療")) return [["診療", "案内"], ["医師", "紹介"], ["予約", "導線"], ["アクセス", "掲載"]];
  if (plan.industry.includes("不動産")) return [["物件", "検索"], ["エリア", "案内"], ["査定", "相談"], ["来店", "予約"]];
  if (plan.industry.includes("教育")) return [["コース", "比較"], ["講師", "紹介"], ["実績", "掲載"], ["体験", "予約"]];
  if (plan.industry.includes("金融") || plan.industry.includes("士業")) return [["専門", "分野"], ["相談", "導線"], ["料金", "目安"], ["FAQ", "整理"]];
  if (plan.industry.includes("採用") || plan.industry.includes("人材")) return [["求人", "検索"], ["登録", "導線"], ["支援", "流れ"], ["企業", "相談"]];
  return [["信頼", "設計"], ["内容", "整理"], ["相談", "導線"], ["情報", "更新"]];
}

function renderSection(section: DemoPlanSection) {
  if (section.type === "services" || section.type === "features") {
    return `
      <section class="section section-${escapeHtml(section.type)} enhanced-section">
        <div>
          <div class="section-label">${escapeHtml(displayLabel(section.type))}</div>
          <h2>${escapeHtml(section.title)}</h2>
          <p class="subtitle">${escapeHtml(section.subtitle)}</p>
          <p>${escapeHtml(section.content)}</p>
          ${section.ctaLabel ? `<a class="button" href="#contact">${escapeHtml(section.ctaLabel)}</a>` : ""}
        </div>
        ${renderFeaturedItems(section.items, ["企画設計", "UIデザイン", "実装", "運用改善"], section.id === "feature-coverage" ? 24 : section.type === "features" ? 12 : 4)}
      </section>
    `;
  }

  if (section.type === "caseStudies") {
    return `
      <section class="section proof-section">
        <div>
          <div class="section-label">${escapeHtml(displayLabel("proof"))}</div>
          <h2>${escapeHtml(section.title)}</h2>
          <p class="subtitle">${escapeHtml(section.subtitle)}</p>
          <p>${escapeHtml(section.content)}</p>
        </div>
        <div class="proof-grid">
          ${(section.items.length > 0 ? section.items : ["導入前の課題", "提供した解決策", "導入後の成果"]).slice(0, 3).map((item, index) => `
            <article>
              <strong>${index === 0 ? "課題" : index === 1 ? "解決策" : "成果"}</strong>
              <span>${escapeHtml(item)}</span>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (section.type === "cta" || section.type === "contact") {
    return `
      <section class="section final-action">
        <div>
          <div class="section-label">${escapeHtml(displayLabel(section.type))}</div>
          <h2>${escapeHtml(section.title)}</h2>
          <p class="subtitle">${escapeHtml(section.subtitle)}</p>
          <p>${escapeHtml(section.content)}</p>
        </div>
        <div class="action-panel">
          <span>無料相談</span>
          <strong>${escapeHtml(section.ctaLabel ?? "お問い合わせする")}</strong>
          <small>${escapeHtml(section.content)}</small>
        </div>
      </section>
    `;
  }

  return `
    <section class="section section-${escapeHtml(section.type)}">
      <div class="section-label">${escapeHtml(displayLabel(section.type))}</div>
      <h2>${escapeHtml(section.title)}</h2>
      <p class="subtitle">${escapeHtml(section.subtitle)}</p>
      <p>${escapeHtml(section.content)}</p>
      ${renderItems(section.items)}
      ${section.ctaLabel ? `<a class="button" href="#contact">${escapeHtml(section.ctaLabel)}</a>` : ""}
    </section>
  `;
}

function renderHeroMetrics(plan: DemoPlanJson) {
  const highlights = businessHighlights(plan);
  const visibleHighlights = highlights.length > 0 ? highlights : [plan.industry, mainServiceLabel(plan), plan.contentStrategy.ctaLabel];

  return `
    <div class="hero-metrics">
      ${visibleHighlights.map((item) => `
        <div><strong>${escapeHtml(item)}</strong><span>${escapeHtml(plan.industry)}向けの重点項目</span></div>
      `).join("")}
    </div>
    <div class="hero-stack">
      ${visibleHighlights.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
    </div>
  `;
}

function pageAnchorFor(fileName: string) {
  return `page-${fileName.replace(".html", "").replaceAll(".", "-")}`;
}

function renderSpecialBlock(plan: DemoPlanJson) {
  const kind = siteKind(plan.siteType);
  const cta = escapeHtml(plan.contentStrategy.ctaLabel);

  if (kind === "ec") {
    return `
      <section class="special product-showcase">
        <div>
          <div class="section-label">${escapeHtml(displayLabel("EC showcase"))}</div>
          <h2>商品が選びやすく、購入まで迷わない構成</h2>
          <p>商品一覧、商品詳細、購入手続きを一貫した導線で整理し、スマートフォンでも購入しやすい体験を設計します。</p>
        </div>
        <div class="product-grid">
          ${["おすすめ商品", "人気カテゴリ", "限定キャンペーン"].map((item) => `
            <article>
              <div class="mock-image"></div>
              <strong>${escapeHtml(item)}</strong>
              <span>詳細を見る</span>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (kind === "reservation") {
    return `
      <section class="special reservation-panel">
        <div>
          <div class="section-label">${escapeHtml(displayLabel("reservation"))}</div>
          <h2>予約までの不安を減らす導線設計</h2>
          <p>空き状況、サービス内容、来店前の確認事項を整理し、問い合わせや予約につながる画面を作ります。</p>
          <a class="button" href="#contact">${cta}</a>
        </div>
        <div class="calendar">
          ${["月", "火", "水", "木", "金", "土"].map((day, index) => `
            <div class="${index === 2 || index === 4 ? "active" : ""}">
              <strong>${day}</strong>
              <span>${index === 2 || index === 4 ? "予約可" : "残りわずか"}</span>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (kind === "saas" || kind === "ai") {
    return `
      <section class="special product-dashboard">
        <div>
          <div class="section-label">${escapeHtml(displayLabel(kind === "ai" ? "AI service" : "SaaS"))}</div>
          <h2>導入メリットを数字と機能で伝えるプロダクト構成</h2>
          <p>機能価値、導入フロー、成果イメージを一画面で把握できるように整理します。</p>
        </div>
        <div class="dashboard-card">
          <div><span>自動化率</span><strong>68%</strong></div>
          <div><span>対応時間</span><strong>-42%</strong></div>
          <div><span>相談件数</span><strong>2.4x</strong></div>
        </div>
      </section>
    `;
  }

  if (kind === "lp") {
    return `
      <section class="special offer-band">
        <div>
          <div class="section-label">${escapeHtml(displayLabel("landing page"))}</div>
          <h2>1つの訴求に集中し、CTAまで一直線に導きます</h2>
          <p>課題提起、ベネフィット、信頼材料、行動喚起を縦長に配置し、短時間で判断できるLPにします。</p>
        </div>
        <a class="button" href="#contact">${cta}</a>
      </section>
    `;
  }

  return `
    <section class="special trust-strip">
      ${["信頼性", "サービス理解", "問い合わせ導線"].map((item) => `
        <div>
          <strong>${escapeHtml(item)}</strong>
          <span>${escapeHtml(plan.industry)}向けに最適化</span>
        </div>
      `).join("")}
    </section>
  `;
}

function pageVariantFor(page?: DemoPlanJson["pages"][number]) {
  if (!page) return "home";
  if (page.name.includes("会社")) return "about";
  if (page.name.includes("サービス") || page.name.includes("技術") || page.name.includes("設備") || page.name.includes("診療") || page.name.includes("コース")) return "services";
  if (page.name.includes("お問い合わせ")) return "contact";
  if (page.name.includes("実績") || page.name.includes("事例")) return "works";
  if (page.name.includes("開発プロセス") || page.name.includes("流れ")) return "services";
  if (page.name.includes("講師") || page.name.includes("医師") || page.name.includes("スタッフ")) return "people";
  if (page.name.includes("ブログ") || page.name.includes("ニュース") || page.name.includes("求人") || page.name.includes("転職")) return "content";
  if (page.name.includes("FAQ") || page.name.includes("よくある質問")) return "faq";
  if (page.name.includes("予約") || page.name.includes("初診") || page.name.includes("無料体験") || page.name.includes("相談")) return "reservation";
  if (page.name.includes("商品") || page.name.includes("物件") || page.name.includes("メニュー") || page.name.includes("料金")) return "product";
  return "standard";
}

function renderHeroVisual(plan: DemoPlanJson, kind: string, page?: DemoPlanJson["pages"][number]) {
  const variant = pageVariantFor(page);

  if (variant === "about") {
    return `
      <div class="hero-visual page-visual about-visual">
        <div class="template-badge">${escapeHtml(displayLabel("company profile"))}</div>
        <div class="profile-mark">${escapeHtml(plan.company.name.slice(0, 1))}</div>
        <div class="timeline">
          ${["創業ストーリー", "事業領域", "選ばれる理由"].map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
        </div>
      </div>
    `;
  }

  if (variant === "services") {
    return `
      <div class="hero-visual page-visual services-visual">
        <div class="template-badge">${escapeHtml(displayLabel("service menu"))}</div>
        <div class="service-stack">
          ${(plan.requiredFeatures.length > 0 ? plan.requiredFeatures.slice(0, 4) : ["企画", "制作", "運用", "改善"]).map((item) => `
            <article>
              <strong>${escapeHtml(item)}</strong>
              <span>課題から成果まで整理</span>
            </article>
          `).join("")}
        </div>
      </div>
    `;
  }

  if (variant === "contact") {
    return `
      <div class="hero-visual page-visual contact-visual">
        <div class="template-badge">${escapeHtml(displayLabel("contact form"))}</div>
        <div class="form-mock">
          <span>お名前</span>
          <span>会社名</span>
          <span>相談内容</span>
          <strong>${escapeHtml(plan.contentStrategy.ctaLabel)}</strong>
        </div>
      </div>
    `;
  }

  if (variant === "works") {
    return `
      <div class="hero-visual page-visual works-visual">
        <div class="template-badge">${escapeHtml(displayLabel("case studies"))}</div>
        <div class="case-grid">
          ${["導入前", "施策", "成果", "次の改善"].map((item) => `<div>${escapeHtml(item)}</div>`).join("")}
        </div>
      </div>
    `;
  }

  if (variant === "content") {
    return `
      <div class="hero-visual page-visual content-visual">
        <div class="template-badge">${escapeHtml(displayLabel("media content"))}</div>
        <div class="article-list">
          ${["最新のお知らせ", "専門コラム", "導入ノウハウ"].map((item) => `
            <article>
              <span>2026.07</span>
              <strong>${escapeHtml(item)}</strong>
            </article>
          `).join("")}
        </div>
      </div>
    `;
  }

  if (variant === "faq") {
    return `
      <div class="hero-visual page-visual faq-visual">
        <div class="template-badge">FAQ</div>
        <div class="faq-mock">
          ${["料金について", "制作期間について", "公開後の運用について"].map((item) => `<div>Q. ${escapeHtml(item)}</div>`).join("")}
        </div>
      </div>
    `;
  }

  if (variant === "reservation") {
    return `
      <div class="hero-visual page-visual reservation-visual">
        <div class="template-badge">${escapeHtml(displayLabel("booking"))}</div>
        <div class="calendar compact">
          ${["月", "火", "水", "木", "金", "土"].map((day, index) => `
            <div class="${index === 1 || index === 4 ? "active" : ""}">
              <strong>${day}</strong>
              <span>${index === 1 || index === 4 ? "予約可" : "確認"}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  if (variant === "product") {
    return `
      <div class="hero-visual page-visual product-visual">
        <div class="template-badge">${escapeHtml(displayLabel("product page"))}</div>
        <div class="product-grid compact">
          ${["商品一覧", "詳細情報", "購入導線"].map((item) => `
            <article>
              <div class="mock-image"></div>
              <strong>${escapeHtml(item)}</strong>
            </article>
          `).join("")}
        </div>
      </div>
    `;
  }

  return `
    <div class="hero-visual">
      <div class="visual-card">
        <div class="template-badge">${escapeHtml(`${displayLabel(kind)} ${displayLabel("site system")}`)}</div>
        <div class="site-screen">
          <div class="screen-header"><span></span><span></span><span></span></div>
          <div class="screen-hero"></div>
          <div class="screen-grid">
            <span></span><span></span><span></span>
          </div>
        </div>
        <div class="visual-grid">
          ${visualGridItems(plan).map(([main, sub]) => `
            <div><strong>${escapeHtml(main)}</strong><span>${escapeHtml(sub)}</span></div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderPageSpecificBlock(plan: DemoPlanJson, page?: DemoPlanJson["pages"][number]) {
  const variant = pageVariantFor(page);

  if (variant === "about") {
    return `
      <section class="special about-story">
        <div>
          <div class="section-label">${escapeHtml(displayLabel("company story"))}</div>
          <h2>信頼される理由を、数字とストーリーで伝えます</h2>
          <p>${escapeHtml(plan.industry)}の顧客に向けて、会社の姿勢、支援範囲、相談しやすさを整理します。</p>
        </div>
        <div class="story-grid">
          ${["理念", "強み", "沿革"].map((item) => `<div><strong>${escapeHtml(item)}</strong><span>わかりやすく掲載</span></div>`).join("")}
        </div>
      </section>
    `;
  }

  if (variant === "services") {
    return `
      <section class="special service-comparison">
        <div>
          <div class="section-label">${escapeHtml(displayLabel("service design"))}</div>
          <h2>サービスごとの違いと相談導線を明確にします</h2>
          <p>検討者が自分に合うサービスを選びやすいよう、内容・対象・成果を並べて見せます。</p>
        </div>
        <div class="comparison-table">
          ${["ライト", "スタンダード", "カスタム"].map((item, index) => `
            <article class="${index === 1 ? "featured" : ""}">
              <strong>${escapeHtml(item)}</strong>
              <span>${index === 1 ? "おすすめ構成" : "用途別プラン"}</span>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (variant === "contact") {
    return `
      <section class="special contact-layout">
        <div>
          <div class="section-label">${escapeHtml(displayLabel("easy contact"))}</div>
          <h2>相談内容を整理しながら送信できるフォーム</h2>
          <p>初回相談で必要な情報だけを自然に入力できるようにし、離脱を減らします。</p>
        </div>
        <div class="contact-cards">
          ${["無料相談", "概算見積もり", "納期確認"].map((item) => `<div>${escapeHtml(item)}</div>`).join("")}
        </div>
      </section>
    `;
  }

  if (variant === "works") {
    return `
      <section class="special works-layout">
        <div>
          <div class="section-label">${escapeHtml(displayLabel("proof"))}</div>
          <h2>成果が伝わる導入事例ページ</h2>
          <p>課題、提案、制作範囲、成果をセットで掲載し、問い合わせ前の信頼を高めます。</p>
        </div>
        <div class="metrics">
          <div><strong>3.2x</strong><span>問い合わせ増加</span></div>
          <div><strong>42%</strong><span>運用時間削減</span></div>
          <div><strong>8週</strong><span>公開目安</span></div>
        </div>
      </section>
    `;
  }

  if (variant === "content") {
    return `
      <section class="special content-layout">
        <div>
          <div class="section-label">${escapeHtml(displayLabel("editorial"))}</div>
          <h2>読み進めやすい記事一覧とカテゴリ設計</h2>
          <p>ニュース、ノウハウ、事例を分けて掲載し、検索流入と信頼形成を支えます。</p>
        </div>
        <div class="category-pills">
          ${["お知らせ", "ノウハウ", "事例", "採用"].map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
        </div>
      </section>
    `;
  }

  if (variant === "faq") {
    return `
      <section class="special faq-layout">
        <div>
          <div class="section-label">${escapeHtml(displayLabel("support"))}</div>
          <h2>問い合わせ前の疑問を先回りして解消</h2>
          <p>料金、納期、公開後の運用など、検討中に迷いやすい項目を整理します。</p>
        </div>
        <div class="faq-list">
          ${["料金はどのように決まりますか？", "公開後の修正はできますか？", "文章や写真が未定でも相談できますか？"].map((item) => `<details open><summary>${escapeHtml(item)}</summary><p>内容に合わせて柔軟にご提案します。</p></details>`).join("")}
        </div>
      </section>
    `;
  }

  return "";
}

function renderExecutiveSummary(plan: DemoPlanJson) {
  return `
    <section class="executive-summary">
      <div>
        <div class="section-label">${escapeHtml(displayLabel("strategy"))}</div>
        <h2>${escapeHtml(plan.contentStrategy.primaryMessage)}</h2>
        <p>${escapeHtml(plan.contentStrategy.targetAudience)}</p>
      </div>
      <div class="strategy-list">
        <div><strong>対象</strong><span>${escapeHtml(plan.contentStrategy.targetAudience)}</span></div>
        <div><strong>主な内容</strong><span>${escapeHtml(mainServiceLabel(plan))}</span></div>
        <div><strong>次の行動</strong><span>${escapeHtml(plan.contentStrategy.ctaLabel)}</span></div>
      </div>
    </section>
  `;
}

function renderPageMap(plan: DemoPlanJson) {
  return `
    <section class="page-map">
      <div>
        <div class="section-label">${escapeHtml(displayLabel("site map"))}</div>
        <h2>基礎展示ページを最初から設計</h2>
        <p>トップページだけで終わらせず、相談前に必要な情報へ自然に進める構成にします。</p>
      </div>
      <div class="map-grid">
        ${plan.pages.slice(0, 8).map((page, index) => `
          <article>
            <span>0${index + 1}</span>
            <strong>${escapeHtml(page.name)}</strong>
            <p>${escapeHtml(page.role)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderDemoNotice() {
  return `
    <section class="demo-notice">
      <div>
        <div class="section-label">${escapeHtml(displayLabel("demo notice"))}</div>
        <h2>このデモは基礎展示用です</h2>
        <p>このページは初回確認のための基礎デモです。設定内容、制作ノウハウ、技術的な詳細は保護のため一部非公開にしています。具体的な構成、実装範囲、運用方法についてはお問い合わせください。</p>
      </div>
      <a class="button" href="#contact">詳しく相談する</a>
    </section>
  `;
}

export function renderDemoHtml(plan: DemoPlanJson, pageContext?: DemoPlanJson["pages"][number]) {
  const colors = colorFor(plan.visualStyle.mainColor);
  const hero = plan.homeSections[0];
  const restSections = plan.homeSections.slice(1);
  const kind = siteKind(plan.siteType);
  const visualClass = styleClass(plan.visualStyle.designStyle);
  const industryVisualClass = industryClass(plan.industry);
  const pageVariant = pageVariantFor(pageContext);
  const pageFileNames = fileNamesForPages(plan.pages);

  return `<!doctype html>
<html lang="ja" class="${visualClass} ${industryVisualClass} page-${pageVariant}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(plan.company.name)}</title>
  <style>
    :root {
      --accent: ${colors.accent};
      --accent2: ${colors.accent2};
      --soft: ${colors.soft};
      --text: #18181b;
      --muted: #71717a;
      --line: #e4e4e7;
      --bg: #fafafa;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif;
      color: var(--text);
      background: var(--bg);
      letter-spacing: 0;
    }
    header {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      padding: 18px clamp(20px, 5vw, 72px);
      border-bottom: 1px solid rgba(228, 228, 231, 0.78);
      background: rgba(250, 250, 250, 0.88);
      backdrop-filter: blur(16px);
    }
    .brand { font-weight: 700; }
    nav { display: flex; gap: 18px; color: var(--muted); font-size: 14px; }
    nav a {
      color: inherit;
      text-decoration: none;
      cursor: pointer;
      transition: color .2s ease;
    }
    nav a:hover { color: var(--accent); }
    main { overflow: hidden; }
    .embedded-page { display: none; }
    body:has(.embedded-page:target) .home-page { display: none; }
    .embedded-page:target { display: block; }
    .sub-hero {
      padding: clamp(56px, 8vw, 92px) clamp(20px, 5vw, 72px) 36px;
      background: linear-gradient(135deg, #ffffff 0%, var(--soft) 100%);
    }
    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1.08fr) minmax(280px, 0.72fr);
      align-items: center;
      gap: 28px;
      padding: clamp(64px, 10vw, 112px) clamp(20px, 5vw, 72px) 56px;
      background: linear-gradient(135deg, #ffffff 0%, var(--soft) 100%);
    }
    .hero-copy { display: grid; gap: 24px; }
    .hero-metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      max-width: 760px;
    }
    .hero-metrics div {
      border: 1px solid rgba(24, 24, 27, 0.08);
      border-radius: 22px;
      background: rgba(255,255,255,.72);
      padding: 16px;
      box-shadow: 0 18px 50px rgba(15,23,42,.06);
    }
    .hero-metrics strong { display: block; font-size: 28px; color: var(--accent); }
    .hero-metrics span { display: block; margin-top: 4px; color: var(--muted); font-size: 13px; font-weight: 650; }
    .hero-stack { display: flex; flex-wrap: wrap; gap: 8px; }
    .hero-stack span {
      border: 1px solid var(--line);
      border-radius: 999px;
      background: #fff;
      padding: 8px 11px;
      color: #3f3f46;
      font-size: 13px;
      font-weight: 700;
    }
    .hero-visual {
      min-height: 420px;
      border: 1px solid rgba(24, 24, 27, 0.08);
      border-radius: 36px;
      background:
        radial-gradient(circle at 22% 22%, rgba(255,255,255,0.96), transparent 34%),
        linear-gradient(145deg, var(--accent), var(--accent2));
      box-shadow: 0 40px 110px rgba(15, 23, 42, 0.18);
      padding: 22px;
      color: #fff;
      overflow: hidden;
    }
    .visual-card {
      display: grid;
      gap: 12px;
      height: 100%;
      border-radius: 26px;
      padding: 22px;
      background: rgba(255,255,255,0.14);
      backdrop-filter: blur(12px);
    }
    .visual-line { height: 12px; border-radius: 999px; background: rgba(255,255,255,0.62); }
    .visual-line.short { width: 54%; }
    .visual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: auto; }
    .visual-grid div { min-height: 86px; border-radius: 20px; background: rgba(255,255,255,0.18); padding: 14px; }
    .visual-grid strong, .visual-grid span { display: block; }
    .visual-grid strong { font-size: 24px; }
    .visual-grid span { margin-top: 4px; color: rgba(255,255,255,.74); font-size: 13px; }
    .site-screen {
      display: grid;
      gap: 14px;
      border: 1px solid rgba(255,255,255,.2);
      border-radius: 24px;
      background: rgba(255,255,255,.12);
      padding: 16px;
    }
    .screen-header { display: flex; gap: 6px; }
    .screen-header span { width: 9px; height: 9px; border-radius: 999px; background: rgba(255,255,255,.72); }
    .screen-hero { min-height: 112px; border-radius: 18px; background: rgba(255,255,255,.22); }
    .screen-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .screen-grid span { height: 56px; border-radius: 14px; background: rgba(255,255,255,.16); }
    .page-visual {
      display: grid;
      align-content: start;
      gap: 18px;
    }
    .profile-mark {
      display: grid;
      place-items: center;
      width: 112px;
      height: 112px;
      border-radius: 32px;
      background: rgba(255,255,255,.18);
      font-size: 56px;
      font-weight: 800;
    }
    .timeline, .service-stack, .form-mock, .article-list, .faq-mock {
      display: grid;
      gap: 12px;
      margin-top: auto;
    }
    .timeline span, .form-mock span, .form-mock strong, .faq-mock div, .article-list article, .service-stack article, .case-grid div {
      border: 1px solid rgba(255,255,255,.24);
      border-radius: 20px;
      background: rgba(255,255,255,.16);
      padding: 16px;
    }
    .form-mock strong { background: rgba(255,255,255,.92); color: var(--accent); text-align: center; }
    .service-stack article strong, .service-stack article span, .article-list article strong, .article-list article span {
      display: block;
    }
    .service-stack article span, .article-list article span { color: rgba(255,255,255,.78); font-size: 13px; }
    .case-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: auto; }
    .compact { margin-top: auto; }
    .template-badge {
      width: fit-content;
      border-radius: 999px;
      padding: 8px 12px;
      background: rgba(255,255,255,0.22);
      color: #fff;
      font-size: 13px;
      font-weight: 700;
    }
    .eyebrow {
      width: fit-content;
      border: 1px solid rgba(24, 24, 27, 0.1);
      border-radius: 999px;
      padding: 8px 12px;
      color: var(--accent);
      background: rgba(255, 255, 255, 0.72);
      font-size: 13px;
      font-weight: 700;
    }
    h1 {
      max-width: 880px;
      margin: 0;
      font-size: clamp(42px, 8vw, 86px);
      line-height: 1.02;
      font-weight: 750;
    }
    h2 {
      margin: 8px 0 0;
      font-size: clamp(28px, 4vw, 48px);
      line-height: 1.12;
    }
    p {
      max-width: 780px;
      color: var(--muted);
      font-size: 16px;
      line-height: 1.9;
    }
    .hero p { font-size: 18px; }
    .button {
      display: inline-flex;
      width: fit-content;
      align-items: center;
      justify-content: center;
      margin-top: 12px;
      border-radius: 999px;
      padding: 14px 20px;
      color: #fff;
      background: var(--accent);
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
    }
    .button.secondary { color: var(--accent); background: #fff; }
    .meta {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      max-width: 960px;
    }
    .meta div, .section {
      border: 1px solid var(--line);
      border-radius: 28px;
      background: rgba(255, 255, 255, 0.82);
      box-shadow: 0 24px 80px rgba(15, 23, 42, 0.06);
    }
    .meta div { padding: 18px; }
    .meta strong { display: block; margin-bottom: 6px; }
    .sections {
      display: grid;
      gap: 20px;
      padding: 28px clamp(20px, 5vw, 72px) 72px;
    }
    .special {
      display: grid;
      gap: 24px;
      align-items: center;
      border: 1px solid var(--line);
      border-radius: 32px;
      background: #fff;
      padding: clamp(24px, 4vw, 44px);
      box-shadow: 0 24px 80px rgba(15, 23, 42, 0.06);
    }
    .executive-summary, .page-map, .enhanced-section, .proof-section, .final-action {
      display: grid;
      grid-template-columns: minmax(0, .88fr) minmax(280px, 1.12fr);
      gap: 24px;
      align-items: center;
      border: 1px solid var(--line);
      border-radius: 32px;
      background: #fff;
      padding: clamp(24px, 4vw, 44px);
      box-shadow: 0 24px 80px rgba(15, 23, 42, 0.06);
    }
    .demo-notice {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 20px;
      align-items: center;
      border: 1px solid rgba(24, 24, 27, .1);
      border-radius: 28px;
      background: #18181b;
      padding: clamp(22px, 4vw, 36px);
      color: #fff;
    }
    .demo-notice h2 { color: #fff; }
    .demo-notice p { color: rgba(255,255,255,.72); }
    .demo-notice .section-label { color: #fff; background: rgba(255,255,255,.14); }
    .demo-notice .button { background: #fff; color: #18181b; }
    .executive-summary {
      background: linear-gradient(135deg, #fff 0%, var(--soft) 100%);
    }
    .strategy-list, .feature-cards, .proof-grid, .map-grid {
      display: grid;
      gap: 12px;
    }
    .strategy-list { grid-template-columns: 1fr; }
    .strategy-list div, .feature-cards article, .proof-grid article, .map-grid article, .action-panel {
      border: 1px solid var(--line);
      border-radius: 22px;
      background: rgba(255,255,255,.84);
      padding: 18px;
    }
    .feature-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .feature-cards span, .map-grid span {
      color: var(--accent);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 13px;
      font-weight: 800;
    }
    .feature-cards strong, .proof-grid strong, .map-grid strong, .strategy-list strong, .action-panel strong {
      display: block;
      margin-top: 8px;
      color: var(--text);
      font-size: 18px;
    }
    .feature-cards p, .map-grid p { margin: 10px 0 0; font-size: 14px; line-height: 1.7; }
    .proof-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .proof-grid article { background: var(--soft); }
    .proof-grid span, .strategy-list span, .action-panel span, .action-panel small { display: block; color: var(--muted); line-height: 1.7; }
    .action-panel {
      color: #fff;
      background: linear-gradient(145deg, var(--accent), var(--accent2));
      box-shadow: 0 24px 70px rgba(15, 23, 42, .16);
    }
    .action-panel span, .action-panel small { color: rgba(255,255,255,.78); }
    .action-panel strong { color: #fff; font-size: clamp(24px, 4vw, 42px); }
    .map-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .trust-strip { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .trust-strip div, .dashboard-card div, .calendar div, .product-grid article {
      border: 1px solid var(--line);
      border-radius: 22px;
      background: var(--soft);
      padding: 18px;
    }
    .trust-strip strong, .trust-strip span { display: block; }
    .trust-strip span, .dashboard-card span, .calendar span, .product-grid span { color: var(--muted); font-size: 14px; }
    .product-showcase, .reservation-panel, .product-dashboard, .offer-band { grid-template-columns: minmax(0, .9fr) minmax(280px, 1.1fr); }
    .product-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .product-grid article { background: #fff; }
    .mock-image { height: 120px; margin-bottom: 14px; border-radius: 18px; background: linear-gradient(135deg, var(--soft), rgba(255,255,255,.7)); }
    .dashboard-card { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .dashboard-card strong { display: block; margin-top: 8px; font-size: 34px; color: var(--accent); }
    .calendar { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .calendar .active { color: #fff; background: var(--accent); }
    .calendar .active span { color: rgba(255,255,255,.76); }
    .offer-band { background: linear-gradient(135deg, #fff, var(--soft)); }
    .story-grid, .comparison-table, .contact-cards, .metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }
    .story-grid div, .comparison-table article, .contact-cards div, .metrics div {
      border: 1px solid var(--line);
      border-radius: 22px;
      background: var(--soft);
      padding: 18px;
    }
    .story-grid strong, .story-grid span, .comparison-table strong, .comparison-table span, .metrics strong, .metrics span {
      display: block;
    }
    .comparison-table .featured {
      color: #fff;
      background: var(--accent);
      border-color: var(--accent);
    }
    .comparison-table .featured span { color: rgba(255,255,255,.78); }
    .metrics strong { color: var(--accent); font-size: 32px; }
    .category-pills { display: flex; flex-wrap: wrap; gap: 10px; }
    .category-pills span {
      border-radius: 999px;
      background: var(--soft);
      padding: 10px 14px;
      color: var(--accent);
      font-weight: 700;
    }
    .faq-list { display: grid; gap: 10px; }
    .faq-list details {
      border: 1px solid var(--line);
      border-radius: 18px;
      background: #fff;
      padding: 16px;
    }
    .faq-list summary { cursor: pointer; font-weight: 700; }
    .section { padding: clamp(24px, 4vw, 44px); }
    .section-label {
      width: fit-content;
      border-radius: 999px;
      padding: 7px 11px;
      color: var(--accent);
      background: var(--soft);
      font-size: 12px;
      font-weight: 700;
    }
    .subtitle { color: var(--text); font-weight: 650; }
    .items {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 18px;
    }
    .items span {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 8px 12px;
      color: #3f3f46;
      background: #fff;
      font-size: 14px;
      font-weight: 600;
    }
    footer {
      padding: 32px clamp(20px, 5vw, 72px);
      color: var(--muted);
      border-top: 1px solid var(--line);
      background: #fff;
      font-size: 14px;
    }
    .style-luxury body { background: #f8f5ef; }
    .style-luxury h1, .style-luxury h2 { font-family: Georgia, "Hiragino Mincho ProN", serif; }
    .style-minimal .section, .style-minimal .special, .style-minimal .meta div { box-shadow: none; }
    .style-japanese .hero { background: linear-gradient(135deg, #fff, #f7f3ea); }
    .style-tech .hero-visual { transform: perspective(900px) rotateY(-7deg); }
    ${industryCss()}
    @media (max-width: 720px) {
      nav { display: none; }
      .meta { grid-template-columns: 1fr; }
      header { padding-inline: 20px; }
      .hero, .product-showcase, .reservation-panel, .product-dashboard, .offer-band, .executive-summary, .page-map, .enhanced-section, .proof-section, .final-action, .demo-notice { grid-template-columns: 1fr; }
      .hero-visual { min-height: 300px; }
      .hero-metrics, .trust-strip, .product-grid, .dashboard-card, .calendar, .story-grid, .comparison-table, .contact-cards, .metrics, .feature-cards, .proof-grid, .map-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">${escapeHtml(plan.company.name)}</div>
    <nav>
      ${plan.pages.slice(0, 8).map((page, index) => {
        const fileName = pageFileNames[index] ?? fileNameFor(page.name, index);
        return `<a href="#${escapeHtml(pageAnchorFor(fileName))}" data-sync-page="${escapeHtml(fileName)}">${escapeHtml(page.name)}</a>`;
      }).join("")}
    </nav>
  </header>
  <main>
    <div id="page-index" class="home-page">
      <section class="hero">
        <div class="hero-copy">
          <div class="eyebrow">${escapeHtml(plan.siteType)} / ${escapeHtml(plan.industry)}</div>
          <h1>${escapeHtml(plan.company.slogan || hero?.title || plan.contentStrategy.primaryMessage)}</h1>
          <p>${escapeHtml(plan.company.description || hero?.content || plan.contentStrategy.targetAudience)}</p>
          <a class="button" href="#contact">${escapeHtml(plan.contentStrategy.ctaLabel)}</a>
          ${renderHeroMetrics(plan)}
          <div class="meta">
            <div><strong>会社</strong>${escapeHtml(plan.company.name)}</div>
            <div><strong>主な内容</strong>${escapeHtml(mainServiceLabel(plan))}</div>
            <div><strong>相談導線</strong>${escapeHtml(plan.contentStrategy.ctaLabel)}</div>
          </div>
        </div>
        ${renderHeroVisual(plan, kind, pageContext)}
      </section>
      <div class="sections">
        ${renderDemoNotice()}
        ${renderPageSpecificBlock(plan, pageContext)}
        ${pageContext ? "" : renderExecutiveSummary(plan)}
        ${renderSpecialBlock(plan)}
        ${restSections.map(renderSection).join("")}
        ${pageContext ? "" : renderPageMap(plan)}
        <section id="contact" class="section">
          <div class="section-label">${escapeHtml(displayLabel("contact"))}</div>
          <h2>${escapeHtml(plan.contentStrategy.ctaLabel)}</h2>
          <p class="subtitle">このデモはDemo Plan JSONから自動生成された静的HTMLプレビューです。</p>
          <p>実際の公開前には、写真素材、詳細文言、フォーム連携、SEO設定などを調整します。</p>
        </section>
      </div>
    </div>
  </main>
  <footer>© ${escapeHtml(plan.company.name)}</footer>
  <script>
    document.querySelectorAll("[data-sync-page]").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (window.parent === window) return;
        event.preventDefault();
        window.parent.postMessage({
          type: "sync-craft-open-page",
          fileName: link.getAttribute("data-sync-page")
        }, "*");
      });
    });
  </script>
</body>
</html>`;
}

function fileNameFor(pageName: string, index: number) {
  if (index === 0 || pageName.includes("トップ")) return "index.html";
  if (pageName.includes("会社")) return "about.html";
  if (pageName.includes("サービス")) return "services.html";
  if (pageName.includes("技術") || pageName.includes("設備")) return "technology.html";
  if (pageName.includes("診療") || pageName.includes("初診")) return "medical.html";
  if (pageName.includes("コース") || pageName.includes("無料体験")) return "school.html";
  if (pageName.includes("お問い合わせ")) return "contact.html";
  if (pageName.includes("実績")) return "works.html";
  if (pageName.includes("ブログ")) return "blog.html";
  if (pageName.includes("ニュース")) return "news.html";
  if (pageName.includes("予約") || pageName.includes("相談")) return "reservation.html";
  if (pageName.includes("商品") || pageName.includes("物件") || pageName.includes("メニュー") || pageName.includes("料金")) return `products-${index}.html`;
  if (pageName.includes("スタッフ") || pageName.includes("医師") || pageName.includes("講師")) return "people.html";
  if (pageName.includes("求人") || pageName.includes("転職") || pageName.includes("採用")) return "recruit.html";
  if (pageName.includes("ログイン")) return "login.html";
  if (pageName.includes("FAQ") || pageName.includes("よくある質問")) return "faq.html";
  return `page-${index + 1}.html`;
}

function fileNamesForPages(pages: DemoPlanJson["pages"]) {
  const usedFileNames = new Map<string, number>();

  return pages.map((page, index) => {
    const baseFileName = fileNameFor(page.name, index);
    const count = usedFileNames.get(baseFileName) ?? 0;
    const fileName = count === 0
      ? baseFileName
      : baseFileName.replace(".html", `-${count + 1}.html`);

    usedFileNames.set(baseFileName, count + 1);

    return fileName;
  });
}

function uniqueStrings(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function pageItemsFor(page: DemoPlanJson["pages"][number], variant = pageVariantFor(page)) {
  const source = uniqueStrings(page.highlights && page.highlights.length > 0 ? page.highlights : page.sections);

  if (source.length > 0) return source;
  if (variant === "about") return ["理念", "沿革", "対応領域", "会社情報"];
  if (variant === "services") return ["主要サービス", "比較ポイント", "導入の流れ", "サポート範囲"];
  if (variant === "people") return ["担当スタッフ", "得意な施術", "カウンセリング方針", "サロンでの過ごし方"];
  if (variant === "product") return ["特徴", "選び方", "料金目安", "相談導線"];
  if (variant === "reservation") return ["希望日時", "サービス選択", "事前確認", "受付完了"];
  if (variant === "contact") return ["相談内容", "希望時期", "連絡先", "確認事項"];
  if (variant === "works") return ["課題", "提案", "実施内容", "成果"];
  if (variant === "content") return ["お知らせ", "専門コラム", "事例紹介", "運用情報"];
  if (variant === "faq") return ["サービス内容について", "相談方法について", "公開後の運用について", "準備物について"];
  return ["概要", "特徴", "導線", "次の行動"];
}

function pageBodyCopy(plan: DemoPlanJson, page: DemoPlanJson["pages"][number], slot: "summary" | "visual" | "guide") {
  const variant = pageVariantFor(page);
  const company = plan.company.name;

  if (variant === "about") {
    if (slot === "summary") return `${company}の姿勢、対応領域、相談しやすさを整理し、初めて訪れる人にも信頼できる会社像として伝えます。`;
    if (slot === "visual") return "理念、沿革、体制を分けて見せることで、単なる会社情報ではなく判断材料として読み進められる構成にします。";
    return "会社の背景と強みを短時間で理解できるよう、文章量と視線の流れを調整しています。";
  }

  if (variant === "services") {
    if (slot === "summary") return `${company}が提供する内容を比較しやすく整理し、閲覧者が自分に合う相談内容を選べるページにします。`;
    if (slot === "visual") return "サービスごとの違い、対象者、相談後の流れを分けて表示し、検討時の迷いを減らします。";
    return "導入前の課題から相談後の流れまでを順番に見せ、問い合わせ前の納得感を高めます。";
  }

  if (variant === "product") {
    if (slot === "summary") return "商品やメニューの違い、選び方、相談導線をまとめ、短時間で比較できるページにします。";
    if (slot === "visual") return "一覧、詳細、問い合わせへの流れを近くに配置し、スマートフォンでも選びやすくします。";
    return "価格や特徴だけでなく、どのような人に向いているかまで伝える構成です。";
  }

  if (variant === "reservation") {
    if (slot === "summary") return "希望日時、内容選択、事前確認を一つの流れにまとめ、予約前の不安を減らします。";
    if (slot === "visual") return "空き状況と確認事項を視覚的に分け、来店や相談までの行動を分かりやすくします。";
    return "予約操作に必要な情報だけを順番に見せ、途中離脱を防ぐ導線にします。";
  }

  if (variant === "contact") {
    if (slot === "summary") return "相談内容、希望時期、連絡先を自然に入力できるようにし、問い合わせの心理的な負担を下げます。";
    if (slot === "visual") return "入力項目を絞り込み、初回相談で必要な情報だけを迷わず送れるフォーム構成にします。";
    return "問い合わせ後の流れも見せることで、送信前の不安を減らします。";
  }

  if (variant === "works") {
    if (plan.industry.includes("美容")) {
      if (slot === "summary") return "施術前の悩み、ケア方針、施術後の変化、お客様の声を一連の流れで見せ、相談前の安心感を高めます。";
      if (slot === "visual") return "悩みとケア方針をカードで分け、仕上がりのイメージが自然に伝わる構成にします。";
      return "施術事例を単なる実績ではなく、初回相談の判断材料として読みやすく整理します。";
    }

    if (slot === "summary") return "課題、提案、実施内容、成果を一連のストーリーとして見せ、依頼前の信頼を高めます。";
    if (slot === "visual") return "成果指標と具体的な取り組みを並べ、読み手が実績を判断しやすい構成にします。";
    return "単なる実績一覧ではなく、相談後のイメージが湧く事例ページとして設計します。";
  }

  if (variant === "people") {
    if (slot === "summary") return `${company}のスタッフの雰囲気、得意分野、カウンセリング方針を伝え、初回でも相談しやすい印象を作ります。`;
    if (slot === "visual") return "担当者の人柄と施術への考え方をプロフィールカードで見せ、来店前の安心感につなげます。";
    return "予約前に確認したいスタッフ情報を整理し、指名や相談へ自然につなげます。";
  }

  if (variant === "content") {
    if (slot === "summary") return "お知らせ、専門コラム、事例を分けて掲載し、継続的な接点と検索流入を作ります。";
    if (slot === "visual") return "記事カテゴリと更新日を見やすく配置し、必要な情報へすぐ進める情報発信ページにします。";
    return "読み物として自然に回遊できるよう、見出しとカテゴリの粒度を整えます。";
  }

  if (variant === "faq") {
    if (slot === "summary") return "問い合わせ前によく確認される内容を先回りして整理し、相談への不安を減らします。";
    if (slot === "visual") return "質問と回答を短く分け、料金、流れ、準備物などを探しやすくします。";
    return "FAQから問い合わせへ自然につながるよう、回答の順番と導線を調整します。";
  }

  return page.description || page.role;
}

function itemDescription(plan: DemoPlanJson, page: DemoPlanJson["pages"][number], item: string, index: number) {
  const variant = pageVariantFor(page);
  const company = plan.company.name;

  if (plan.industry.includes("美容")) {
    if (variant === "services") {
      if (item.includes("施術") || item.includes("メニュー")) return "フェイシャル、ボディケア、カウンセリングなどを分けて掲載し、初めての方でも選びやすくします。";
      if (item.includes("スタッフ")) return "担当スタッフの雰囲気、得意な施術、相談しやすさを伝え、来店前の安心感につなげます。";
      if (item.includes("料金")) return "施術時間、料金目安、初回相談の流れを並べ、予約前に比較しやすい構成にします。";
      if (item.includes("予約")) return "希望メニューと日時を迷わず選べる導線を用意し、スマートフォンからの予約をしやすくします。";
    }

    if (variant === "product") {
      if (item.includes("料金")) return "料金、所要時間、施術内容を同じ粒度で見せ、メニュー選びの不安を減らします。";
      if (item.includes("カウンセリング")) return "肌質や悩みに合わせた提案ができることを、初回相談の流れと一緒に伝えます。";
      return `${item}の特徴、向いている悩み、予約前の確認ポイントを分かりやすく整理します。`;
    }

    if (variant === "reservation") {
      const copies = [
        "希望する施術メニューを先に選べるようにし、予約前の迷いを減らします。",
        "空き時間を確認しやすく見せ、来店できる候補日を選びやすくします。",
        "肌悩みや相談内容を事前に伝えられるようにし、当日のカウンセリングをスムーズにします。",
        "予約後の連絡方法や来店前の注意点を短く案内します。",
      ];

      return copies[index % copies.length];
    }

    if (variant === "contact") {
      const copies = [
        "メニュー相談、空き状況、肌悩みなどを選びやすい形で受け付けます。",
        "希望日時や連絡方法を整理し、サロン側が返信しやすい内容にします。",
        "初回でも問い合わせしやすいよう、必須項目を絞ったフォームにします。",
        "予約前に確認したい内容を自由に書ける余白を残します。",
      ];

      return copies[index % copies.length];
    }

    if (variant === "works") {
      const copies = [
        "施術前の悩みや希望を短く整理し、相談しやすい雰囲気を作ります。",
        "施術内容やケア方針を分かりやすく見せ、信頼につなげます。",
        "施術後の変化やお客様の声を、上品な見せ方で掲載します。",
        "次回予約や相談へ自然につながる導線を配置します。",
      ];

      return copies[index % copies.length];
    }

    if (variant === "people") {
      const copies = [
        "担当者の雰囲気や得意なケアを伝え、初回でも相談しやすい印象を作ります。",
        "カウンセリング方針を分かりやすく掲載し、悩みに合わせた提案ができることを伝えます。",
        "施術中の過ごし方やサロンの空気感を言葉で補い、来店前の不安を減らします。",
        "予約前に確認したいスタッフ情報を整理し、指名や相談につなげます。",
      ];

      return copies[index % copies.length];
    }
  }

  const patterns: Record<string, string[]> = {
    about: [
      `${company}が大切にしている考え方を、初めての閲覧者にも伝わる言葉で掲載します。`,
      "対応できる領域と相談しやすい範囲を整理し、依頼前の不安を減らします。",
      "選ばれている理由を具体的な取り組みとして見せ、信頼形成につなげます。",
      "所在地、連絡先、基本情報を分かりやすくまとめます。",
    ],
    services: [
      `${item}の対象者、内容、相談後の流れを分けて説明します。`,
      "比較しやすい見せ方で、閲覧者が自分に合う内容を判断できるようにします。",
      "利用前の不安と期待できる変化をセットで伝えます。",
      "問い合わせにつながる確認ポイントを近くに配置します。",
    ],
    product: [
      `${item}の特徴と選び方をカード形式で整理します。`,
      "詳細確認から相談までを短い導線でつなぎます。",
      "価格や条件を比較しやすい粒度にまとめます。",
      "スマートフォンでも見やすい一覧として配置します。",
    ],
    reservation: [
      `${item}を最初に確認できるようにし、予約操作の迷いを減らします。`,
      "選択内容を段階的に整理し、入力負担を軽くします。",
      "来店前や相談前に必要な確認事項を短く提示します。",
      "送信後の流れまで見せ、安心して申し込める状態にします。",
    ],
    contact: [
      `${item}を入力しやすい順番に配置します。`,
      "回答に迷う項目を減らし、初回相談に必要な情報だけを残します。",
      "送信後の対応イメージを添え、問い合わせの不安を下げます。",
      "補足情報を自由に書ける余白を用意します。",
    ],
    works: [
      `${item}を事例の起点として見せ、背景を短く理解できるようにします。`,
      "実施した内容を具体化し、依頼後のイメージにつなげます。",
      "成果や変化を読みやすく整理します。",
      "次の相談につながる判断材料として掲載します。",
    ],
    people: [
      `${item}をプロフィールとして見せ、相談しやすい印象を作ります。`,
      "得意分野や対応方針を短く整理します。",
      "初めての方が安心できるよう、人柄が伝わる情報を配置します。",
      "次の予約や相談へ自然につながる導線を添えます。",
    ],
    content: [
      `${item}を定期的に発信し、検索流入と信頼形成につなげます。`,
      "専門性が伝わる見出しとカテゴリで読み進めやすくします。",
      "事例やノウハウへの回遊を自然に作ります。",
      "更新情報を分かりやすく見せ、再訪問の理由を作ります。",
    ],
    faq: [
      `${item}について、問い合わせ前に確認しやすい短い回答を用意します。`,
      "判断に必要な条件や流れを分かりやすく整理します。",
      "不明点が残る場合は問い合わせへ進める導線を近くに置きます。",
      "専門用語を避け、初めての人にも読みやすい表現にします。",
    ],
    standard: [
      `${item}をページ目的に合わせて整理します。`,
      "閲覧者が次に知りたい情報へ進みやすくします。",
      "必要な情報を短く分け、読みやすさを保ちます。",
      "問い合わせや相談につながる導線を配置します。",
    ],
  };
  const list = patterns[variant] ?? patterns.standard;

  return list[index % list.length];
}

function sectionForPage(plan: DemoPlanJson, page: DemoPlanJson["pages"][number]): DemoPlanSection {
  const pageTitle = page.headline || page.name;
  const pageDescription = pageBodyCopy(plan, page, "summary");
  const pageItems = pageItemsFor(page);
  const pageCta = page.primaryCta || plan.contentStrategy.ctaLabel;

  if (page.name.includes("会社")) {
    return {
      id: "about-main",
      type: "custom",
      title: pageTitle,
      subtitle: page.visualConcept || "会社の考え方、事業内容、強みを整理します",
      content: pageDescription,
      items: pageItems,
      ctaLabel: pageCta,
    };
  }

  if (page.name.includes("サービス") || page.name.includes("技術") || page.name.includes("設備") || page.name.includes("診療") || page.name.includes("コース")) {
    return {
      id: "services-main",
      type: "services",
      title: pageTitle,
      subtitle: page.visualConcept || "提供内容をわかりやすく比較できる構成",
      content: pageDescription,
      items: pageItems.length > 0 ? pageItems : plan.requiredFeatures,
      ctaLabel: pageCta,
    };
  }

  if (page.name.includes("お問い合わせ") || page.name.includes("予約") || page.name.includes("相談") || page.name.includes("無料体験") || page.name.includes("初診")) {
    return {
      id: "contact-main",
      type: "contact",
      title: pageTitle,
      subtitle: page.visualConcept || "相談前の不安を減らす問い合わせページ",
      content: pageDescription,
      items: pageItems,
      ctaLabel: pageCta,
    };
  }

  if (page.name.includes("実績") || page.name.includes("事例")) {
    return {
      id: "works-main",
      type: "caseStudies",
      title: pageTitle,
      subtitle: page.visualConcept || "導入前の課題から成果までを伝えます",
      content: pageDescription,
      items: pageItems,
      ctaLabel: pageCta,
    };
  }

  if (page.name.includes("講師") || page.name.includes("医師") || page.name.includes("スタッフ")) {
    return {
      id: "people-main",
      type: "custom",
      title: pageTitle,
      subtitle: page.visualConcept || "担当者の専門性、人柄、安心感を伝えます",
      content: pageDescription,
      items: pageItems,
      ctaLabel: pageCta,
    };
  }

  if (page.name.includes("ブログ") || page.name.includes("ニュース") || page.name.includes("求人") || page.name.includes("転職")) {
    return {
      id: "content-main",
      type: "custom",
      title: pageTitle,
      subtitle: page.visualConcept || "継続的な情報発信で信頼と検索流入を増やします",
      content: pageDescription,
      items: pageItems,
      ctaLabel: pageCta,
    };
  }

  if (page.name.includes("商品") || page.name.includes("物件") || page.name.includes("メニュー") || page.name.includes("料金")) {
    return {
      id: "product-main",
      type: "features",
      title: pageTitle,
      subtitle: page.visualConcept || "比較しやすく、次の行動へ進みやすい一覧ページ",
      content: pageDescription,
      items: pageItems,
      ctaLabel: pageCta,
    };
  }

  if (page.name.includes("FAQ") || page.name.includes("よくある質問")) {
    return {
      id: "faq-main",
      type: "faq",
      title: pageTitle,
      subtitle: page.visualConcept || "問い合わせ前の疑問を解消します",
      content: pageDescription,
      items: pageItems,
      ctaLabel: pageCta,
    };
  }

  return {
    id: "page-main",
    type: "custom",
    title: pageTitle,
    subtitle: page.visualConcept || page.role,
    content: pageDescription,
    items: pageItems,
    ctaLabel: pageCta,
  };
}

function renderSubPageHero(plan: DemoPlanJson, page: DemoPlanJson["pages"][number]) {
  const variant = pageVariantFor(page);
  const items = pageItemsFor(page, variant);
  const title = page.headline || page.name;
  const description = page.description || page.role;
  const cta = page.primaryCta || plan.contentStrategy.ctaLabel;

  if (variant === "about") {
    return `
      <section class="sub-hero hero-about">
        <div class="vertical-title">${escapeHtml(page.name)}</div>
        <div class="hero-copy">
          <div class="section-label">${escapeHtml(displayLabel("company editorial"))}</div>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(description)}</p>
        </div>
        <div class="about-signature">
          <span>${escapeHtml(plan.industry)}</span>
          <strong>${escapeHtml(plan.company.name.slice(0, 1))}</strong>
          <p>${escapeHtml(page.visualConcept || "会社の考え方と信頼性を編集記事のように見せるページ")}</p>
        </div>
      </section>
    `;
  }

  if (variant === "services") {
    return `
      <section class="sub-hero hero-services">
        <div class="hero-copy">
          <div class="section-label">${escapeHtml(displayLabel("service architecture"))}</div>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(description)}</p>
          <a class="button" href="#page-action">${escapeHtml(cta)}</a>
        </div>
        <div class="service-board">
          ${items.slice(0, 5).map((item, index) => `
            <article class="${index === 0 ? "primary" : ""}">
              <span>サービス ${index + 1}</span>
              <strong>${escapeHtml(item)}</strong>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (variant === "product") {
    return `
      <section class="sub-hero hero-product">
        <div class="commerce-ribbon">
          ${items.slice(0, 3).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
        </div>
        <div class="hero-copy">
          <div class="section-label">${escapeHtml(displayLabel("catalog experience"))}</div>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(description)}</p>
        </div>
        <div class="product-hero-grid">
          ${items.slice(0, 4).map((item) => `
            <article>
              <div></div>
              <strong>${escapeHtml(item)}</strong>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (variant === "reservation") {
    return `
      <section class="sub-hero hero-reservation">
        <div class="reservation-copy">
          <div class="section-label">${escapeHtml(displayLabel("booking experience"))}</div>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(description)}</p>
          <a class="button" href="#page-action">${escapeHtml(cta)}</a>
        </div>
        <div class="reservation-calendar-large">
          ${["月", "火", "水", "木", "金", "土"].map((day, index) => `
            <article class="${index === 1 || index === 3 || index === 5 ? "active" : ""}">
              <span>${escapeHtml(day)}</span>
              <strong>${index === 1 || index === 3 || index === 5 ? "受付可" : "確認"}</strong>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (variant === "contact") {
    return `
      <section class="sub-hero hero-action">
        <div class="hero-copy">
          <div class="section-label">${escapeHtml(displayLabel("contact flow"))}</div>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(description)}</p>
        </div>
        <div class="action-hero-card">
          <span>ステップ 01</span>
          <strong>${escapeHtml(cta)}</strong>
          <p>${escapeHtml(page.visualConcept || "入力しやすい相談導線を設計")}</p>
          <button>${escapeHtml(cta)}</button>
        </div>
      </section>
    `;
  }

  if (variant === "works") {
    const labels = plan.industry.includes("美容")
      ? ["悩み", "ケア方針", "変化"]
      : ["課題", "対応", "成果"];

    return `
      <section class="sub-hero hero-works">
        <div class="hero-copy">
          <div class="section-label">${escapeHtml(displayLabel("case study"))}</div>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(description)}</p>
        </div>
        <div class="result-metrics">
          ${labels.map((label, index) => `
            <article>
              <span>${label}</span>
              <strong>${escapeHtml(items[index] ?? label)}</strong>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (variant === "people") {
    return `
      <section class="sub-hero hero-people">
        <div class="hero-copy">
          <div class="section-label">${escapeHtml(displayLabel("profile"))}</div>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(description)}</p>
        </div>
        <div class="people-hero-grid">
          ${items.slice(0, 4).map((item, index) => `
            <article>
              <span>プロフィール ${index + 1}</span>
              <strong>${escapeHtml(item)}</strong>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (variant === "content") {
    return `
      <section class="sub-hero hero-media">
        <div class="magazine-label">${escapeHtml(plan.industry)}</div>
        <div class="hero-copy">
          <div class="section-label">${escapeHtml(displayLabel("media page"))}</div>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(description)}</p>
        </div>
        <div class="headline-list">
          ${items.slice(0, 4).map((item, index) => `
            <article>
              <span>2026.07.${String(index + 1).padStart(2, "0")}</span>
              <strong>${escapeHtml(item)}</strong>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (variant === "faq") {
    return `
      <section class="sub-hero hero-faq">
        <div class="hero-copy">
          <div class="section-label">${escapeHtml(displayLabel("question guide"))}</div>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(description)}</p>
        </div>
        <div class="faq-hero-stack">
          ${items.slice(0, 4).map((item) => `
            <details open>
              <summary>${escapeHtml(item)}</summary>
              <p>初回相談で確認しやすい形に整理します。</p>
            </details>
          `).join("")}
        </div>
      </section>
    `;
  }

  return `
    <section class="sub-hero hero-standard">
      <div class="hero-copy">
        <div class="section-label">${escapeHtml(plan.siteType)} / ${escapeHtml(page.name)}</div>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
        <div class="sub-tags">
          ${items.slice(0, 5).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
        </div>
      </div>
      <div class="hero-panel">
        <div class="hero-tags">
          <span>${escapeHtml(plan.industry)}</span>
          <span>${escapeHtml(page.visualConcept || page.role)}</span>
        </div>
        <div class="large">${escapeHtml(page.name.slice(0, 2))}</div>
        <p>${escapeHtml(cta)}</p>
      </div>
    </section>
  `;
}

function renderSubPageVisual(plan: DemoPlanJson, page: DemoPlanJson["pages"][number]) {
  const variant = pageVariantFor(page);
  const items = pageItemsFor(page, variant);

  if (variant === "about") {
    return `
      <section class="sub-block about-layout">
        <div class="portrait-panel">
          <span>会社情報</span>
          <strong>${escapeHtml(plan.company.name.slice(0, 1))}</strong>
          <p>${escapeHtml(plan.industry)}の顧客に向けた信頼設計</p>
        </div>
        <div class="timeline-panel">
          ${items.slice(0, 4).map((item, index) => `
            <article>
              <span>0${index + 1}</span>
              <strong>${escapeHtml(item)}</strong>
              <p>${escapeHtml(itemDescription(plan, page, item, index))}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (variant === "services") {
    return `
      <section class="sub-block service-layout">
        <div>
          <div class="section-label">${escapeHtml(displayLabel("service matrix"))}</div>
          <h2>比較しやすいサービス構成</h2>
          <p>${escapeHtml(pageBodyCopy(plan, page, "visual"))}</p>
        </div>
        <div class="service-matrix">
          ${items.slice(0, 6).map((item, index) => `
            <article class="${index === 1 ? "featured" : ""}">
              <span>${index === 0 ? "導入" : index === 1 ? "主力" : "追加"}</span>
              <strong>${escapeHtml(item)}</strong>
              <p>${escapeHtml(itemDescription(plan, page, item, index))}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (variant === "product") {
    return `
      <section class="sub-block product-layout">
        <div>
          <div class="section-label">${escapeHtml(displayLabel("catalog"))}</div>
          <h2>選びやすい一覧と詳細導線</h2>
          <p>${escapeHtml(pageBodyCopy(plan, page, "visual"))}</p>
        </div>
        <div class="catalog-grid">
          ${items.slice(0, 6).map((item, index) => `
            <article>
              <div class="catalog-image"></div>
              <strong>${escapeHtml(item)}</strong>
              <span>${index % 2 === 0 ? "おすすめ" : "詳細を見る"}</span>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (variant === "reservation") {
    return `
      <section class="sub-block reservation-layout">
        <div>
          <div class="section-label">${escapeHtml(displayLabel("schedule"))}</div>
          <h2>${escapeHtml(page.primaryCta || plan.contentStrategy.ctaLabel)}</h2>
          <p>${escapeHtml(pageBodyCopy(plan, page, "visual"))}</p>
        </div>
        <div class="schedule-board">
          ${["希望日時", "サービス選択", "確認事項", "送信完了"].map((item, index) => `
            <article>
              <span>${index + 1}</span>
              <strong>${escapeHtml(item)}</strong>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (variant === "contact") {
    return `
      <section class="sub-block booking-layout">
        <div>
          <div class="section-label">${escapeHtml(displayLabel("contact"))}</div>
          <h2>${escapeHtml(page.primaryCta || plan.contentStrategy.ctaLabel)}</h2>
          <p>${escapeHtml(pageBodyCopy(plan, page, "visual"))}</p>
        </div>
        <div class="booking-card">
          <div class="field">お名前</div>
          <div class="field">会社名・店舗名</div>
          <div class="field large">相談内容</div>
          <button>${escapeHtml(page.primaryCta || plan.contentStrategy.ctaLabel)}</button>
        </div>
      </section>
    `;
  }

  if (variant === "works") {
    const labels = plan.industry.includes("美容")
      ? ["悩み", "ケア", "変化", "声"]
      : ["課題", "提案", "実施", "成果"];

    return `
      <section class="sub-block works-layout">
        <div>
          <div class="section-label">${escapeHtml(displayLabel("case study"))}</div>
          <h2>${escapeHtml(plan.industry.includes("美容") ? "施術の変化が伝わる事例構成" : "成果が伝わる事例構成")}</h2>
          <p>${escapeHtml(pageBodyCopy(plan, page, "visual"))}</p>
        </div>
        <div class="case-flow">
          ${labels.map((label, index) => `
            <article>
              <span>${escapeHtml(label)}</span>
              <strong>${escapeHtml(items[index] ?? label)}</strong>
              <p>${escapeHtml(itemDescription(plan, page, items[index] ?? label, index))}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (variant === "people") {
    return `
      <section class="sub-block people-layout">
        <div>
          <div class="section-label">${escapeHtml(displayLabel("team"))}</div>
          <h2>相談しやすい人柄と専門性を伝えます</h2>
          <p>${escapeHtml(pageBodyCopy(plan, page, "visual"))}</p>
        </div>
        <div class="people-card-grid">
          ${items.slice(0, 4).map((item, index) => `
            <article>
              <div class="avatar-mark">${escapeHtml(item.slice(0, 1))}</div>
              <strong>${escapeHtml(item)}</strong>
              <p>${escapeHtml(itemDescription(plan, page, item, index))}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (variant === "content") {
    return `
      <section class="sub-block media-layout">
        <div>
          <div class="section-label">${escapeHtml(displayLabel("editorial"))}</div>
          <h2>読み進めやすい情報発信ページ</h2>
          <p>${escapeHtml(pageBodyCopy(plan, page, "visual"))}</p>
        </div>
        <div class="article-grid">
          ${items.slice(0, 5).map((item, index) => `
            <article>
              <span>2026.07.${String(index + 1).padStart(2, "0")}</span>
              <strong>${escapeHtml(item)}</strong>
              <p>${escapeHtml(itemDescription(plan, page, item, index))}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  if (variant === "faq") {
    return `
      <section class="sub-block faq-layout">
        <div>
          <div class="section-label">FAQ</div>
          <h2>相談前の疑問を解消</h2>
          <p>${escapeHtml(pageBodyCopy(plan, page, "visual"))}</p>
        </div>
        <div class="faq-list">
          ${items.slice(0, 5).map((item, index) => `
            <details open>
              <summary>${escapeHtml(item)}</summary>
              <p>${escapeHtml(itemDescription(plan, page, item, index))}</p>
            </details>
          `).join("")}
        </div>
      </section>
    `;
  }

  return `
    <section class="sub-block standard-layout">
      <div>
        <div class="section-label">${escapeHtml(displayLabel("page design"))}</div>
        <h2>${escapeHtml(page.headline || page.name)}</h2>
        <p>${escapeHtml(pageBodyCopy(plan, page, "visual"))}</p>
      </div>
      <div class="standard-grid">
        ${items.slice(0, 4).map((item, index) => `
          <article>
            <span>0${index + 1}</span>
            <strong>${escapeHtml(item)}</strong>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderSubPageSummary(plan: DemoPlanJson, page: DemoPlanJson["pages"][number], pageSection: DemoPlanSection) {
  const pageItems = pageItemsFor(page);

  return `
    <section class="summary-block">
      <div>
        <div class="section-label">${escapeHtml(displayLabel("page strategy"))}</div>
        <h2>${escapeHtml(pageSection.title)}</h2>
        <p>${escapeHtml(pageSection.content)}</p>
      </div>
      <div class="summary-list">
        ${pageItems.slice(0, 4).map((item, index) => `
          <div>
            <span>ポイント ${index + 1}</span>
            <strong>${escapeHtml(item)}</strong>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderSubPageNotice(plan: DemoPlanJson, page: DemoPlanJson["pages"][number]) {
  return `
    <section class="demo-note">
      <div>
        <div class="section-label">${escapeHtml(displayLabel("demo notice"))}</div>
        <h2>このページは基礎展示用です</h2>
        <p>この分岐ページは初回確認のためのデモです。写真、詳細文章、フォーム連携、運用設計は実案件で調整します。制作ノウハウと技術的な詳細は保護のため一部非公開にしています。</p>
      </div>
      <a class="button" href="#contact">${escapeHtml(page.primaryCta || plan.contentStrategy.ctaLabel)}</a>
    </section>
  `;
}

function renderSubPageBody(plan: DemoPlanJson, page: DemoPlanJson["pages"][number]) {
  const pageSection = sectionForPage(plan, page);
  const variant = pageVariantFor(page);
  const summary = renderSubPageSummary(plan, page, pageSection);
  const visual = renderSubPageVisual(plan, page);
  const notice = renderSubPageNotice(plan, page);

  if (variant === "about") {
    return `
      <div class="sub-sections about-sections">
        ${visual}
        ${summary}
        ${notice}
      </div>
    `;
  }

  if (variant === "services") {
    return `
      <div class="sub-sections services-sections">
        ${visual}
        <section class="service-deep-dive">
          <div>
            <div class="section-label">${escapeHtml(displayLabel("service flow"))}</div>
            <h2>${escapeHtml(pageSection.title)}</h2>
            <p>${escapeHtml(pageSection.content)}</p>
          </div>
          <div class="flow-rail">
            ${pageItemsFor(page).slice(0, 4).map((item, index) => `
              <article>
                <span>${String(index + 1).padStart(2, "0")}</span>
                <strong>${escapeHtml(item)}</strong>
                <p>${escapeHtml(itemDescription(plan, page, item, index))}</p>
              </article>
            `).join("")}
          </div>
        </section>
        ${notice}
      </div>
    `;
  }

  if (variant === "product") {
    return `
      <div class="sub-sections product-sections">
        ${visual}
        ${summary}
        ${notice}
      </div>
    `;
  }

  if (variant === "reservation") {
    return `
      <div class="sub-sections reservation-sections">
        ${visual}
        <section class="reservation-guide">
          <div>
            <div class="section-label">${escapeHtml(displayLabel("booking steps"))}</div>
            <h2>空き状況から確認事項まで一画面で整理</h2>
            <p>${escapeHtml(pageBodyCopy(plan, page, "guide"))}</p>
          </div>
          <div class="reservation-steps">
            ${["内容を選ぶ", "希望日時を選ぶ", "事前情報を入力", "受付完了"].map((item, index) => `
              <article>
                <span>${String(index + 1).padStart(2, "0")}</span>
                <strong>${escapeHtml(item)}</strong>
              </article>
            `).join("")}
          </div>
        </section>
        ${notice}
      </div>
    `;
  }

  if (variant === "contact") {
    return `
      <div class="sub-sections action-sections">
        ${visual}
        <section class="contact-guide">
          <div>
            <div class="section-label">${escapeHtml(displayLabel("before contact"))}</div>
            <h2>相談前に伝える内容を迷わせません</h2>
            <p>${escapeHtml(pageBodyCopy(plan, page, "guide"))}</p>
          </div>
          <div class="contact-steps">
            ${["相談内容を選ぶ", "希望時期を入力", "担当者から連絡"].map((item, index) => `
              <article>
                <span>ステップ ${index + 1}</span>
                <strong>${escapeHtml(item)}</strong>
              </article>
            `).join("")}
          </div>
        </section>
        ${notice}
      </div>
    `;
  }

  if (variant === "works") {
    return `
      <div class="sub-sections works-sections">
        ${visual}
        ${summary}
        ${notice}
      </div>
    `;
  }

  if (variant === "content") {
    return `
      <div class="sub-sections media-sections">
        ${visual}
        ${summary}
        ${notice}
      </div>
    `;
  }

  if (variant === "faq") {
    return `
      <div class="sub-sections faq-sections">
        ${visual}
        ${notice}
      </div>
    `;
  }

  return `
    <div class="sub-sections">
      ${summary}
      ${visual}
      ${notice}
    </div>
  `;
}

function renderSubPageHtml(plan: DemoPlanJson, page: DemoPlanJson["pages"][number]) {
  const colors = colorFor(plan.visualStyle.mainColor);
  const variant = pageVariantFor(page);
  const visualClass = styleClass(plan.visualStyle.designStyle);
  const industryVisualClass = industryClass(plan.industry);
  const pageFileNames = fileNamesForPages(plan.pages);

  return `<!doctype html>
<html lang="ja" class="${visualClass} ${industryVisualClass} subpage-${variant}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(plan.company.name)} | ${escapeHtml(page.name)}</title>
  <style>
    :root {
      --accent: ${colors.accent};
      --accent2: ${colors.accent2};
      --soft: ${colors.soft};
      --text: #18181b;
      --muted: #71717a;
      --line: #e4e4e7;
      --bg: #fafafa;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif;
      color: var(--text);
      background: var(--bg);
      letter-spacing: 0;
    }
    header {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      padding: 18px clamp(20px, 5vw, 72px);
      border-bottom: 1px solid rgba(228, 228, 231, 0.78);
      background: rgba(250, 250, 250, 0.88);
      backdrop-filter: blur(16px);
    }
    .brand { font-weight: 800; }
    nav { display: flex; flex-wrap: wrap; gap: 16px; color: var(--muted); font-size: 14px; }
    nav a { color: inherit; text-decoration: none; }
    nav a.is-current { color: var(--accent); font-weight: 800; }
    .section-label {
      width: fit-content;
      border-radius: 999px;
      padding: 7px 11px;
      color: var(--accent);
      background: var(--soft);
      font-size: 12px;
      font-weight: 800;
    }
    .sub-hero {
      display: grid;
      gap: clamp(24px, 5vw, 56px);
      align-items: center;
      padding: clamp(56px, 9vw, 108px) clamp(20px, 5vw, 72px) clamp(36px, 6vw, 72px);
      background:
        radial-gradient(circle at 82% 18%, var(--soft), transparent 30%),
        linear-gradient(135deg, #fff 0%, var(--soft) 100%);
    }
    .hero-standard { grid-template-columns: minmax(0, 1fr) minmax(300px, .72fr); }
    .hero-about {
      grid-template-columns: 90px minmax(0, 1fr) minmax(280px, .55fr);
      min-height: 560px;
      background:
        linear-gradient(90deg, #18181b 0 90px, transparent 90px),
        linear-gradient(135deg, #fff 0%, #f4f4f5 100%);
    }
    .vertical-title {
      writing-mode: vertical-rl;
      color: rgba(255,255,255,.78);
      font-size: 13px;
      font-weight: 850;
      letter-spacing: .16em;
      text-transform: uppercase;
      align-self: stretch;
      display: grid;
      place-items: center;
    }
    .about-signature {
      min-height: 360px;
      border-radius: 0;
      border-left: 1px solid rgba(24,24,27,.14);
      padding: 24px;
      display: grid;
      align-content: end;
      background: transparent;
    }
    .about-signature strong {
      font-size: clamp(80px, 12vw, 150px);
      line-height: .8;
    }
    .about-signature span { color: var(--accent); font-weight: 850; }
    .hero-services {
      grid-template-columns: minmax(0, .78fr) minmax(320px, 1.22fr);
      color: #fff;
      background:
        radial-gradient(circle at 85% 20%, rgba(255,255,255,.18), transparent 28%),
        linear-gradient(135deg, #101014, #27272a 48%, var(--accent));
    }
    .hero-services p, .hero-services .section-label { color: rgba(255,255,255,.74); }
    .hero-services .section-label { background: rgba(255,255,255,.12); }
    .service-board {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .service-board article {
      min-height: 132px;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 26px;
      background: rgba(255,255,255,.1);
      padding: 20px;
    }
    .service-board .primary {
      grid-row: span 2;
      background: rgba(255,255,255,.92);
      color: #18181b;
    }
    .service-board span, .service-board strong { display: block; }
    .service-board span { color: inherit; opacity: .68; font-size: 12px; font-weight: 850; text-transform: uppercase; }
    .service-board strong { margin-top: 10px; font-size: clamp(20px, 3vw, 34px); line-height: 1.1; }
    .hero-product {
      grid-template-columns: minmax(0, .28fr) minmax(0, .82fr) minmax(320px, .9fr);
      background:
        linear-gradient(90deg, var(--soft) 0 24%, #fff 24% 100%);
    }
    .commerce-ribbon {
      display: grid;
      gap: 12px;
      align-self: stretch;
      align-content: center;
    }
    .commerce-ribbon span {
      border-radius: 999px;
      background: #fff;
      border: 1px solid var(--line);
      padding: 12px 14px;
      color: var(--accent);
      font-size: 13px;
      font-weight: 850;
    }
    .product-hero-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .product-hero-grid article {
      border: 1px solid var(--line);
      border-radius: 26px;
      background: #fff;
      padding: 14px;
      box-shadow: 0 24px 60px rgba(15,23,42,.08);
    }
    .product-hero-grid article div {
      min-height: 110px;
      margin-bottom: 12px;
      border-radius: 18px;
      background: linear-gradient(135deg, var(--soft), rgba(255,255,255,.78));
    }
    .hero-action {
      grid-template-columns: minmax(0, .9fr) minmax(300px, .72fr);
      background:
        linear-gradient(135deg, #fff 0%, #f8fafc 52%, var(--soft) 100%);
    }
    .action-hero-card {
      display: grid;
      gap: 14px;
      border: 1px solid var(--line);
      border-radius: 34px;
      background: #fff;
      padding: 26px;
      box-shadow: 0 34px 90px rgba(15,23,42,.12);
    }
    .action-hero-card span { color: var(--accent); font-size: 12px; font-weight: 850; }
    .action-hero-card strong { font-size: clamp(28px, 4vw, 46px); line-height: 1.05; }
    .hero-reservation {
      grid-template-columns: minmax(0, .7fr) minmax(320px, 1.3fr);
      color: #fff;
      background:
        radial-gradient(circle at 80% 15%, rgba(255,255,255,.22), transparent 30%),
        linear-gradient(135deg, var(--accent), #18181b 72%);
    }
    .hero-reservation .section-label {
      color: #fff;
      background: rgba(255,255,255,.14);
    }
    .hero-reservation p { color: rgba(255,255,255,.76); }
    .reservation-copy {
      display: grid;
      gap: 18px;
      align-content: center;
    }
    .reservation-calendar-large {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }
    .reservation-calendar-large article {
      min-height: 150px;
      border: 1px solid rgba(255,255,255,.16);
      border-radius: 28px;
      padding: 20px;
      background: rgba(255,255,255,.1);
      display: grid;
      align-content: space-between;
    }
    .reservation-calendar-large article.active {
      color: #18181b;
      background: #fff;
    }
    .reservation-calendar-large span { font-size: 13px; font-weight: 850; opacity: .72; }
    .reservation-calendar-large strong { font-size: 28px; }
    .hero-works {
      grid-template-columns: minmax(0, .74fr) minmax(320px, 1.26fr);
      background: #18181b;
      color: #fff;
    }
    .hero-works p, .hero-works .section-label { color: rgba(255,255,255,.72); }
    .hero-works .section-label { background: rgba(255,255,255,.12); }
    .result-metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }
    .result-metrics article {
      min-height: 260px;
      border-radius: 30px;
      padding: 22px;
      display: grid;
      align-content: end;
      background: linear-gradient(145deg, rgba(255,255,255,.08), rgba(255,255,255,.18));
      border: 1px solid rgba(255,255,255,.14);
    }
    .result-metrics span { color: rgba(255,255,255,.58); font-size: 12px; font-weight: 850; }
    .result-metrics strong { margin-top: 10px; font-size: 22px; line-height: 1.25; }
    .hero-media {
      grid-template-columns: minmax(120px, .25fr) minmax(0, .85fr) minmax(320px, .9fr);
      background: #fff;
    }
    .hero-people {
      grid-template-columns: minmax(0, .78fr) minmax(320px, 1.22fr);
      background:
        linear-gradient(90deg, var(--soft) 0 28%, #fff 28% 100%);
    }
    .people-hero-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .people-hero-grid article {
      min-height: 170px;
      border: 1px solid var(--line);
      border-radius: 30px;
      padding: 22px;
      background: #fff;
      box-shadow: 0 24px 70px rgba(15,23,42,.08);
      display: grid;
      align-content: end;
    }
    .people-hero-grid span {
      color: var(--accent);
      font-size: 12px;
      font-weight: 850;
    }
    .people-hero-grid strong { margin-top: 8px; font-size: 22px; }
    .hero-faq {
      grid-template-columns: minmax(0, .78fr) minmax(320px, 1.22fr);
      background:
        radial-gradient(circle at 12% 24%, var(--soft), transparent 30%),
        linear-gradient(135deg, #fff 0%, #f8fafc 100%);
    }
    .faq-hero-stack {
      display: grid;
      gap: 12px;
    }
    .faq-hero-stack details {
      border: 1px solid var(--line);
      border-radius: 22px;
      background: #fff;
      padding: 18px;
      box-shadow: 0 18px 50px rgba(15,23,42,.06);
    }
    .faq-hero-stack summary { cursor: pointer; font-weight: 850; }
    .hero-process {
      grid-template-columns: minmax(320px, 1fr) minmax(0, .82fr);
      background:
        linear-gradient(135deg, var(--soft) 0%, #fff 46%, #18181b 46%, #18181b 100%);
    }
    .hero-process .hero-copy { color: #fff; }
    .hero-process .hero-copy p { color: rgba(255,255,255,.72); }
    .hero-process .section-label { color: #fff; background: rgba(255,255,255,.14); }
    .process-line {
      display: grid;
      gap: 10px;
      align-self: stretch;
      align-content: center;
    }
    .process-line article {
      display: grid;
      grid-template-columns: 64px 1fr;
      gap: 14px;
      align-items: center;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: #fff;
      padding: 12px 16px;
      box-shadow: 0 18px 50px rgba(15,23,42,.06);
    }
    .process-line span {
      display: grid;
      place-items: center;
      height: 44px;
      border-radius: 999px;
      color: #fff;
      background: var(--accent);
      font-size: 13px;
      font-weight: 900;
    }
    .process-line strong { font-size: 16px; }
    .magazine-label {
      align-self: stretch;
      display: grid;
      place-items: center;
      border-right: 1px solid var(--line);
      color: var(--accent);
      font-size: 13px;
      font-weight: 900;
      writing-mode: vertical-rl;
      letter-spacing: .18em;
    }
    .headline-list {
      display: grid;
      gap: 10px;
      border-left: 1px solid var(--line);
      padding-left: 24px;
    }
    .headline-list article {
      border-bottom: 1px solid var(--line);
      padding: 14px 0;
    }
    .headline-list span { color: var(--accent); font-size: 12px; font-weight: 850; }
    .headline-list strong { display: block; margin-top: 6px; font-size: 18px; }
    .sub-hero h1 {
      max-width: 920px;
      margin: 16px 0 0;
      font-size: clamp(42px, 7vw, 78px);
      line-height: 1.03;
      font-weight: 780;
    }
    .sub-hero p, .sub-block p, .demo-note p {
      color: var(--muted);
      font-size: 16px;
      line-height: 1.9;
    }
    .sub-hero p { max-width: 760px; font-size: 18px; }
    .hero-panel {
      min-height: 360px;
      border-radius: 36px;
      padding: 24px;
      color: #fff;
      background:
        radial-gradient(circle at 20% 20%, rgba(255,255,255,.82), transparent 28%),
        linear-gradient(145deg, var(--accent), var(--accent2));
      box-shadow: 0 40px 110px rgba(15,23,42,.18);
      display: grid;
      align-content: space-between;
      overflow: hidden;
    }
    .hero-panel .large {
      font-size: clamp(48px, 8vw, 92px);
      font-weight: 850;
      line-height: .9;
    }
    .hero-tags, .sub-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .hero-tags span, .sub-tags span {
      border-radius: 999px;
      padding: 8px 11px;
      background: rgba(255,255,255,.18);
      font-size: 13px;
      font-weight: 750;
    }
    .sub-tags span { color: #3f3f46; background: #fff; border: 1px solid var(--line); }
    main { overflow: hidden; }
    .sub-sections {
      display: grid;
      gap: 22px;
      padding: 30px clamp(20px, 5vw, 72px) 80px;
    }
    .about-sections { background: linear-gradient(90deg, #f4f4f5 0 18%, transparent 18%); }
    .services-sections {
      background:
        linear-gradient(180deg, #18181b 0 210px, transparent 210px);
    }
    .product-sections {
      background:
        linear-gradient(90deg, var(--soft) 0 30%, transparent 30%);
    }
    .action-sections { background: linear-gradient(180deg, var(--soft) 0 260px, transparent 260px); }
    .reservation-sections {
      background:
        linear-gradient(90deg, #18181b 0 24%, transparent 24%),
        linear-gradient(180deg, var(--soft) 0 260px, transparent 260px);
    }
    .works-sections { background: #f4f4f5; }
    .media-sections { background: #fff; }
    .faq-sections { background: linear-gradient(135deg, #fff 0%, var(--soft) 100%); }
    .sub-block, .summary-block, .demo-note {
      border: 1px solid var(--line);
      border-radius: 32px;
      background: #fff;
      padding: clamp(24px, 4vw, 44px);
      box-shadow: 0 24px 80px rgba(15, 23, 42, 0.06);
    }
    .sub-block {
      display: grid;
      grid-template-columns: minmax(0, .78fr) minmax(280px, 1.22fr);
      gap: 28px;
      align-items: center;
    }
    h2 { margin: 10px 0 0; font-size: clamp(28px, 4vw, 48px); line-height: 1.12; }
    .summary-block {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(280px, .8fr);
      gap: 24px;
      background: linear-gradient(135deg, #fff 0%, var(--soft) 100%);
    }
    .summary-list, .timeline-panel, .service-matrix, .catalog-grid, .case-flow, .article-grid, .standard-grid, .schedule-board, .reservation-steps, .people-card-grid {
      display: grid;
      gap: 12px;
    }
    .summary-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .summary-list div, .timeline-panel article, .service-matrix article, .catalog-grid article, .case-flow article, .article-grid article, .standard-grid article, .schedule-board article, .reservation-steps article, .people-card-grid article, .portrait-panel, .booking-card, .faq-list details {
      border: 1px solid var(--line);
      border-radius: 22px;
      background: rgba(255,255,255,.86);
      padding: 18px;
    }
    .summary-list strong, .timeline-panel strong, .service-matrix strong, .catalog-grid strong, .case-flow strong, .article-grid strong, .standard-grid strong, .schedule-board strong, .reservation-steps strong, .people-card-grid strong {
      display: block;
      margin-top: 8px;
      font-size: 18px;
    }
    .summary-list span, .timeline-panel span, .service-matrix span, .catalog-grid span, .case-flow span, .article-grid span, .standard-grid span, .schedule-board span, .reservation-steps span {
      color: var(--accent);
      font-size: 13px;
      font-weight: 850;
    }
    .portrait-panel {
      min-height: 320px;
      color: #fff;
      background: linear-gradient(145deg, var(--accent), var(--accent2));
      display: grid;
      align-content: space-between;
    }
    .portrait-panel strong { font-size: 92px; }
    .portrait-panel p { color: rgba(255,255,255,.78); }
    .service-matrix, .catalog-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .service-matrix .featured {
      color: #fff;
      background: var(--accent);
      border-color: var(--accent);
    }
    .service-matrix .featured span, .service-matrix .featured p { color: rgba(255,255,255,.76); }
    .catalog-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .catalog-image {
      height: 116px;
      margin-bottom: 14px;
      border-radius: 18px;
      background: linear-gradient(135deg, var(--soft), rgba(255,255,255,.7));
    }
    .booking-card { display: grid; gap: 12px; background: var(--soft); }
    .field {
      border-radius: 16px;
      background: #fff;
      padding: 15px;
      color: var(--muted);
      font-weight: 700;
    }
    .field.large { min-height: 96px; }
    button, .button {
      border: 0;
      border-radius: 999px;
      padding: 14px 20px;
      color: #fff;
      background: var(--accent);
      font-weight: 800;
      text-decoration: none;
      width: fit-content;
    }
    .case-flow { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .people-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .avatar-mark {
      display: grid;
      place-items: center;
      width: 58px;
      height: 58px;
      border-radius: 999px;
      color: #fff;
      background: linear-gradient(145deg, var(--accent), var(--accent2));
      font-weight: 900;
    }
    .article-grid { grid-template-columns: 1.1fr .9fr; }
    .article-grid article:first-child {
      grid-row: span 2;
      background: var(--soft);
    }
    .faq-list { display: grid; gap: 10px; }
    .faq-list summary { cursor: pointer; font-weight: 800; }
    .service-deep-dive, .contact-guide, .reservation-guide {
      display: grid;
      grid-template-columns: minmax(0, .62fr) minmax(300px, 1.38fr);
      gap: 28px;
      align-items: start;
      border: 1px solid var(--line);
      border-radius: 32px;
      background: #fff;
      padding: clamp(24px, 4vw, 44px);
      box-shadow: 0 24px 80px rgba(15,23,42,.06);
    }
    .reservation-layout {
      background: #18181b;
      color: #fff;
    }
    .reservation-layout p { color: rgba(255,255,255,.72); }
    .reservation-layout .section-label { color: #fff; background: rgba(255,255,255,.14); }
    .schedule-board {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    .schedule-board article {
      min-height: 150px;
      display: grid;
      align-content: end;
      background: rgba(255,255,255,.08);
      border-color: rgba(255,255,255,.14);
    }
    .schedule-board strong, .schedule-board span { color: #fff; }
    .reservation-steps {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    .reservation-steps article {
      min-height: 170px;
      display: grid;
      align-content: end;
      background: linear-gradient(145deg, #fff, var(--soft));
    }
    .flow-rail {
      display: grid;
      gap: 0;
      border-left: 2px solid var(--accent);
      padding-left: 22px;
    }
    .flow-rail article {
      position: relative;
      padding: 0 0 26px;
    }
    .flow-rail article::before {
      content: "";
      position: absolute;
      left: -30px;
      top: 4px;
      width: 14px;
      height: 14px;
      border-radius: 999px;
      background: var(--accent);
    }
    .flow-rail span, .contact-steps span {
      color: var(--accent);
      font-size: 12px;
      font-weight: 850;
      text-transform: uppercase;
    }
    .flow-rail strong {
      display: block;
      margin-top: 8px;
      font-size: clamp(22px, 3vw, 36px);
      line-height: 1.12;
    }
    .contact-steps {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }
    .contact-steps article {
      min-height: 180px;
      border-radius: 28px;
      padding: 20px;
      color: #fff;
      background: linear-gradient(145deg, var(--accent), var(--accent2));
      display: grid;
      align-content: end;
    }
    .contact-steps span { color: rgba(255,255,255,.72); }
    .contact-steps strong { font-size: 22px; line-height: 1.25; }
    .demo-note {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 20px;
      align-items: center;
      color: #fff;
      background: #18181b;
    }
    .demo-note p { color: rgba(255,255,255,.72); }
    .demo-note .section-label { color: #fff; background: rgba(255,255,255,.14); }
    .style-luxury body { background: #f8f5ef; }
    .style-luxury h1, .style-luxury h2 { font-family: Georgia, "Hiragino Mincho ProN", serif; }
    .style-tech .hero-panel { transform: perspective(900px) rotateY(-6deg); }
    ${industryCss()}
    footer {
      padding: 32px clamp(20px, 5vw, 72px);
      color: var(--muted);
      border-top: 1px solid var(--line);
      background: #fff;
      font-size: 14px;
    }
    @media (max-width: 760px) {
      nav { display: none; }
      .sub-hero, .hero-about, .hero-services, .hero-product, .hero-action, .hero-reservation, .hero-works, .hero-media, .hero-people, .hero-faq, .hero-process, .sub-block, .summary-block, .demo-note, .service-deep-dive, .contact-guide, .reservation-guide { grid-template-columns: 1fr; }
      .hero-process { background: #18181b; }
      .vertical-title, .magazine-label { display: none; }
      .hero-about { background: linear-gradient(135deg, #fff, #f4f4f5); }
      .summary-list, .service-matrix, .catalog-grid, .case-flow, .article-grid, .people-card-grid, .people-hero-grid, .schedule-board, .reservation-steps, .reservation-calendar-large { grid-template-columns: 1fr; }
      .contact-steps { grid-template-columns: 1fr; }
      .service-board, .product-hero-grid, .result-metrics { grid-template-columns: 1fr; }
      .hero-panel { min-height: 260px; transform: none !important; }
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">${escapeHtml(plan.company.name)}</div>
    <nav>
      ${plan.pages.slice(0, 8).map((navPage, index) => {
        const fileName = pageFileNames[index] ?? fileNameFor(navPage.name, index);
        const isCurrent = navPage.name === page.name;
        return `<a class="${isCurrent ? "is-current" : ""}" href="#${escapeHtml(pageAnchorFor(fileName))}" data-sync-page="${escapeHtml(fileName)}">${escapeHtml(navPage.name)}</a>`;
      }).join("")}
    </nav>
  </header>
  <main>
    ${renderSubPageHero(plan, page)}
    ${renderSubPageBody(plan, page)}
  </main>
  <footer>© ${escapeHtml(plan.company.name)} - ${escapeHtml(page.name)}</footer>
  <script>
    document.querySelectorAll("[data-sync-page]").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (window.parent === window) return;
        event.preventDefault();
        window.parent.postMessage({
          type: "sync-craft-open-page",
          fileName: link.getAttribute("data-sync-page")
        }, "*");
      });
    });
  </script>
</body>
</html>`;
}

export function renderDemoSitePages(plan: DemoPlanJson) {
  const pageFileNames = fileNamesForPages(plan.pages);

  return plan.pages.map((page, index) => {
    const fileName = pageFileNames[index] ?? fileNameFor(page.name, index);

    return {
      name: page.name,
      fileName,
      html: index === 0 || page.name.includes("トップ") ? renderDemoHtml(plan) : renderSubPageHtml(plan, page),
    };
  });
}
