import { useEffect, useState } from 'react';
import type { FormState, OnboardingPlan } from '../types/plan';
import { DEFAULT_PROMPT } from '../types/plan';
import { isValidPlan } from '../utils/generatePlan';

interface JsonViewProps {
  plan: OnboardingPlan | null;
  onValidPlan: (plan: OnboardingPlan) => void;
  onApplyForm: (form: FormState) => void;
}

/** Extract form fields from a plan so the input form mirrors the loaded JSON */
function planToForm(plan: OnboardingPlan): FormState {
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

export function JsonView({ plan, onValidPlan, onApplyForm }: JsonViewProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [applyStatus, setApplyStatus] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (plan && !isDirty) {
      setText(JSON.stringify(plan, null, 2));
      setError(null);
    }
  }, [plan, isDirty]);

  const tryParseAndValidate = (): OnboardingPlan | null => {
    try {
      const parsed = JSON.parse(text);
      if (!isValidPlan(parsed)) {
        setError(
          'JSON is syntactically valid but does not match the expected onboarding plan schema (missing required top-level fields).'
        );
        return null;
      }
      setError(null);
      return parsed;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid JSON';
      setError(msg);
      return null;
    }
  };

  const handleValidate = () => {
    const parsed = tryParseAndValidate();
    if (parsed) {
      setIsDirty(false);
      onValidPlan(parsed);
      setApplyStatus('Validated — plan applied to views');
      setTimeout(() => setApplyStatus(null), 2500);
    }
  };

  /** Apply JSON → update plan (Onboarding + SDLC) AND fill the input form fields */
  const handleApply = () => {
    const parsed = tryParseAndValidate();
    if (!parsed) return;

    setIsDirty(false);
    onValidPlan(parsed);
    onApplyForm(planToForm(parsed));
    setApplyStatus('Applied — form fields and all views updated');
    setTimeout(() => setApplyStatus(null), 3000);
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(text);
      setText(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid JSON';
      setError(msg);
    }
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopyStatus('Copied to clipboard');
      } else {
        const el = document.getElementById('json-editor') as HTMLTextAreaElement | null;
        if (el) {
          el.select();
          document.execCommand('copy');
          setCopyStatus('Copied (fallback)');
        } else {
          setCopyStatus('Clipboard unavailable — select and copy manually');
        }
      }
    } catch {
      setCopyStatus('Clipboard access failed — select and copy manually');
    }
    setTimeout(() => setCopyStatus(null), 2500);
  };

  const handleRestore = () => {
    if (plan) {
      setText(JSON.stringify(plan, null, 2));
      setError(null);
      setIsDirty(false);
    }
  };

  return (
    <div className="json-view">
      <div className="json-toolbar">
        <button type="button" className="btn btn-primary" onClick={handleApply}>
          Apply JSON
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleValidate}>
          Validate only
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleFormat}>
          Format JSON
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleCopy} disabled={!text.trim()}>
          Copy JSON
        </button>
        <button type="button" className="btn btn-ghost" onClick={handleRestore} disabled={!plan || !isDirty}>
          Restore generated
        </button>
        {copyStatus && <span className="form-hint success-hint">{copyStatus}</span>}
        {applyStatus && <span className="form-hint success-hint">{applyStatus}</span>}
        {error && <span className="form-hint error-hint" role="alert">{error}</span>}
        {!error && isDirty && (
          <span className="form-hint warn-hint">Unsaved edits — click Apply JSON to update form + views</span>
        )}
      </div>

      <p className="json-help">
        Paste a full plan JSON below, then click <strong>Apply JSON</strong>. This will fill the input form
        fields and refresh the Onboarding and SDLC views.
      </p>

      <label className="sr-only" htmlFor="json-editor">
        JSON editor
      </label>
      <textarea
        id="json-editor"
        className="json-editor"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setIsDirty(true);
          setError(null);
          setApplyStatus(null);
        }}
        placeholder={
          plan
            ? undefined
            : '{\n  "schema_version": "1.0",\n  "project": { ... },\n  ...\n}'
        }
        spellCheck={false}
        rows={28}
      />
    </div>
  );
}
