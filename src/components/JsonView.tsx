import { useEffect, useState } from 'react';
import type { OnboardingPlan } from '../types/plan';
import { isValidPlan } from '../utils/generatePlan';

interface JsonViewProps {
  plan: OnboardingPlan | null;
  onValidPlan: (plan: OnboardingPlan) => void;
}

export function JsonView({ plan, onValidPlan }: JsonViewProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (plan && !isDirty) {
      setText(JSON.stringify(plan, null, 2));
      setError(null);
    }
  }, [plan, isDirty]);

  const handleValidate = () => {
    try {
      const parsed = JSON.parse(text);
      if (!isValidPlan(parsed)) {
        setError(
          'JSON is syntactically valid but does not match the expected onboarding plan schema (missing required top-level fields).'
        );
        return;
      }
      setError(null);
      setIsDirty(false);
      onValidPlan(parsed);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid JSON';
      setError(msg);
    }
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
        // Fallback: select textarea content
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

  if (!plan) {
    return (
      <div className="empty-state">
        <h3>No JSON yet</h3>
        <p>Generate a plan first. You can then edit, validate, format, and copy the JSON here.</p>
      </div>
    );
  }

  return (
    <div className="json-view">
      <div className="json-toolbar">
        <button type="button" className="btn btn-secondary" onClick={handleValidate}>
          Validate JSON
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleFormat}>
          Format JSON
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleCopy}>
          Copy JSON
        </button>
        <button type="button" className="btn btn-ghost" onClick={handleRestore} disabled={!isDirty}>
          Restore generated
        </button>
        {copyStatus && <span className="form-hint success-hint">{copyStatus}</span>}
        {error && <span className="form-hint error-hint" role="alert">{error}</span>}
        {!error && isDirty && (
          <span className="form-hint warn-hint">Unvalidated edits — Validate to apply to UI View</span>
        )}
      </div>

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
        }}
        spellCheck={false}
        rows={28}
      />
    </div>
  );
}
