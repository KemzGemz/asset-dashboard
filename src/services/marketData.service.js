import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["ripHistorical"] });

export async function getIndexData(symbol) {
  const result = await yf.chart(symbol, {
    period1: new Date("1900-01-01"),
    period2: new Date(),
    interval: "1d",
  });

  const quotes = result?.quotes ?? [];
  if (quotes.length === 0) throw new Error(`No price data for ${symbol}`);

  // Current = last valid close
  const closes = quotes
    .map(q => q.close)
    .filter(v => Number.isFinite(v) && v > 0);

  const current = closes[closes.length - 1];

  // ATH = max intraday HIGH (more standard for "all time high")
  const validHighQuotes = quotes
    .filter(q => Number.isFinite(q.high) && q.high > 0 && q.date instanceof Date);

  let ath = -Infinity;
  let athDate = null;

  for (const q of validHighQuotes) {
    if (q.high > ath) {
      ath = q.high;
      athDate = q.date;
    }
  }

  if (!Number.isFinite(ath)) throw new Error(`Could not compute ATH for ${symbol}`);

  const target = ath * 1.05;
  const upside = ((target - current) / current) * 100;

  return {
    current: Number(current.toFixed(2)),
    ath: Number(ath.toFixed(2)),
    athDate: athDate ? athDate.toISOString().slice(0, 10) : null,
    target: Number(target.toFixed(2)),
    upside: Number(upside.toFixed(2)),
  };
}