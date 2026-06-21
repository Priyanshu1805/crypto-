// services/riskManager.js
// Validates every trade before sending to Binance

require('dotenv').config();

const MAX_POSITION_USD  = parseFloat(process.env.MAX_POSITION_USD  || 500);
const MIN_STOP_LOSS_PCT = parseFloat(process.env.MIN_STOP_LOSS_PCT || 0.5);
const MAX_STOP_LOSS_PCT = parseFloat(process.env.MAX_STOP_LOSS_PCT || 10);
const MIN_RR_RATIO      = parseFloat(process.env.MIN_RR_RATIO      || 1.5);

function check({ side, price, stopLoss, takeProfit, quantity }) {
  const p   = parseFloat(price);
  const qty = parseFloat(quantity);
  const sl  = parseFloat(stopLoss);
  const tp  = parseFloat(takeProfit);

  if (!p || !qty || !sl || !tp) {
    return { approved: false, reason: 'Missing price, quantity, stopLoss, or takeProfit' };
  }
  if (sl < MIN_STOP_LOSS_PCT) {
    return { approved: false, reason: `Stop-loss too tight — minimum is ${MIN_STOP_LOSS_PCT}%` };
  }
  if (sl > MAX_STOP_LOSS_PCT) {
    return { approved: false, reason: `Stop-loss too wide — maximum is ${MAX_STOP_LOSS_PCT}%` };
  }

  const isBuy  = side.toUpperCase() === 'BUY';
  const slPrice = isBuy ? p * (1 - sl / 100) : p * (1 + sl / 100);
  const tpPrice = isBuy ? p * (1 + tp / 100) : p * (1 - tp / 100);

  const risk   = Math.abs(p - slPrice);
  const reward = Math.abs(tpPrice - p);
  const rr     = reward / risk;

  if (rr < MIN_RR_RATIO) {
    return {
      approved: false,
      reason: `R:R ratio ${rr.toFixed(2)} is below minimum ${MIN_RR_RATIO}. Increase take-profit or reduce stop-loss.`,
    };
  }

  const positionUSD = p * qty;
  if (positionUSD > MAX_POSITION_USD) {
    return {
      approved: false,
      reason: `Position size $${positionUSD.toFixed(2)} exceeds max allowed $${MAX_POSITION_USD}`,
    };
  }

  return {
    approved:    true,
    slPrice:     parseFloat(slPrice.toFixed(2)),
    tpPrice:     parseFloat(tpPrice.toFixed(2)),
    rrRatio:     parseFloat(rr.toFixed(2)),
    positionUSD: parseFloat(positionUSD.toFixed(2)),
    riskUSD:     parseFloat((qty * risk).toFixed(2)),
    rewardUSD:   parseFloat((qty * reward).toFixed(2)),
  };
}

module.exports = { check };
