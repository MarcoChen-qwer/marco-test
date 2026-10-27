// @ts-check

/**
 * @typedef {import("../generated/api").CartValidationsGenerateRunInput} CartValidationsGenerateRunInput
 * @typedef {import("../generated/api").CartValidationsGenerateRunResult} CartValidationsGenerateRunResult
 */

/** 订单金额上限（美元） */
const ORDER_MAX = 1000;

/** 达到多少单才算「老客」 */
const ESTABLISHED_ORDER_COUNT = 5;

/**
 * 超过 ORDER_MAX 的订单，只有下单 >= ESTABLISHED_ORDER_COUNT 次的老客才能提交。
 * 游客、未登录、以及历史不足 5 单的客户一律拦截。
 *
 * @param {CartValidationsGenerateRunInput} input
 * @returns {CartValidationsGenerateRunResult}
 */
export function cartValidationsGenerateRun(input) {
  // 金额在 input 里是字符串（如 "1200.00"），必须 parseFloat
  const subtotal = parseFloat(input.cart.cost.subtotalAmount.amount);

  // 可选链 + 空值合并：游客找不到 customer 时按 0 单处理，自然落进拦截分支
  const numberOfOrders = input.cart.buyerIdentity?.customer?.numberOfOrders ?? 0;

  const isBlocked = subtotal > ORDER_MAX && numberOfOrders < ESTABLISHED_ORDER_COUNT;

  if (!isBlocked) {
    // 放行：返回空操作
    return { operations: [] };
  }

  return {
    operations: [
      {
        validationAdd: {
          errors: [
            {
              message: `There's an order maximum of $${ORDER_MAX} for customers without established order history`,
              target: "$.cart",
            },
          ],
        },
      },
    ],
  };
}