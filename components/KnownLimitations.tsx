import type { AppCopy } from "@/lib/i18n";

// TODO(P0): KnownLimitations 需新增以下条目（对应新增功能的局限性说明）：
//   "缓存命中率模拟仅处理 cache read 成本，不包含 cache write 成本和 TTL。"
//   "批处理模式（Batch API）折扣基于当前官方文档，实际折扣比例可能随 provider 更新而变化。"
//   "失败重试率是用户输入的估算值，不代表实际重试比例。"
//   "图片生成成本基于官方公开计费公式，部分模型的计费维度可能包含 GPU 时间、图像分辨率等因素。"
// TODO(P2): KnownLimitations 需新增："本计算器不对 Replicate / fal.ai 按运行时/输出计费模型做深度适配。"
// TODO(P2): KnownLimitations 需新增："模型组合推荐（便宜模型初筛 + 高级模型兜底）基于简化假设，实际路由策略需按业务场景调优。"

interface KnownLimitationsProps {
  copy: AppCopy["limitations"];
}

export function KnownLimitations({ copy }: KnownLimitationsProps) {
  return (
    <section
      aria-labelledby="limitations-heading"
      className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
    >
      <h2
        id="limitations-heading"
        className="text-base font-semibold"
      >
        {copy.heading}
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {copy.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
