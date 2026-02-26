/*
 * 项目名称：claude-hud
 * 文件名称：pricing.ts
 * 创建时间：2026-02-26 22:20:56
 *
 * 系统用户：Administrator
 * 作　　者：無以菱
 * 联系邮箱：huangjing510@126.com
 * 功能描述：累计 token 用量与费用估算模块，基于统一定价计算会话累计费用
 */

// 累计 token 用量
export interface CumulativeTokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheWriteTokens: number;
  cacheReadTokens: number;
}

// 费用估算结果
export interface CostEstimate {
  totalCost: number;
  inputCost: number;
  outputCost: number;
}

// 统一定价（美元 / 1M tokens）
const INPUT_PRICE_PER_M = 5;
const OUTPUT_PRICE_PER_M = 25; // 输入价格 × 5

/**
 * calculateCost 根据累计 token 用量计算估算费用
 * @param tokens 累计 token 用量
 * @return CostEstimate 费用估算结果
 */
export function calculateCost(tokens: CumulativeTokenUsage): CostEstimate {
  // 提示 token = input + cache（cache 按输入价格计费）
  const promptTokens = tokens.inputTokens + tokens.cacheWriteTokens + tokens.cacheReadTokens;
  const inputCost = (promptTokens / 1_000_000) * INPUT_PRICE_PER_M;
  const outputCost = (tokens.outputTokens / 1_000_000) * OUTPUT_PRICE_PER_M;

  return {
    totalCost: inputCost + outputCost,
    inputCost,
    outputCost,
  };
}
