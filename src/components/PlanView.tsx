import type { ReactNode } from 'react';
import type { OnboardingPlan, Phase, Risk } from '../types/plan';

interface PlanViewProps {
  plan: OnboardingPlan | null;
}

function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  return <span className={`badge badge-${tone || 'neutral'}`}>{children}</span>;
}

function PhaseCard({ phase, index }: { phase: Phase; index: number }) {
  return (
    <article className="phase-card" id={phase.id}>
      <header className="phase-header">
        <span className="phase-index">Phase {index + 1}</span>
        <h3 className="phase-name">{phase.name}</h3>
        <Badge tone="info">not started</Badge>
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
              </div>
              <p className="task-desc">{task.description}</p>
              <div className="task-meta">
                <span>Owner: {task.owner}</span>
                <span>Status: {task.status.replace('_', ' ')}</span>
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

export function PlanView({ plan }: PlanViewProps) {
  if (!plan) {
    return (
      <div className="empty-state">
        <h3>No plan yet</h3>
        <p>
          Fill in project details above and click <strong>Generate Plan</strong>. The result is a structured
          template based on your inputs — not an AI analysis of pasted text.
        </p>
      </div>
    );
  }

  const { project, client_onboarding, risks, dependencies, assumptions, open_questions, next_actions, metadata } =
    plan;

  return (
    <div className="plan-view">
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
