/**
 * Revenue Engine - Calculates deterministic payouts
 * Uses explicit revenue pools, NO per-stream math
 * Handles rounding safely, validates splits sum to 100%
 */

export function calculateRevenueSplit(totalAmountCents, revenueRules) {
  if (!revenueRules) {
    return null;
  }

  const splits = {
    artist: revenueRules.artist || 0,
    label: revenueRules.label || 0,
    publisher: revenueRules.publisher || 0,
    producer: revenueRules.producer || 0,
    platform: revenueRules.platform || 0
  };

  // Validate splits sum to 100%
  const total = Object.values(splits).reduce((sum, val) => sum + val, 0);
  if (Math.abs(total - 100) > 0.01) {
    throw new Error(`Revenue splits must sum to 100%, got ${total}%`);
  }

  // Calculate payouts in cents
  const payouts = {};
  let distributed = 0;

  Object.keys(splits).forEach(key => {
    const amount = Math.floor((totalAmountCents * splits[key]) / 100);
    payouts[key] = amount;
    distributed += amount;
  });

  // Handle rounding remainder - give to artist
  const remainder = totalAmountCents - distributed;
  if (remainder > 0) {
    payouts.artist += remainder;
  }

  return {
    splits,
    payouts,
    totalCents: totalAmountCents,
    totalDollars: totalAmountCents / 100
  };
}

export function validateRevenueSplits(revenueRules) {
  if (!revenueRules) return false;

  const total = (
    (revenueRules.artist || 0) +
    (revenueRules.label || 0) +
    (revenueRules.publisher || 0) +
    (revenueRules.producer || 0) +
    (revenueRules.platform || 0)
  );

  return Math.abs(total - 100) < 0.01;
}

export default function RevenueDisplay({ experience }) {
  if (!experience.revenueRules) {
    return null;
  }

  const calculation = calculateRevenueSplit(
    experience.totalRevenue || 0,
    experience.revenueRules
  );

  if (!calculation) return null;

  const entries = Object.entries(calculation.payouts)
    .filter(([_, amount]) => amount > 0)
    .sort(([_, a], [__, b]) => b - a);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between border-b border-neutral-800 pb-3">
        <h3 className="text-sm font-medium text-neutral-400">REVENUE POOL</h3>
        <div className="text-2xl font-light text-white">
          ${calculation.totalDollars.toFixed(2)}
        </div>
      </div>

      <div className="space-y-3">
        {entries.map(([role, cents]) => {
          const percentage = calculation.splits[role];
          const dollars = cents / 100;

          return (
            <div key={role} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-1 bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-neutral-300 uppercase">
                  {role}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-white">${dollars.toFixed(2)}</div>
                <div className="text-xs text-neutral-500">{percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}