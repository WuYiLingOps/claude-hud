/*
 * 项目名称：claude-hud
 * 文件名称：cost.ts
 * 创建时间：2026-02-26 22:20:56
 *
 * 系统用户：Administrator
 * 作　　者：無以菱
 * 联系邮箱：huangjing510@126.com
 * 功能描述：费用行渲染器，将 CostData 格式化为带颜色的费用显示字符串
 */

import type { RenderContext } from '../../types.js';
import { dim, yellow, red, RESET } from '../colors.js';

/**
 * formatCost 将美元金额格式化为紧凑字符串
 * @param cost 美元金额
 * @return 格式化后的字符串，如 <$0.01、$0.12、$1.50
 */
function formatCost(cost: number): string {
  if (cost < 0.01) return '<$0.01';
  if (cost < 10) return `$${cost.toFixed(2)}`;
  return `$${cost.toFixed(1)}`;
}

/**
 * getCostColor 根据费用金额返回 ANSI 颜色前缀
 * @param cost 美元金额
 * @return ANSI 颜色转义序列
 */
function getCostColor(cost: number): string {
  if (cost > 2.00) return '\x1b[31m'; // red
  if (cost >= 0.50) return '\x1b[33m'; // yellow
  return '\x1b[2m'; // dim
}

/**
 * renderCostLine 渲染费用显示片段
 * @param ctx 渲染上下文
 * @return 格式化的费用字符串，未匹配定价时返回 null
 */
export function renderCostLine(ctx: RenderContext): string | null {
  const costData = ctx.costData;
  if (!costData || !costData.modelMatched) return null;

  const color = getCostColor(costData.totalCost);
  const costStr = formatCost(costData.totalCost);
  let result = `Cost ${color}~${costStr}${RESET}`;

  // 可选明细
  if (ctx.config?.display?.costBreakdown) {
    const inStr = formatCost(costData.inputCost);
    const outStr = formatCost(costData.outputCost);
    const cacheStr = formatCost(costData.cacheWriteCost + costData.cacheReadCost);
    result += dim(` (in: ${inStr}, out: ${outStr}, cache: ${cacheStr})`);
  }

  return result;
}
