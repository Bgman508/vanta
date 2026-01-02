import { useEffect, useState } from 'react';

/**
 * Rights Engine - Evaluates access to an Experience
 * Based on tier, territory, time windows, and user role
 * NO play counts, NO streaming logic
 */
export function useAccessEvaluation(experience, user, attendance) {
  const [evaluation, setEvaluation] = useState({
    allowed: false,
    matchedTier: null,
    reason: null,
    requiresPayment: false,
    price: 0
  });

  useEffect(() => {
    if (!experience || !user) {
      setEvaluation({ allowed: false, reason: 'Missing data' });
      return;
    }

    // If user already has attendance, they have access
    if (attendance) {
      setEvaluation({
        allowed: true,
        matchedTier: attendance.tier,
        reason: 'Already unlocked'
      });
      return;
    }

    // Owner always has access
    if (experience.ownerId === user.id) {
      setEvaluation({
        allowed: true,
        matchedTier: 'owner',
        reason: 'Owner access'
      });
      return;
    }

    // Check experience state
    if (experience.state === 'draft') {
      setEvaluation({ allowed: false, reason: 'Not yet published' });
      return;
    }

    if (experience.state === 'expired') {
      setEvaluation({ allowed: false, reason: 'Experience expired' });
      return;
    }

    // Evaluate access rules
    const accessRules = experience.accessRules || [];
    const userTerritory = user.territory || 'US';
    const now = new Date();

    for (const rule of accessRules) {
      // Check territory
      if (rule.territories && rule.territories.length > 0) {
        if (!rule.territories.includes(userTerritory)) {
          continue;
        }
      }

      // Check time windows
      if (rule.startTime && new Date(rule.startTime) > now) {
        continue;
      }
      if (rule.endTime && new Date(rule.endTime) < now) {
        continue;
      }

      // Check tier
      if (rule.tier === 'free') {
        setEvaluation({
          allowed: true,
          matchedTier: 'free',
          reason: 'Free access available',
          requiresPayment: false,
          price: 0
        });
        return;
      }

      if (rule.tier === 'paid') {
        setEvaluation({
          allowed: false,
          matchedTier: 'paid',
          reason: 'Payment required',
          requiresPayment: true,
          price: rule.price || 0
        });
        return;
      }

      if (rule.tier === 'invite') {
        setEvaluation({
          allowed: false,
          matchedTier: 'invite',
          reason: 'Invite required'
        });
        return;
      }

      if (rule.tier === 'event') {
        setEvaluation({
          allowed: false,
          matchedTier: 'event',
          reason: 'Event access required'
        });
        return;
      }
    }

    // No matching rules
    setEvaluation({ allowed: false, reason: 'No access rules matched' });
  }, [experience, user, attendance]);

  return evaluation;
}

export default function AccessEvaluator({ children, evaluation }) {
  return children(evaluation);
}