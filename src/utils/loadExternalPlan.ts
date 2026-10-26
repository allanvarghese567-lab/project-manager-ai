import type { FormState, OnboardingPlan } from '../types/plan';
import { DEFAULT_PROMPT } from '../types/plan';
import { isValidPlan } from './generatePlan';

export type ExternalSource =
  | 'url_query'
  | 'url_hash'
  | 'window_global'
  | 'post_message'
  | 'none';

export interface ExternalLoadResult {
  plan: OnboardingPlan | null;
  form: FormState | null;
  source: ExternalSource;
  error: string | null;
}

/** Map plan → form fields (same logic as JsonView). */
export function planToForm(plan: OnboardingPlan): FormState {
  const p = plan.project;
  const ctx = plan.context_used;
  return {
    projectName: p.name || '',
    businessDomain: p.business_domain || '',
    technologyStack: Array.isArray(p.technology_stack) ? p.technology_stack.join(', ') : '',
    team: Array.isArray(p.team) ? p.team.join(', ') : '',
    clientContacts: Array.isArray(p.client_stakeholders) ? p.client_stakeholders.join(', ') : '',
    currentStatus: p.current_status || '',
    knownIssues: p.known_issues || '',
    previousContext: ctx?.previous_context || '',
    projectManagementPrompt: ctx?.project_management_prompt || DEFAULT_PROMPT,
  };
}

function tryParsePlan(raw: string): OnboardingPlan | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // 1) Plain JSON
  try {
    const parsed = JSON.parse(trimmed);
    if (isValidPlan(parsed)) return parsed;
  } catch {
    /* continue */
  }

  // 2) URL-encoded JSON
  try {
    const decoded = decodeURIComponent(trimmed);
    const parsed = JSON.parse(decoded);
    if (isValidPlan(parsed)) return parsed;
  } catch {
    /* continue */
  }

  // 3) Base64 (standard or URL-safe)
  try {
    const b64 = trimmed.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(b64);
    const parsed = JSON.parse(json);
    if (isValidPlan(parsed)) return parsed;
  } catch {
    /* continue */
  }

  return null;
}

function readQueryParam(name: string): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const v = params.get(name);
    return v && v.trim() ? v.trim() : null;
  } catch {
    return null;
  }
}

function readHashParam(name: string): string | null {
  try {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return null;
    // Support #plan=... or #data=...
    if (hash.startsWith(`${name}=`)) {
      return hash.slice(name.length + 1);
    }
    const params = new URLSearchParams(hash);
    const v = params.get(name);
    return v && v.trim() ? v.trim() : null;
  } catch {
    return null;
  }
}

/**
 * On first page load, try external sources in order:
 * 1. ?plan= or ?data= (URL-encoded JSON or base64)
 * 2. #plan= or #data=
 * 3. window.__INITIAL_PLAN__ (object or JSON string)
 *
 * If none → empty (new plan).
 */
export function loadExternalPlanOnBoot(): ExternalLoadResult {
  // Query
  for (const key of ['plan', 'data'] as const) {
    const raw = readQueryParam(key);
    if (raw) {
      const plan = tryParsePlan(raw);
      if (plan) {
        return { plan, form: planToForm(plan), source: 'url_query', error: null };
      }
      return {
        plan: null,
        form: null,
        source: 'url_query',
        error: `URL ?${key}= was present but is not valid plan JSON.`,
      };
    }
  }

  // Hash
  for (const key of ['plan', 'data'] as const) {
    const raw = readHashParam(key);
    if (raw) {
      const plan = tryParsePlan(raw);
      if (plan) {
        return { plan, form: planToForm(plan), source: 'url_hash', error: null };
      }
      return {
        plan: null,
        form: null,
        source: 'url_hash',
        error: `URL #${key}= was present but is not valid plan JSON.`,
      };
    }
  }

  // Global injected by host page / iframe parent
  try {
    const w = window as unknown as { __INITIAL_PLAN__?: unknown };
    if (w.__INITIAL_PLAN__ != null) {
      const val = w.__INITIAL_PLAN__;
      if (typeof val === 'string') {
        const plan = tryParsePlan(val);
        if (plan) {
          return { plan, form: planToForm(plan), source: 'window_global', error: null };
        }
      } else if (isValidPlan(val)) {
        return {
          plan: val as OnboardingPlan,
          form: planToForm(val as OnboardingPlan),
          source: 'window_global',
          error: null,
        };
      }
      return {
        plan: null,
        form: null,
        source: 'window_global',
        error: 'window.__INITIAL_PLAN__ was set but is not a valid plan.',
      };
    }
  } catch {
    /* ignore */
  }

  return { plan: null, form: null, source: 'none', error: null };
}

/**
 * Accept runtime messages from a parent frame / external host:
 *   { type: 'project-manager-ai:load-plan', plan: <OnboardingPlan|string> }
 *   { type: 'project-manager-ai:clear' }
 */
export function parseIncomingMessage(data: unknown): {
  action: 'load' | 'clear' | null;
  plan: OnboardingPlan | null;
  error: string | null;
} {
  if (!data || typeof data !== 'object') {
    return { action: null, plan: null, error: null };
  }
  const msg = data as { type?: string; plan?: unknown };
  if (msg.type === 'project-manager-ai:clear') {
    return { action: 'clear', plan: null, error: null };
  }
  if (msg.type === 'project-manager-ai:load-plan') {
    if (typeof msg.plan === 'string') {
      const plan = tryParsePlan(msg.plan);
      if (plan) return { action: 'load', plan, error: null };
      return { action: 'load', plan: null, error: 'postMessage plan string is not valid JSON plan.' };
    }
    if (isValidPlan(msg.plan)) {
      return { action: 'load', plan: msg.plan as OnboardingPlan, error: null };
    }
    return { action: 'load', plan: null, error: 'postMessage plan object is not a valid plan.' };
  }
  return { action: null, plan: null, error: null };
}
