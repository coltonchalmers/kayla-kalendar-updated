import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { AvailabilityRule, AvailabilityOverride } from '@/lib/types';

export function useAvailability(userId?: string) {
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async (signal?: AbortSignal) => {
    let query = supabase
      .from('availability_rules')
      .select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (signal) {
      query = query.abortSignal(signal);
    }
    const { data, error: queryError } = await query
      .order('day_of_week')
      .order('start_time');

    if (queryError) {
      if (signal?.aborted) return;
      console.error('Error fetching rules:', queryError);
      setError(queryError.message);
    } else {
      if (signal?.aborted) return;
      setRules(data || []);
    }
  }, [userId]);

  const fetchOverrides = useCallback(async (signal?: AbortSignal) => {
    let query = supabase
      .from('availability_overrides')
      .select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (signal) {
      query = query.abortSignal(signal);
    }
    const { data, error: queryError } = await query
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date');

    if (queryError) {
      if (signal?.aborted) return;
      console.error('Error fetching overrides:', queryError);
      setError(queryError.message);
    } else {
      if (signal?.aborted) return;
      setOverrides(data || []);
    }
  }, [userId]);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    setLoading(true);

    Promise.all([fetchRules(controller.signal), fetchOverrides(controller.signal)])
      .then(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [fetchRules, fetchOverrides, userId]);

  const addRule = useCallback(async (rule: { day_of_week: number; start_time: string; end_time: string }) => {
    const { data, error: mutationError } = await supabase
      .from('availability_rules')
      .insert(rule)
      .select()
      .single();

    if (mutationError) throw mutationError;
    setRules(prev => [...prev, data]);
    return data;
  }, []);

  const updateRule = useCallback(async (id: string, updates: Partial<AvailabilityRule>) => {
    const { data, error: mutationError } = await supabase
      .from('availability_rules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (mutationError) throw mutationError;
    setRules(prev => prev.map(r => r.id === id ? data : r));
    return data;
  }, []);

  const deleteRule = useCallback(async (id: string) => {
    const { error: mutationError } = await supabase
      .from('availability_rules')
      .delete()
      .eq('id', id);

    if (mutationError) throw mutationError;
    setRules(prev => prev.filter(r => r.id !== id));
  }, []);

  const addOverride = useCallback(async (override: {
    date: string;
    is_blocked: boolean;
    start_time?: string;
    end_time?: string;
    reason?: string;
  }) => {
    const { data, error: mutationError } = await supabase
      .from('availability_overrides')
      .insert(override)
      .select()
      .single();

    if (mutationError) throw mutationError;
    setOverrides(prev => [...prev, data]);
    return data;
  }, []);

  const deleteOverride = useCallback(async (id: string) => {
    const { error: mutationError } = await supabase
      .from('availability_overrides')
      .delete()
      .eq('id', id);

    if (mutationError) throw mutationError;
    setOverrides(prev => prev.filter(o => o.id !== id));
  }, []);

  return {
    rules,
    overrides,
    loading,
    error,
    addRule,
    updateRule,
    deleteRule,
    addOverride,
    deleteOverride,
    refresh: () => Promise.all([fetchRules(), fetchOverrides()]),
  };
}
