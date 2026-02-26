/*
 * 项目名称：claude-hud
 * 文件名称：pricing.ts
 * 创建时间：2026-02-26 22:20:56
 *
 * 系统用户：Administrator
 * 作　　者：無以菱
 * 联系邮箱：huangjing510@126.com
 * 功能描述：模型定价表与费用估算模块，基于 token 用量和内置定价计算当前会话的估算费用
 */

// 模型定价接口（单位：美元 / 百万 token）
export interface ModelPricing {
  inputPerMToken: number;
  outputPerMToken: number;
  cacheWritePerMToken: number;
  cacheReadPerMToken: number;
}

// 费用估算结果
export interface CostData {
  totalCost: number;
  inputCost: number;
  outputCost: number;
  cacheWriteCost: number;
  cacheReadCost: number;
  modelMatched: boolean;
}

// 内置定价表（美元 / 百万 token）
// NOTE 定价来源于 Anthropic 官方公开定价，如有变动需手动更新
const MODEL_PRICING: Record<string, ModelPricing> = {
  'claude-opus-4': {
    inputPerMToken: 15,
    outputPerMToken: 75,
    cacheWritePerMToken: 18.75,
    cacheReadPerMToken: 1.50,
  },
  'claude-sonnet-4': {
    inputPerMToken: 3,
    outputPerMToken: 15,
    cacheWritePerMToken: 3.75,
    cacheReadPerMToken: 0.30,
  },
  'claude-sonnet-3-5': {
    inputPerMToken: 3,
    outputPerMToken: 15,
    cacheWritePerMToken: 3.75,
    cacheReadPerMToken: 0.30,
  },
  'claude-haiku-3-5': {
    inputPerMToken: 0.80,
    outputPerMToken: 4,
    cacheWritePerMToken: 1,
    cacheReadPerMToken: 0.08,
  },
};

/**
 * findPricing 根据模型 ID 查找定价
 * @param modelId 模型 ID，如 claude-opus-4-6-20260205
 * @return ModelPricing | null 匹配到的定价，未匹配返回 null
 */
export function findPricing(modelId: string | undefined): ModelPricing | null {
  if (!modelId) return null;

  // 精确匹配
  if (MODEL_PRICING[modelId]) {
    return MODEL_PRICING[modelId];
  }

  // 按 key 长度降序做前缀匹配（优先匹配更具体的 key）
  const keys = Object.keys(MODEL_PRICING).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (modelId.startsWith(key)) {
      return MODEL_PRICING[key];
    }
  }

  return null;
}

// token 用量输入
interface TokenUsage {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

/**
 * calculateCost 根据模型 ID 和 token 用量计算估算费用
 * @param modelId 模型 ID
 * @param usage token 用量快照
 * @return CostData 费用估算结果
 */
export function calculateCost(modelId: string | undefined, usage: TokenUsage | null | undefined): CostData {
  const pricing = findPricing(modelId);

  if (!pricing || !usage) {
    return {
      totalCost: 0,
      inputCost: 0,
      outputCost: 0,
      cacheWriteCost: 0,
      cacheReadCost: 0,
      modelMatched: false,
    };
  }

  const inputTokens = usage.input_tokens ?? 0;
  const outputTokens = usage.output_tokens ?? 0;
  const cacheWriteTokens = usage.cache_creation_input_tokens ?? 0;
  const cacheReadTokens = usage.cache_read_input_tokens ?? 0;

  const inputCost = (inputTokens / 1_000_000) * pricing.inputPerMToken;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPerMToken;
  const cacheWriteCost = (cacheWriteTokens / 1_000_000) * pricing.cacheWritePerMToken;
  const cacheReadCost = (cacheReadTokens / 1_000_000) * pricing.cacheReadPerMToken;

  return {
    totalCost: inputCost + outputCost + cacheWriteCost + cacheReadCost,
    inputCost,
    outputCost,
    cacheWriteCost,
    cacheReadCost,
    modelMatched: true,
  };
}
