import type { OnboardingPlan } from '../types/plan';
import { exportAsCsv, exportAsJson } from '../utils/exportPlan';

interface CsvViewProps {
  plan: OnboardingPlan | null;
}

function taskRows(plan: OnboardingPlan): { headers: string[]; rows: (string | number)[][] } {
  const headers = [
    'Phase',
    'Phase ID',
    'Task ID',
    'Title',
    'Description',
    'Owner',
    'Priority',
    'Status',
    'Acceptance criteria',
  ];
  const rows: (string | number)[][] = [];
  for (const phase of plan.client_onboarding.phases) {
    for (const task of phase.tasks) {
      rows.push([
        phase.name,
        phase.id,
        task.id,
        task.title,
        task.description,
        task.owner,
        task.priority,
        task.status,
        task.acceptance_criteria.join('; '),
      ]);
    }
  }
  return { headers, rows };
}

function riskRows(plan: OnboardingPlan): { headers: string[]; rows: (string | number)[][] } {
  const headers = ['ID', 'Description', 'Impact', 'Likelihood', 'Mitigation', 'Owner'];
  const rows = plan.risks.map((r) => [
    r.id,
    r.description,
    r.impact,
    r.likelihood,
    r.mitigation,
    r.owner,
  ]);
  return { headers, rows };
}

function activityRows(plan: OnboardingPlan): { headers: string[]; rows: (string | number)[][] } {
  const headers = [
    'Stage',
    'Stage ID',
    'Activity ID',
    'Title',
    'Description',
    'Owner',
    'Status',
    'Deliverables',
  ];
  const rows: (string | number)[][] = [];
  for (const stage of plan.sdlc.stages) {
    for (const a of stage.activities) {
      rows.push([
        stage.name,
        stage.id,
        a.id,
        a.title,
        a.description,
        a.owner,
        a.status,
        a.deliverables.join('; '),
      ]);
    }
  }
  return { headers, rows };
}

function projectRows(plan: OnboardingPlan): { headers: string[]; rows: (string | number)[][] } {
  const p = plan.project;
  const headers = ['Field', 'Value'];
  const rows: (string | number)[][] = [
    ['Name', p.name],
    ['Type', p.type],
    ['Business domain', p.business_domain],
    ['Technology stack', p.technology_stack.join('; ')],
    ['Current status', p.current_status],
    ['Team', p.team.join('; ')],
    ['Client stakeholders', p.client_stakeholders.join('; ')],
    ['Known issues', p.known_issues],
  ];
  return { headers, rows };
}

function DataTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CsvView({ plan }: CsvViewProps) {
  if (!plan) {
    return (
      <div className="empty-state">
        <h3>No CSV data yet</h3>
        <p>Generate a plan or Apply JSON first. Tabular exports will appear here.</p>
      </div>
    );
  }

  const base = plan.project.name || 'plan';
  const tasks = taskRows(plan);
  const risks = riskRows(plan);
  const activities = activityRows(plan);
  const project = projectRows(plan);

  return (
    <div className="csv-view">
      <div className="export-bar csv-export-bar">
        <span className="export-label">Export</span>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => exportAsCsv(tasks.headers, tasks.rows, `${base}-tasks`)}
        >
          Tasks CSV
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => exportAsCsv(risks.headers, risks.rows, `${base}-risks`)}
        >
          Risks CSV
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => exportAsCsv(activities.headers, activities.rows, `${base}-sdlc-activities`)}
        >
          SDLC activities CSV
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => exportAsCsv(project.headers, project.rows, `${base}-project`)}
        >
          Project CSV
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => exportAsJson(plan, `${base}-full`)}
        >
          Full JSON
        </button>
      </div>

      <p className="json-help">
        Preview tables below. Use the buttons above to download CSV files (Excel-friendly) or the full plan as
        JSON.
      </p>

      <section className="csv-section">
        <h2>Project overview</h2>
        <DataTable headers={project.headers} rows={project.rows} />
      </section>

      <section className="csv-section">
        <h2>Onboarding tasks ({tasks.rows.length})</h2>
        <DataTable headers={tasks.headers} rows={tasks.rows} />
      </section>

      <section className="csv-section">
        <h2>Risks ({risks.rows.length})</h2>
        <DataTable headers={risks.headers} rows={risks.rows} />
      </section>

      <section className="csv-section">
        <h2>SDLC activities ({activities.rows.length})</h2>
        <DataTable headers={activities.headers} rows={activities.rows} />
      </section>
    </div>
  );
}
