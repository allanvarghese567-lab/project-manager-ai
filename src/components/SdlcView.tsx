import type { OnboardingPlan, SdlcStage } from '../types/plan';

interface SdlcViewProps {
  plan: OnboardingPlan | null;
}

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
                  <span className="badge badge-neutral">{a.status.replace('_', ' ')}</span>
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

export function SdlcView({ plan }: SdlcViewProps) {
  if (!plan || !plan.sdlc) {
    return (
      <div className="empty-state">
        <h3>No SDLC view yet</h3>
        <p>
          Generate a plan first. SDLC-aligned stages (Requirements → Design → Implementation → Testing →
          Deployment → Maintenance) will appear here, adapted for legacy project takeover.
        </p>
      </div>
    );
  }

  const { sdlc, project } = plan;
  const stages = [...sdlc.stages].sort(
    (a, b) => STAGE_ORDER.indexOf(a.id) - STAGE_ORDER.indexOf(b.id)
  );

  return (
    <div className="sdlc-view">
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
              {i < stages.length - 1 && <span className="pipe-arrow" aria-hidden="true">→</span>}
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
