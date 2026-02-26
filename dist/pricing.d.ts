export interface ModelTokenUsage {
    model: string;
    inputTokens: number;
    outputTokens: number;
    cacheWriteTokens: number;
    cacheReadTokens: number;
}
export interface CumulativeTokenUsage {
    inputTokens: number;
    outputTokens: number;
    cacheWriteTokens: number;
    cacheReadTokens: number;
    byModel: ModelTokenUsage[];
}
export interface CostEstimate {
    totalCost: number;
    inputCost: number;
    outputCost: number;
}
/**
 * calculateCost 根据累计 token 用量按模型分级计算估算费用
 * @param tokens 累计 token 用量（含按模型分类）
 * @return CostEstimate 费用估算结果
 */
export declare function calculateCost(tokens: CumulativeTokenUsage): CostEstimate;
//# sourceMappingURL=pricing.d.ts.map