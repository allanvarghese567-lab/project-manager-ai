import type { FormState } from '../types/plan';

interface ProjectFormProps {
  form: FormState;
  onChange: (next: FormState) => void;
  onGenerate: () => void;
  onReset: () => void;
  isGenerating: boolean;
  hasResult: boolean;
}

export function ProjectForm({
  form,
  onChange,
  onGenerate,
  onReset,
  isGenerating,
  hasResult,
}: ProjectFormProps) {
  const update = (field: keyof FormState, value: string) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <section className="panel form-panel" aria-labelledby="form-heading">
      <div className="panel-header">
        <h2 id="form-heading">Project Inputs</h2>
        <p className="panel-subtitle">
          Enter known project details. Pasted context is stored for reference only — it is not automatically analysed.
        </p>
      </div>

      <div className="form-grid">
        <label className="field">
          <span className="field-label">Project name</span>
          <input
            type="text"
            value={form.projectName}
            onChange={(e) => update('projectName', e.target.value)}
            placeholder="e.g. Acme Order Management System"
            autoComplete="off"
          />
        </label>

        <label className="field">
          <span className="field-label">Business domain</span>
          <input
            type="text"
            value={form.businessDomain}
            onChange={(e) => update('businessDomain', e.target.value)}
            placeholder="e.g. Retail order fulfilment"
            autoComplete="off"
          />
        </label>

        <label className="field field-full">
          <span className="field-label">Technology stack</span>
          <input
            type="text"
            value={form.technologyStack}
            onChange={(e) => update('technologyStack', e.target.value)}
            placeholder="Comma-separated, e.g. Java, Spring Boot, Oracle, Angular"
            autoComplete="off"
          />
        </label>

        <label className="field">
          <span className="field-label">Team</span>
          <input
            type="text"
            value={form.team}
            onChange={(e) => update('team', e.target.value)}
            placeholder="Comma-separated roles or names"
            autoComplete="off"
          />
        </label>

        <label className="field">
          <span className="field-label">Client contacts / stakeholders</span>
          <input
            type="text"
            value={form.clientContacts}
            onChange={(e) => update('clientContacts', e.target.value)}
            placeholder="Comma-separated names or roles"
            autoComplete="off"
          />
        </label>

        <label className="field field-full">
          <span className="field-label">Current status</span>
          <textarea
            rows={2}
            value={form.currentStatus}
            onChange={(e) => update('currentStatus', e.target.value)}
            placeholder="Brief status, e.g. Live in production, limited documentation, two open P1 defects"
          />
        </label>

        <label className="field field-full">
          <span className="field-label">Known issues</span>
          <textarea
            rows={2}
            value={form.knownIssues}
            onChange={(e) => update('knownIssues', e.target.value)}
            placeholder="Known defects, operational problems, or constraints"
          />
        </label>

        <label className="field field-full">
          <span className="field-label">Previous context</span>
          <textarea
            rows={4}
            value={form.previousContext}
            onChange={(e) => update('previousContext', e.target.value)}
            placeholder="Paste meeting notes, prior prompts, or discussion excerpts. Used for reference only — not parsed automatically."
          />
        </label>

        <label className="field field-full">
          <span className="field-label">Project management prompt</span>
          <textarea
            rows={5}
            value={form.projectManagementPrompt}
            onChange={(e) => update('projectManagementPrompt', e.target.value)}
            placeholder="Instructions that shape the generated plan template"
          />
        </label>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating…' : 'Generate Plan'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onReset}
          disabled={isGenerating}
        >
          Reset
        </button>
        {hasResult && (
          <span className="form-hint success-hint">Plan generated — review UI View and JSON View below.</span>
        )}
      </div>
    </section>
  );
}
