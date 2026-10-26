import { useState } from 'react';
import type { OnboardingPlan, SdlcActivity, SdlcStage, TaskStatus } from '../types/plan';
import { exportAsDoc, exportAsPdf, exportAsPng, nextStatus } from '../utils/exportPlan';

interface SdlcViewProps {
  plan: OnboardingPlan | null;
  onPlanChange?: (plan: OnboardingPlan) => void;
}

type Mode = 'view' | 'edit';

const STAGE_ORDER = [
  'requirements',
  'design',
  'implementation',
  'testing',
  'deployment',
  'maintenance',
] as const;

const STAGE_SHORT: Record<string, string> = {
  requirements: 'REQ',
  design: 'DES',
  implementation: 'IMP',
  testing: 'TST',
  deployment: 'DEP',
  maintenance: 'MNT',
};

function ExportBar({ elementId, title, name }: { elementId: string; title: string; name: string }) {
  return (
    <div className="export-bar">
      <span className="export-label">Download</span>
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => exportAsPdf(elementId, title)}>
        PDF
      </button>
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => exportAsDoc(elementId, name, title)}>
        DOC
      </button>
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => void exportAsPng(elementId, name)}>
        PNG
      </button>
    </div>
  );
}

function StageCard({ stage, index }: { stage: SdlcStage; index: number }) {
  return (
    <article className="sdlc-card" id={`sdlc-${stage.id}`}>
      <header className="sdlc-card-header">
        <span className="sdlc-step">{STAGE_SHORT[stage.id] || index + 1}</span>
        <div>
          <h3 className="sdlc-stage-name">{stage.name}</h3>
          <p className="sdlc-purpose">{stage.purpose}</p>
        </div>
      </header>
      <div className="sdlc-body">
        <div className="sdlc-section">
          <h4>Activities</h4>
          <ul className="sdlc-activity-list">
            {stage.activities.map((a) => (
              <li key={a.id} className="sdlc-activity">
                <div className="sdlc-activity-title">
                  <strong>{a.title}</strong>
                  <span className="badge badge-neutral">{a.status.replace(/_/g, ' ')}</span>
                </div>
                <p>{a.description}</p>
                <div className="task-meta">
                  <span>Owner: {a.owner}</span>
                </div>
                {a.deliverables.length > 0 && (
                  <ul className="criteria-list">
                    {a.deliverables.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="sdlc-meta-grid">
          <div className="sdlc-section">
            <h4>Entry criteria</h4>
            <ul>
              {stage.entry_criteria.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="sdlc-section">
            <h4>Exit criteria</h4>
            <ul>
              {stage.exit_criteria.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="sdlc-section">
            <h4>Artefacts</h4>
            <ul>
              {stage.artefacts.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="sdlc-section decisions">
            <h4>Client inputs required</h4>
            <ul>
              {stage.client_inputs_required.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="sdlc-section legacy-box">
          <h4>Legacy focus</h4>
          <ul>
            {stage.legacy_focus.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function ReadonlyBody({ plan }: { plan: OnboardingPlan }) {
  const { sdlc, project } = plan;
  const stages = [...sdlc.stages].sort(
    (a, b) => STAGE_ORDER.indexOf(a.id) - STAGE_ORDER.indexOf(b.id)
  );

  return (
    <div id="sdlc-export-root" className="sdlc-view">
      <section className="sdlc-intro">
        <h2>SDLC-aligned views</h2>
        <p>
          Stages below follow a classic SDLC sequence adapted for <strong>{project.name}</strong> as an
          existing legacy system. Model: <code>{sdlc.model}</code>.
        </p>
        <ol className="sdlc-pipeline" aria-label="SDLC pipeline">
          {stages.map((s, i) => (
            <li key={s.id}>
              <a href={`#sdlc-${s.id}`}>
                <span className="pipe-idx">{i + 1}</span>
                {s.name}
              </a>
              {i < stages.length - 1 && (
                <span className="pipe-arrow" aria-hidden="true">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
        <p className="meta-note">{sdlc.notes}</p>
      </section>
      <div className="sdlc-stages">
        {stages.map((stage, index) => (
          <StageCard key={stage.id} stage={stage} index={index} />
        ))}
      </div>
    </div>
  );
}

function EditableBody({
  plan,
  onPlanChange,
}: {
  plan: OnboardingPlan;
  onPlanChange: (plan: OnboardingPlan) => void;
}) {
  const stages = [...plan.sdlc.stages].sort(
    (a, b) => STAGE_ORDER.indexOf(a.id) - STAGE_ORDER.indexOf(b.id)
  );

  const updateStage = (stageId: string, patch: Partial<SdlcStage>) => {
    const nextStages = plan.sdlc.stages.map((s) => (s.id === stageId ? { ...s, ...patch } : s));
    onPlanChange({
      ...plan,
      sdlc: { ...plan.sdlc, stages: nextStages },
    });
  };

  const updateActivity = (stageId: string, activityId: string, patch: Partial<SdlcActivity>) => {
    const nextStages = plan.sdlc.stages.map((s) => {
      if (s.id !== stageId) return s;
      return {
        ...s,
        activities: s.activities.map((a) => (a.id === activityId ? { ...a, ...patch } : a)),
      };
    });
    onPlanChange({
      ...plan,
      sdlc: { ...plan.sdlc, stages: nextStages },
    });
  };

  const cycleActivityStatus = (stageId: string, activity: SdlcActivity) => {
    updateActivity(stageId, activity.id, {
      status: nextStatus(activity.status) as TaskStatus,
    });
  };

  return (
    <div className="edit-view">
      <p className="json-help">
        Edit stage purpose, activity titles/descriptions, owners, and cycle activity status. Changes update
        the plan live.
      </p>
      {stages.map((stage, index) => (
        <div key={stage.id} className="edit-card">
          <div className="edit-card-header">
            <span className="sdlc-step">{STAGE_SHORT[stage.id] || index + 1}</span>
            <strong>{stage.name}</strong>
          </div>
          <label className="edit-field">
            <span>Purpose</span>
            <textarea
              rows={2}
              value={stage.purpose}
              onChange={(e) => updateStage(stage.id, { purpose: e.target.value })}
            />
          </label>
          <h4 className="edit-subheading">Activities</h4>
          {stage.activities.map((activity) => (
            <div key={activity.id} className="edit-task">
              <div className="edit-task-row">
                <input
                  className="edit-input"
                  value={activity.title}
                  onChange={(e) => updateActivity(stage.id, activity.id, { title: e.target.value })}
                  aria-label="Activity title"
                />
                <button
                  type="button"
                  className={`btn btn-sm status-btn status-${activity.status}`}
                  onClick={() => cycleActivityStatus(stage.id, activity)}
                  title="Click to cycle status"
                >
                  {activity.status.replace(/_/g, ' ')}
                </button>
              </div>
              <textarea
                rows={2}
                value={activity.description}
                onChange={(e) =>
                  updateActivity(stage.id, activity.id, { description: e.target.value })
                }
                aria-label="Activity description"
              />
              <input
                className="edit-input"
                value={activity.owner}
                onChange={(e) => updateActivity(stage.id, activity.id, { owner: e.target.value })}
                aria-label="Activity owner"
                placeholder="Owner"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function SdlcView({ plan, onPlanChange }: SdlcViewProps) {
  const [mode, setMode] = useState<Mode>('view');

  if (!plan || !plan.sdlc) {
    return (
      <div className="empty-state">
        <h3>No SDLC view yet</h3>
        <p>
          Generate a plan first, or paste JSON in JSON View and Apply. SDLC stages will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="subview">
      <div className="subview-toolbar">
        <div className="sub-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={`sub-tab ${mode === 'view' ? 'active' : ''}`}
            aria-selected={mode === 'view'}
            onClick={() => setMode('view')}
          >
            View (readonly)
          </button>
          <button
            type="button"
            role="tab"
            className={`sub-tab ${mode === 'edit' ? 'active' : ''}`}
            aria-selected={mode === 'edit'}
            onClick={() => setMode('edit')}
          >
            Edit
          </button>
        </div>
        {mode === 'view' && (
          <ExportBar
            elementId="sdlc-export-root"
            title={`${plan.project.name} — SDLC Plan`}
            name={`${plan.project.name}-sdlc`}
          />
        )}
      </div>

      {mode === 'view' && <ReadonlyBody plan={plan} />}
      {mode === 'edit' && onPlanChange && <EditableBody plan={plan} onPlanChange={onPlanChange} />}
      {mode === 'edit' && !onPlanChange && (
        <p className="form-hint warn-hint">Editing is not connected. Reload the app.</p>
      )}
    </div>
  );
}
