/*
 * 项目名称：claude-hud
 * 文件名称：cost.ts
 * 创建时间：2026-02-26 22:20:56
 *
 * 系统用户：Administrator
 * 作　　者：無以菱
 * 联系邮箱：huangjing510@126.com
 * 功能描述：费用行渲染器，显示会话累计费用估算（基于统一定价）
 */
import { dim, RESET } from '../colors.js';
/**
 * formatCost 将美元金额格式化为紧凑字符串
 * @param cost 美元金额
 * @return 格式化后的字符串，如 <$0.01、$0.12、$1.50
 */
function formatCost(cost) {
    if (cost < 0.01)
        return '<$0.01';
    if (cost < 10)
        return `$${cost.toFixed(2)}`;
    return `$${cost.toFixed(1)}`;
}
/**
 * getCostColor 根据费用金额返回 ANSI 颜色前缀
 * @param cost 美元金额
 * @return ANSI 颜色转义序列
 */
function getCostColor(cost) {
    if (cost > 5.00)
        return '\x1b[31m'; // red
    if (cost >= 1.00)
        return '\x1b[33m'; // yellow
    if (cost >= 0.10)
        return '\x1b[32m'; // green
    return '\x1b[2m'; // dim
}
/**
 * formatTokens 将 token 数量格式化为紧凑字符串
 * @param n token 数量
 * @return 格式化后的字符串，如 1.2k、45.0k、1.5M
 */
function formatTokens(n) {
    if (n >= 1_000_000)
        return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)
        return `${(n / 1_000).toFixed(1)}k`;
    return n.toString();
}
/**
 * renderCostLine 渲染费用显示片段
 * @param ctx 渲染上下文
 * @return 格式化的费用字符串，无数据时返回 null
 */
export function renderCostLine(ctx) {
    const data = ctx.costData;
    if (!data)
        return null;
    const total = data.inputTokens + data.outputTokens + data.cacheWriteTokens + data.cacheReadTokens;
    if (total === 0)
        return null;
    const color = getCostColor(data.totalCost);
    const costStr = formatCost(data.totalCost);
    let result = `${dim('Cost')} ${color}~${costStr}${RESET}`;
    // 可选明细：token 分类
    if (ctx.config?.display?.costBreakdown) {
        const inStr = formatTokens(data.inputTokens + data.cacheWriteTokens + data.cacheReadTokens);
        const outStr = formatTokens(data.outputTokens);
        result += dim(` (in: ${inStr}, out: ${outStr})`);
    }
    return result;
}
//# sourceMappingURL=cost.js.map