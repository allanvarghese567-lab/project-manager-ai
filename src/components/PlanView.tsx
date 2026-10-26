import { useState, type ReactNode } from 'react';
import type { OnboardingPlan, Phase, Risk, Task, TaskStatus } from '../types/plan';
import { exportAsDoc, exportAsJson, exportAsPdf, exportAsPng, nextStatus } from '../utils/exportPlan';

interface PlanViewProps {
  plan: OnboardingPlan | null;
  onPlanChange?: (plan: OnboardingPlan) => void;
}

type Mode = 'view' | 'edit';

function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  return <span className={`badge badge-${tone || 'neutral'}`}>{children}</span>;
}

function statusTone(status: string): string {
  if (status === 'done') return 'info';
  if (status === 'in_progress') return 'warn';
  if (status === 'blocked') return 'danger';
  return 'neutral';
}

function ExportBar({
  elementId,
  title,
  name,
  plan,
}: {
  elementId: string;
  title: string;
  name: string;
  plan: OnboardingPlan;
}) {
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
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => exportAsJson(plan, name)}
      >
        JSON
      </button>
    </div>
  );
}

function PhaseCard({ phase, index }: { phase: Phase; index: number }) {
  return (
    <article className="phase-card" id={phase.id}>
      <header className="phase-header">
        <span className="phase-index">Phase {index + 1}</span>
        <h3 className="phase-name">{phase.name}</h3>
      </header>
      <p className="phase-objective">{phase.objective}</p>
      <div className="phase-section">
        <h4>Tasks</h4>
        <ul className="task-list">
          {phase.tasks.map((task) => (
            <li key={task.id} className="task-item">
              <div className="task-title-row">
                <strong>{task.title}</strong>
                <Badge tone={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warn' : 'neutral'}>
                  {task.priority}
                </Badge>
                <Badge tone={statusTone(task.status)}>{task.status.replace(/_/g, ' ')}</Badge>
              </div>
              <p className="task-desc">{task.description}</p>
              <div className="task-meta">
                <span>Owner: {task.owner}</span>
              </div>
              {task.acceptance_criteria.length > 0 && (
                <ul className="criteria-list">
                  {task.acceptance_criteria.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
      {phase.expected_outcomes.length > 0 && (
        <div className="phase-section">
          <h4>Expected outcomes</h4>
          <ul>
            {phase.expected_outcomes.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </div>
      )}
      {phase.client_decisions_required.length > 0 && (
        <div className="phase-section decisions">
          <h4>Client decisions required</h4>
          <ul>
            {phase.client_decisions_required.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function RiskRow({ risk }: { risk: Risk }) {
  return (
    <tr>
      <td>{risk.description}</td>
      <td>
        <Badge tone={risk.impact === 'high' ? 'danger' : risk.impact === 'medium' ? 'warn' : 'neutral'}>
          {risk.impact}
        </Badge>
      </td>
      <td>
        <Badge tone={risk.likelihood === 'high' ? 'danger' : risk.likelihood === 'medium' ? 'warn' : 'neutral'}>
          {risk.likelihood}
        </Badge>
      </td>
      <td>{risk.mitigation}</td>
      <td>{risk.owner}</td>
    </tr>
  );
}

function ReadonlyBody({ plan }: { plan: OnboardingPlan }) {
  const { project, client_onboarding, risks, dependencies, assumptions, open_questions, next_actions, metadata } =
    plan;
  return (
    <div id="onboarding-export-root" className="plan-view">
      <section className="overview-card">
        <h2>Project overview</h2>
        <dl className="overview-grid">
          <div>
            <dt>Name</dt>
            <dd>{project.name}</dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>{project.type.replace(/_/g, ' ')}</dd>
          </div>
          <div>
            <dt>Business domain</dt>
            <dd>{project.business_domain}</dd>
          </div>
          <div>
            <dt>Current status</dt>
            <dd>{project.current_status}</dd>
          </div>
          <div>
            <dt>Technology stack</dt>
            <dd>
              <ul className="inline-tags">
                {project.technology_stack.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt>Team</dt>
            <dd>
              <ul className="inline-tags">
                {project.team.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt>Client stakeholders</dt>
            <dd>
              <ul className="inline-tags">
                {project.client_stakeholders.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt>Known issues</dt>
            <dd>{project.known_issues}</dd>
          </div>
        </dl>
        <p className="meta-note">
          Generated via {metadata.generation_method} at {new Date(metadata.generated_at).toLocaleString()}.{' '}
          {metadata.notes}
        </p>
      </section>

      <section className="phases-section">
        <h2>Onboarding phases</h2>
        <div className="phases-grid">
          {client_onboarding.phases.map((phase, index) => (
            <PhaseCard key={phase.id} phase={phase} index={index} />
          ))}
        </div>
      </section>

      <section className="risks-section">
        <h2>Risks</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Impact</th>
                <th>Likelihood</th>
                <th>Mitigation</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((r) => (
                <RiskRow key={r.id} risk={r} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="side-panels">
        <section className="list-card">
          <h2>Dependencies</h2>
          <ul>
            {dependencies.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </section>
        <section className="list-card">
          <h2>Assumptions</h2>
          <ul>
            {assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </section>
        <section className="list-card highlight">
          <h2>Open questions</h2>
          <ul>
            {open_questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </section>
        <section className="list-card action">
          <h2>Immediate next actions</h2>
          <ol>
            {next_actions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ol>
        </section>
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
  const updatePhase = (phaseId: string, patch: Partial<Phase>) => {
    const phases = plan.client_onboarding.phases.map((p) =>
      p.id === phaseId ? { ...p, ...patch } : p
    );
    onPlanChange({
      ...plan,
      client_onboarding: { ...plan.client_onboarding, phases },
    });
  };

  const updateTask = (phaseId: string, taskId: string, patch: Partial<Task>) => {
    const phases = plan.client_onboarding.phases.map((p) => {
      if (p.id !== phaseId) return p;
      return {
        ...p,
        tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
      };
    });
    onPlanChange({
      ...plan,
      client_onboarding: { ...plan.client_onboarding, phases },
    });
  };

  const cycleTaskStatus = (phaseId: string, task: Task) => {
    updateTask(phaseId, task.id, { status: nextStatus(task.status) as TaskStatus });
  };

  return (
    <div className="edit-view">
      <p className="json-help">
        Edit phase names, objectives, task titles/descriptions, owners, and cycle task status. Changes update
        the plan live (also reflected in JSON View).
      </p>
      {plan.client_onboarding.phases.map((phase, index) => (
        <div key={phase.id} className="edit-card">
          <div className="edit-card-header">
            <span className="phase-index">Phase {index + 1}</span>
            <input
              className="edit-input"
              value={phase.name}
              onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
              aria-label={`Phase ${index + 1} name`}
            />
          </div>
          <label className="edit-field">
            <span>Objective</span>
            <textarea
              rows={2}
              value={phase.objective}
              onChange={(e) => updatePhase(phase.id, { objective: e.target.value })}
            />
          </label>
          <h4 className="edit-subheading">Tasks</h4>
          {phase.tasks.map((task) => (
            <div key={task.id} className="edit-task">
              <div className="edit-task-row">
                <input
                  className="edit-input"
                  value={task.title}
                  onChange={(e) => updateTask(phase.id, task.id, { title: e.target.value })}
                  aria-label="Task title"
                />
                <button
                  type="button"
                  className={`btn btn-sm status-btn status-${task.status}`}
                  onClick={() => cycleTaskStatus(phase.id, task)}
                  title="Click to cycle status"
                >
                  {task.status.replace(/_/g, ' ')}
                </button>
              </div>
              <textarea
                rows={2}
                value={task.description}
                onChange={(e) => updateTask(phase.id, task.id, { description: e.target.value })}
                aria-label="Task description"
              />
              <input
                className="edit-input"
                value={task.owner}
                onChange={(e) => updateTask(phase.id, task.id, { owner: e.target.value })}
                aria-label="Task owner"
                placeholder="Owner"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function PlanView({ plan, onPlanChange }: PlanViewProps) {
  const [mode, setMode] = useState<Mode>('view');

  if (!plan) {
    return (
      <div className="empty-state">
        <h3>No plan yet</h3>
        <p>
          Fill in project details above and click <strong>Generate Plan</strong>, or paste JSON in JSON View and
          Apply.
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
            elementId="onboarding-export-root"
            title={`${plan.project.name} — Onboarding Plan`}
            name={`${plan.project.name}-onboarding`}
            plan={plan}
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
