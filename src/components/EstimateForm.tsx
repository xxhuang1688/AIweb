"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import {
  colorOptions,
  designStyleOptions,
  featureOptions,
  industryOptions,
  websiteGoalOptions,
  websiteTypeOptions,
  wizardSteps,
} from "@/config/proposalConfig";
import { queryFromRequirement } from "@/lib/queryProposal";
import type { Option } from "@/config/proposalConfig";
import type { RequirementInput } from "@/types/proposal";

function HiddenFields({ input, exclude = [] }: { input: RequirementInput; exclude?: Array<keyof RequirementInput> }) {
  return (
    <>
      {Object.entries(input).map(([key, value]) => {
        if (exclude.includes(key as keyof RequirementInput)) return null;

        if (Array.isArray(value)) {
          return value.filter(Boolean).map((item) => (
            <input key={`${key}-${item}`} type="hidden" name={key} value={item} />
          ));
        }

        return value ? <input key={key} type="hidden" name={key} value={value} /> : null;
      })}
    </>
  );
}

function TextInput({ label, name, value, placeholder, required = false, minLength, highlight = false }: {
  label: string;
  name: keyof RequirementInput;
  value: string;
  placeholder: string;
  required?: boolean;
  minLength?: number;
  highlight?: boolean;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-medium text-zinc-800">
        <span>{label}</span>
        {highlight ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            参考サンプル
          </span>
        ) : null}
      </span>
      <input
        name={name}
        defaultValue={value}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        data-sample={placeholder}
        className={[
          "mt-2 h-12 w-full rounded-2xl border px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-4 focus:ring-emerald-100",
          highlight ? "border-emerald-300 bg-emerald-50/60 ring-4 ring-emerald-100" : "border-zinc-200 bg-white",
        ].join(" ")}
      />
      <span className="mt-2 block text-xs leading-5 text-zinc-400">記入例：{placeholder}</span>
    </label>
  );
}

function TextArea({ label, name, value, placeholder, required = false, minLength, highlight = false }: {
  label: string;
  name: keyof RequirementInput;
  value: string;
  placeholder: string;
  required?: boolean;
  minLength?: number;
  highlight?: boolean;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-medium text-zinc-800">
        <span>{label}</span>
        {highlight ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            参考サンプル
          </span>
        ) : null}
      </span>
      <textarea
        name={name}
        defaultValue={value}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        data-sample={placeholder}
        rows={5}
        className={[
          "mt-2 w-full resize-none rounded-2xl border px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-4 focus:ring-emerald-100",
          highlight ? "border-emerald-300 bg-emerald-50/60 ring-4 ring-emerald-100" : "border-zinc-200 bg-white",
        ].join(" ")}
      />
      <span className="mt-2 block text-xs leading-5 text-zinc-400">記入例：{placeholder}</span>
    </label>
  );
}

function OptionGrid<T extends string>({
  name,
  options,
  value,
  values,
  multi = false,
  required = false,
}: {
  name: keyof RequirementInput;
  options: Option<T>[];
  value?: string;
  values?: string[];
  multi?: boolean;
  required?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const selected = multi ? values?.includes(option.value) : value === option.value;

        return (
          <label
            key={option.value}
            className="block cursor-pointer text-left"
          >
            <input
              type={multi ? "checkbox" : "radio"}
              name={name}
              value={option.value}
              defaultChecked={selected}
              required={required && !multi}
              className="option-input sr-only"
            />
            <span
              className={[
                "option-card-body block rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:border-zinc-400 hover:bg-white",
                selected ? "border-zinc-950 bg-white shadow-md ring-4 ring-emerald-100" : "border-zinc-200 bg-zinc-50/70",
              ].join(" ")}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="text-sm font-semibold text-zinc-950">{option.label}</span>
                <span className="option-card-badge shrink-0 rounded-full bg-zinc-950 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-sm transition">
                  選択中
                </span>
              </span>
              {option.description ? (
                <span className="mt-2 block text-sm leading-6 text-zinc-500">{option.description}</span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function getLabel<T extends string>(options: Option<T>[], value: T | "") {
  return options.find((option) => option.value === value)?.label ?? "";
}

function getLabels<T extends string>(options: Option<T>[], values: T[]) {
  return values.map((value) => getLabel(options, value)).filter(Boolean);
}

function SummaryItem({ label, value }: { label: string; value: string | string[] }) {
  const values = Array.isArray(value) ? value : [value];
  const visibleValues = values.filter(Boolean);

  return (
    <div className="rounded-2xl border border-zinc-900/10 bg-white/70 p-4 shadow-sm">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      {visibleValues.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {visibleValues.map((item) => (
            <span key={item} className="rounded-full bg-white px-3 py-1 text-sm font-medium text-zinc-800 shadow-sm">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-zinc-400">未入力</p>
      )}
    </div>
  );
}

function Navigation({ step, input, final = false }: { step: number; input: RequirementInput; final?: boolean }) {
  const backHref = step > 0 ? `/estimate?${queryFromRequirement(input, step - 1)}` : "/estimate";

  return (
    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-zinc-900/10 pt-6 sm:flex-row sm:justify-between">
      {step === 0 ? (
        <button
          type="button"
          disabled
          className="rounded-full border border-zinc-900/10 bg-white/70 px-6 py-3 text-sm font-semibold text-zinc-700 transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          前へ
        </button>
      ) : (
        <Link href={backHref} className="rounded-full border border-zinc-900/10 bg-white/70 px-6 py-3 text-center text-sm font-semibold text-zinc-700 transition hover:bg-white">
          前へ
        </Link>
      )}
      <button type="submit" className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-zinc-950/15 transition hover:-translate-y-0.5 hover:bg-zinc-800">
        {final ? "制作プランを生成する" : "次へ"}
      </button>
    </div>
  );
}

export function EstimateForm({ step, input, errors = [] }: { step: number; input: RequirementInput; errors?: string[] }) {
  const progress = ((step + 1) / wizardSteps.length) * 100;
  const action = step === 6 ? "/result" : "/estimate";
  const formKey = queryFromRequirement(input, step);
  const companySample = {
    companyName: "株式会社ミライテック",
    industry: "it" as const,
    slogan: "現場に寄り添い、事業成長を支えるAIソリューション",
    companyDescription: "株式会社ミライテックは、東京都渋谷区を拠点に、中小企業向けの業務効率化、AI導入支援、Webシステム開発を行うテクノロジー企業です。現場の課題を丁寧にヒアリングし、使いやすく継続運用しやすいデジタル施策を提案しています。",
    contactInfo: "info@miraitech.example.jp / 03-0000-0000 / 東京都渋谷区",
    logo: "https://example.jp/logo.png",
  };
  const sampleInput = { ...input, ...companySample };
  const sampleHref = `/estimate?${queryFromRequirement(sampleInput, 0)}`;
  const sampleApplied =
    input.companyName === companySample.companyName &&
    input.industry === companySample.industry &&
    input.companyDescription === companySample.companyDescription &&
    input.contactInfo === companySample.contactInfo;

  const validateForm = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    const requiredMessage = "この項目を入力してください。";
    const choiceMessage = "選択してください。";
    const requiredControls = Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[required]"));

    for (const control of requiredControls) {
      control.setCustomValidity("");

      if (control instanceof HTMLInputElement && control.type === "radio") {
        const group = Array.from(form.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${CSS.escape(control.name)}"]`));

        if (!group.some((item) => item.checked)) {
          group.forEach((item) => item.setCustomValidity(choiceMessage));
          event.preventDefault();
          control.reportValidity();
          return;
        }

        continue;
      }

      const value = control.value.trim();
      if (!value) {
        control.setCustomValidity(requiredMessage);
        event.preventDefault();
        control.reportValidity();
        return;
      }

      const minLength = Number(control.getAttribute("minlength") || 0);
      if (minLength > 0 && value.length < minLength) {
        control.setCustomValidity(`${minLength}文字以上で入力してください。`);
        event.preventDefault();
        control.reportValidity();
        return;
      }
    }
  };

  return (
    <form
      key={formKey}
      data-estimate-form
      method="GET"
      action={action}
      noValidate
      onSubmit={validateForm}
      className="mx-auto max-w-5xl rounded-[2rem] border border-zinc-900/10 bg-white/88 p-5 shadow-[0_36px_130px_rgba(15,23,42,0.14)] backdrop-blur sm:p-8"
    >
      {step < 6 ? <input type="hidden" name="step" value={step + 1} /> : null}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 text-sm text-zinc-500">
          <span>{wizardSteps[step]}</span>
          <span>{step + 1}/{wizardSteps.length}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,#18181b,#14b8a6,#84cc16)] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {errors.length > 0 ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          <p className="font-semibold">入力内容を確認してください。</p>
          <ul className="mt-2 grid gap-1">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="min-h-[520px]">
        {step === 0 ? (
          <section className="grid gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">会社情報</h1>
                <p className="mt-2 text-sm leading-6 text-zinc-500">内容が決まっていない場合は、サンプルを使ってそのまま制作プランを生成できます。</p>
              </div>
              <Link
                href={sampleHref}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  sampleApplied
                    ? "border border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-100"
                    : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                ].join(" ")}
              >
                {sampleApplied ? "サンプル入力済み" : "サンプルを入力"}
              </Link>
            </div>
            {sampleApplied ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                参考サンプルを入力しました。会社名や説明文はそのまま使うことも、自由に編集することもできます。
              </p>
            ) : null}
            <TextInput label="会社名" name="companyName" value={input.companyName} placeholder="株式会社ミライテック" required highlight={sampleApplied} />
            <div>
              <p className="mb-3 text-sm font-medium text-zinc-800">業界</p>
              <OptionGrid name="industry" options={industryOptions} value={sampleApplied ? companySample.industry : input.industry} required />
            </div>
            <TextInput label="スローガン" name="slogan" value={input.slogan} placeholder="現場に寄り添い、事業成長を支えるAIソリューション" highlight={sampleApplied} />
            <TextArea label="会社説明" name="companyDescription" value={input.companyDescription} placeholder="株式会社ミライテックは、東京都渋谷区を拠点に、中小企業向けの業務効率化、AI導入支援、Webシステム開発を行うテクノロジー企業です。現場の課題を丁寧にヒアリングし、使いやすく継続運用しやすいデジタル施策を提案しています。" required minLength={10} highlight={sampleApplied} />
            <TextInput label="連絡先" name="contactInfo" value={input.contactInfo} placeholder="info@miraitech.example.jp / 03-0000-0000 / 東京都渋谷区" required highlight={sampleApplied} />
            <TextInput label="ロゴ（任意）" name="logo" value={input.logo} placeholder="https://example.jp/logo.png" highlight={sampleApplied} />
          </section>
        ) : null}

        {step === 1 ? (
          <section className="grid gap-5">
            <HiddenFields input={input} exclude={["websiteType"]} />
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">サイト種類</h1>
            <OptionGrid name="websiteType" options={websiteTypeOptions} value={input.websiteType} required />
          </section>
        ) : null}

        {step === 2 ? (
          <section className="grid gap-5">
            <HiddenFields input={input} exclude={["websiteGoals"]} />
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">制作目的</h1>
            <p className="text-sm leading-6 text-zinc-500">近いものを選んでください。複数選択できます。</p>
            <OptionGrid multi name="websiteGoals" options={websiteGoalOptions} values={input.websiteGoals} />
          </section>
        ) : null}

        {step === 3 ? (
          <section className="grid gap-5">
            <HiddenFields input={input} exclude={["features"]} />
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">必要機能</h1>
            <p className="text-sm leading-6 text-zinc-500">必要そうなものだけ選択してください。後から変更できます。</p>
            <OptionGrid multi name="features" options={featureOptions} values={input.features} />
          </section>
        ) : null}

        {step === 4 ? (
          <section className="grid gap-8">
            <HiddenFields input={input} exclude={["designStyle", "mainColor"]} />
            <div className="grid gap-5">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">デザイン</h1>
              <p className="text-sm leading-6 text-zinc-500">希望する印象とメインカラーを選択してください。</p>
            </div>
            <div>
              <p className="mb-3 text-sm font-medium text-zinc-800">デザインスタイル</p>
              <OptionGrid name="designStyle" options={designStyleOptions} value={input.designStyle} required />
            </div>
            <div>
              <p className="mb-3 text-sm font-medium text-zinc-800">メインカラー</p>
              <OptionGrid name="mainColor" options={colorOptions} value={input.mainColor} required />
            </div>
          </section>
        ) : null}

        {step === 5 ? (
          <section className="grid gap-5">
            <HiddenFields input={input} exclude={["referenceSites", "referenceNote"]} />
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">参考サイト</h1>
            <p className="text-sm leading-6 text-zinc-500">参考サイトがない場合は空欄のままで問題ありません。</p>
            <TextInput label="参考サイトURL（任意）" name="referenceSites" value={input.referenceSites[0] ?? ""} placeholder="https://stripe.com/jp" />
            <TextArea label="好きなところ（任意）" name="referenceNote" value={input.referenceNote} placeholder="ファーストビューでサービスの価値がすぐ伝わるところ、余白が広く信頼感があるところ、料金や導入事例まで自然に読み進められる構成を参考にしたいです。" />
          </section>
        ) : null}

        {step === 6 ? (
          <section className="grid gap-6">
            <HiddenFields input={input} />
            <div className="grid gap-5">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">入力内容の確認</h1>
              <p className="text-sm leading-6 text-zinc-500">
                入力内容を確認してください。制作費と開発期間は、サイト種類と必要機能から自動で算出します。
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryItem label="会社名" value={input.companyName} />
              <SummaryItem label="業界" value={getLabel(industryOptions, input.industry)} />
              <SummaryItem label="サイト種類" value={getLabel(websiteTypeOptions, input.websiteType)} />
              <SummaryItem label="制作目的" value={getLabels(websiteGoalOptions, input.websiteGoals)} />
              <SummaryItem label="必要機能" value={getLabels(featureOptions, input.features)} />
              <SummaryItem label="デザイン" value={[getLabel(designStyleOptions, input.designStyle), getLabel(colorOptions, input.mainColor)]} />
              <SummaryItem label="参考サイト" value={input.referenceSites.filter(Boolean)} />
              <SummaryItem label="参考メモ" value={input.referenceNote} />
            </div>
            <p className="rounded-2xl bg-zinc-950 px-4 py-3 text-sm leading-6 text-white">
              問題なければ「制作プランを生成する」を押してください。見積もり区間、複雑度、開発期間、推奨ページ構成、標準JSONを自動作成します。
            </p>
          </section>
        ) : null}
      </div>

      <Navigation step={step} input={input} final={step === 6} />
    </form>
  );
}
