/*
 * 项目名称：claude-hud
 * 文件名称：pricing.ts
 * 创建时间：2026-02-26 22:20:56
 *
 * 系统用户：Administrator
 * 作　　者：無以菱
 * 联系邮箱：huangjing510@126.com
 * 功能描述：累计 token 用量与费用估算模块，按模型分级定价计算会话累计费用
 */

// 单个模型的累计 token 用量
export interface ModelTokenUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheWriteTokens: number;
  cacheReadTokens: number;
}

// 汇总的累计 token 用量（所有模型合计）
export interface CumulativeTokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheWriteTokens: number;
  cacheReadTokens: number;
  byModel: ModelTokenUsage[];
}

// 费用估算结果
export interface CostEstimate {
  totalCost: number;
  inputCost: number;
  outputCost: number;
}

// 模型定价（美元 / 1M tokens）
interface ModelPricing {
  inputPerM: number;
  outputPerM: number;
}

// 按模型系列分级定价，补全价格 = 提示价格 × 5
const MODEL_PRICING: Record<string, ModelPricing> = {
  opus: { inputPerM: 5, outputPerM: 25 },
  sonnet: { inputPerM: 3, outputPerM: 15 },
};

// 默认定价（未匹配时使用 opus 定价）
const DEFAULT_PRICING: ModelPricing = MODEL_PRICING.opus;

/**
 * findPricing 根据模型 ID 匹配定价
 * @param modelId 模型 ID，如 claude-opus-4-6、claude-sonnet-4
 * @return 对应的定价
 */
function findPricing(modelId: string): ModelPricing {
  const lower = modelId.toLowerCase();
  for (const [key, pricing] of Object.entries(MODEL_PRICING)) {
    if (lower.includes(key)) return pricing;
  }
  return DEFAULT_PRICING;
}

/**
 * calculateCost 根据累计 token 用量按模型分级计算估算费用
 * @param tokens 累计 token 用量（含按模型分类）
 * @return CostEstimate 费用估算结果
 */
export function calculateCost(tokens: CumulativeTokenUsage): CostEstimate {
  let totalInputCost = 0;
  let totalOutputCost = 0;

  for (const m of tokens.byModel) {
    const pricing = findPricing(m.model);
    const promptTokens = m.inputTokens + m.cacheWriteTokens + m.cacheReadTokens;
    totalInputCost += (promptTokens / 1_000_000) * pricing.inputPerM;
    totalOutputCost += (m.outputTokens / 1_000_000) * pricing.outputPerM;
  }

  return {
    totalCost: totalInputCost + totalOutputCost,
    inputCost: totalInputCost,
    outputCost: totalOutputCost,
  };
}
