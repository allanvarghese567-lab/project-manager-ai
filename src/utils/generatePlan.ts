import type {
  FormState,
  OnboardingPlan,
  Phase,
  Risk,
  Task,
  SdlcView,
  SdlcStage,
} from '../types/plan';

function splitList(value: string): string[] {
  return value
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function uid(prefix: string, index: number): string {
  return `${prefix}-${index + 1}`;
}

function makeTask(
  phaseIndex: number,
  taskIndex: number,
  title: string,
  description: string,
  owner: string,
  priority: Task['priority'] = 'medium',
  criteria: string[] = []
): Task {
  return {
    id: uid(`phase-${phaseIndex + 1}-task`, taskIndex),
    title,
    description,
    owner,
    priority,
    status: 'not_started',
    acceptance_criteria: criteria,
  };
}

function buildPhases(form: FormState): Phase[] {
  const domain = form.businessDomain.trim() || 'the business domain (to be confirmed)';
  const stack = form.technologyStack.trim() || 'the current technology stack (to be confirmed)';
  const issues = form.knownIssues.trim();
  const projectName = form.projectName.trim() || 'the project';

  const phases: Phase[] = [
    {
      id: 'phase-1',
      name: 'Business and Project Discovery',
      objective: `Establish a shared understanding of business goals, stakeholders, user roles, current workflows, and pain points for ${projectName} in ${domain}.`,
      tasks: [
        makeTask(0, 0, 'Stakeholder map and success criteria workshop', 'Identify primary client stakeholders, decision makers, end-user groups, and measurable success criteria for the onboarding and ongoing delivery relationship.', 'Project Team / Client', 'high', ['Named stakeholders with roles documented', 'Agreed success criteria list signed off by client sponsor']),
        makeTask(0, 1, 'Current workflow and pain-point inventory', `Document existing business workflows, known pain points, and constraints related to ${domain}. Capture any undocumented business rules surfaced during discussion.`, 'Client / Business Analyst', 'high', ['Workflow diagrams or process notes available', 'Pain points prioritised']),
        makeTask(0, 2, 'User roles and access model review', 'Clarify user personas, permission models, and any regulatory or compliance constraints that affect access.', 'Client / Security / Project Team', 'medium', ['Role matrix drafted', 'Known compliance constraints listed']),
      ],
      expected_outcomes: ['Shared understanding of business context and success criteria', 'Initial stakeholder and role map', 'Prioritised pain points'],
      client_decisions_required: ['Who is the primary sponsor and day-to-day contact?', 'Which success metrics matter most in the first 90 days?'],
    },
    {
      id: 'phase-2',
      name: 'Technical Assessment and Access',
      objective: 'Confirm access to repositories, environments, documentation, monitoring, and third-party systems, and establish a technical baseline.',
      tasks: [
        makeTask(1, 0, 'Repository and source-code ownership confirmation', 'Confirm source-code ownership, repository locations, branch strategy, and that the delivery team has read (and appropriate write) access.', 'Client / Platform Owner', 'high', ['Repositories accessible to the delivery team', 'Ownership and licence status confirmed in writing']),
        makeTask(1, 1, 'Environment and infrastructure inventory', 'Catalogue development, staging, and production environments, including configuration, secrets management approach, and infrastructure-as-code status if any.', 'Client / DevOps / Project Team', 'high', ['Environment list with access confirmed', 'Secrets handling approach documented']),
        makeTask(1, 2, 'Deployment pipeline and rollback review', 'Review how releases are built, tested, and deployed, and how rollbacks are performed. Identify gaps in CI/CD coverage.', 'Project Team', 'high', ['Pipeline overview documented', 'Rollback procedure understood and tested where possible']),
        makeTask(1, 3, 'Documentation and monitoring baseline', 'Locate existing architecture docs, runbooks, monitoring dashboards, and alert configurations. Note gaps.', 'Project Team', 'medium', ['Known documentation inventory', 'Monitoring/alerting access confirmed']),
      ],
      expected_outcomes: ['Full access to code, environments, and supporting systems', 'Architecture and deployment baseline documented', 'Gaps in documentation and observability identified'],
      client_decisions_required: ['Who grants repository, environment, and secrets access?', 'What is the approved change window for production access?', 'Are third-party vendor contracts or support agreements still active?'],
    },
    {
      id: 'phase-3',
      name: 'Codebase Review and Risk Assessment',
      objective: 'Evaluate code quality, dependencies, security posture, known defects, integrations, data flows, and technical debt to inform delivery risk.',
      tasks: [
        makeTask(2, 0, 'Dependency and library health check', `Scan for outdated, unmaintained, or vulnerable libraries in ${stack}.`, 'Project Team', 'high', ['Dependency report produced', 'Critical vulnerabilities listed']),
        makeTask(2, 1, 'Architecture and integration map', 'Document major components, data stores, external integrations, and message flows.', 'Project Team', 'high', ['Component diagram available', 'Integration list with owners']),
        makeTask(2, 2, 'Known defect and incident review', `Review open defects and recent production incidents. ${issues ? 'Incorporate known issues provided: ' + issues : 'Request defect and incident history from the client.'}`, 'Client / Project Team', 'high', ['Open critical defects prioritised', 'Incident themes summarised']),
        makeTask(2, 3, 'Security and compliance posture review', 'Identify authentication/authorisation model, data classification, and any outstanding security findings.', 'Project Team / Client Security', 'high', ['Auth model documented', 'Outstanding security items listed']),
      ],
      expected_outcomes: ['Technical risk register started', 'Dependency and security baseline', 'Clear view of critical defects and integrations'],
      client_decisions_required: ['Which defects must be resolved before new feature work?', 'What is the acceptable risk appetite for the first production change?'],
    },
    {
      id: 'phase-4',
      name: 'Scope Validation and Pilot Selection',
      objective: 'Agree a realistic near-term scope and select a low-risk pilot change that proves the delivery process.',
      tasks: [
        makeTask(3, 0, 'Scope and backlog alignment workshop', 'Validate the initial backlog against business priorities and technical constraints discovered so far.', 'Project Team / Client', 'high', ['Prioritised near-term backlog agreed', 'Out-of-scope items explicitly listed']),
        makeTask(3, 1, 'Pilot change selection', 'Choose a small, low-risk production change that exercises the full delivery path (build, test, deploy, monitor).', 'Project Team / Client', 'high', ['Pilot change described and accepted', 'Success criteria for the pilot defined']),
        makeTask(3, 2, 'Estimation and capacity check', 'Produce rough estimates and confirm team capacity for the pilot and first delivery increment.', 'Project Team', 'medium', ['Capacity and estimate shared with client']),
      ],
      expected_outcomes: ['Agreed near-term scope', 'Selected pilot change with clear success criteria'],
      client_decisions_required: ['Which pilot change is approved?', 'What is the maximum acceptable impact window for the pilot?'],
    },
    {
      id: 'phase-5',
      name: 'Pilot Change Delivery',
      objective: 'Execute the selected pilot change end-to-end, including testing, deployment, and observation, to validate the operating model.',
      tasks: [
        makeTask(4, 0, 'Pilot implementation and review', 'Implement the pilot change following the agreed process, with code review and automated checks where available.', 'Project Team', 'high', ['Change implemented and reviewed', 'Automated checks passing where applicable']),
        makeTask(4, 1, 'Test and deploy pilot', 'Execute agreed test cases and deploy through the normal pipeline (or documented temporary path if pipeline gaps exist).', 'Project Team', 'high', ['Test evidence recorded', 'Deployment completed and observed']),
        makeTask(4, 2, 'Post-pilot retrospective', 'Capture what worked, what was missing, and process improvements before scaling further work.', 'Project Team / Client', 'medium', ['Retrospective notes shared', 'Process adjustments agreed']),
      ],
      expected_outcomes: ['Pilot change live or safely rolled back', 'Validated delivery process', 'List of process improvements'],
      client_decisions_required: ['Is the pilot considered successful?', 'What process changes are approved for subsequent work?'],
    },
    {
      id: 'phase-6',
      name: 'Governance and Steady-State Handover',
      objective: 'Establish ongoing governance, support ownership, communication cadence, and continuous improvement practices.',
      tasks: [
        makeTask(5, 0, 'Support and escalation model', 'Agree who owns production support, escalation paths, and SLAs going forward.', 'Client / Project Team', 'high', ['Support ownership documented', 'Escalation contacts confirmed']),
        makeTask(5, 1, 'Governance cadence', 'Define regular steering, prioritisation, and technical review meetings.', 'Project Team / Client', 'medium', ['Meeting cadence and attendees agreed']),
        makeTask(5, 2, 'Knowledge transfer and documentation plan', 'Plan ongoing knowledge transfer and minimum documentation standards for future changes.', 'Project Team', 'medium', ['KT plan accepted', 'Documentation standards listed']),
      ],
      expected_outcomes: ['Clear support and governance model', 'Agreed communication and prioritisation rhythm'],
      client_decisions_required: ['Who is the long-term product owner / prioritisation authority?', 'What support model is funded?'],
    },
  ];

  return phases;
}

function buildSdlc(form: FormState): SdlcView {
  const projectName = form.projectName.trim() || 'the legacy system';
  const stack = form.technologyStack.trim() || 'the existing stack';

  const stages: SdlcStage[] = [
    {
      id: 'requirements',
      name: 'Requirements',
      purpose: 'Capture and validate business and technical requirements for ongoing work on the legacy system, focusing on what is already known versus what must be confirmed.',
      activities: [
        { id: 'req-1', title: 'Requirements discovery workshops', description: 'Run focused sessions with stakeholders to surface functional, non-functional, and compliance needs.', owner: 'Business Analyst / Project Team', deliverables: ['Workshop notes', 'Initial requirements backlog'], status: 'not_started' },
        { id: 'req-2', title: 'Legacy constraint capture', description: 'Document known limitations of the current system that constrain future changes.', owner: 'Project Team', deliverables: ['Constraint list'], status: 'not_started' },
      ],
      entry_criteria: ['Stakeholders identified', 'Access to existing documentation or subject-matter experts'],
      exit_criteria: ['Prioritised requirements list accepted by client sponsor', 'Open questions logged'],
      artefacts: ['Requirements backlog', 'Assumption log'],
      client_inputs_required: ['Business priorities', 'Regulatory or contractual constraints'],
      legacy_focus: ['Undocumented business rules', 'Hidden integrations', 'Data quality issues'],
    },
    {
      id: 'design',
      name: 'Design',
      purpose: 'Produce technical designs that respect the existing architecture while enabling safe incremental change.',
      activities: [
        { id: 'des-1', title: 'Architecture impact assessment', description: `Assess how proposed changes interact with ${stack} and existing components.`, owner: 'Tech Lead', deliverables: ['Impact assessment'], status: 'not_started' },
        { id: 'des-2', title: 'Interface and data design', description: 'Define or update API contracts, data models, and migration approaches where needed.', owner: 'Project Team', deliverables: ['Interface specs', 'Data notes'], status: 'not_started' },
      ],
      entry_criteria: ['Prioritised requirements available', 'Architecture baseline known'],
      exit_criteria: ['Design reviewed and accepted for the next increment', 'Risks updated'],
      artefacts: ['Design notes', 'Updated architecture diagram (if available)'],
      client_inputs_required: ['Approval of non-functional targets (performance, availability)'],
      legacy_focus: ['Avoid big-bang rewrites', 'Preserve existing contracts where possible', 'Plan for dual-run or feature flags'],
    },
    {
      id: 'implementation',
      name: 'Implementation',
      purpose: 'Implement changes in small, reviewable increments with appropriate automated checks.',
      activities: [
        { id: 'imp-1', title: 'Incremental development', description: 'Develop changes in small pull requests with code review.', owner: 'Project Team', deliverables: ['Merged pull requests'], status: 'not_started' },
        { id: 'imp-2', title: 'Unit and integration tests', description: 'Add or extend automated tests for the changed areas.', owner: 'Project Team', deliverables: ['Test code', 'Coverage notes'], status: 'not_started' },
      ],
      entry_criteria: ['Design accepted for the increment', 'Development environment available'],
      exit_criteria: ['Code merged to the integration branch', 'Automated checks green'],
      artefacts: ['Source changes', 'Test suite updates'],
      client_inputs_required: ['Clarifications on edge cases as they arise'],
      legacy_focus: ['High regression risk around poorly covered areas', 'Careful handling of shared libraries and configuration'],
    },
    {
      id: 'testing',
      name: 'Testing',
      purpose: 'Verify the change against requirements and protect existing behaviour of the legacy system.',
      activities: [
        { id: 'tst-1', title: 'Regression and acceptance testing', description: 'Execute agreed regression and acceptance suites, including manual checks where automation is weak.', owner: 'QA / Project Team', deliverables: ['Test evidence'], status: 'not_started' },
        { id: 'tst-2', title: 'Non-functional checks', description: 'Perform smoke performance, security, and operability checks appropriate to the change.', owner: 'Project Team', deliverables: ['NFR notes'], status: 'not_started' },
      ],
      entry_criteria: ['Build available in a test environment', 'Test cases agreed'],
      exit_criteria: ['Critical defects resolved or accepted', 'Client sign-off for the increment (where required)'],
      artefacts: ['Test report', 'Defect list'],
      client_inputs_required: ['Acceptance criteria confirmation', 'UAT participants if needed'],
      legacy_focus: ['Areas with little or no automated coverage', 'Data-sensitive scenarios', 'Production-like data for realistic testing'],
    },
    {
      id: 'deployment',
      name: 'Deployment',
      purpose: 'Release the change safely to production with clear rollback options and monitoring.',
      activities: [
        { id: 'dep-1', title: 'Release planning and change window', description: 'Agree deployment window, communication plan, and rollback triggers.', owner: 'Project Team / Client', deliverables: ['Release plan'], status: 'not_started' },
        { id: 'dep-2', title: 'Deploy and observe', description: 'Execute the deployment and actively monitor key metrics and logs.', owner: 'Project Team / Ops', deliverables: ['Deployment record', 'Observation notes'], status: 'not_started' },
      ],
      entry_criteria: ['Testing complete', 'Change approved', 'Rollback procedure known'],
      exit_criteria: ['Change live or safely rolled back', 'Post-deployment checks completed'],
      artefacts: ['Deployment log', 'Rollback notes if used'],
      client_inputs_required: ['Approved change window', 'Communication recipients'],
      legacy_focus: ['Limited or manual deployment pipelines', 'Shared production databases', 'Need for feature flags or dual-run'],
    },
    {
      id: 'maintenance',
      name: 'Maintenance',
      purpose: 'Operate, support, and continuously improve the system after the change is live.',
      activities: [
        { id: 'mnt-1', title: 'Hypercare and incident response', description: 'Provide elevated support for a defined period after release and respond to incidents.', owner: 'Project Team / Support', deliverables: ['Hypercare log'], status: 'not_started' },
        { id: 'mnt-2', title: 'Continuous improvement backlog', description: 'Feed observations back into the backlog (tech debt, monitoring gaps, process improvements).', owner: 'Project Team', deliverables: ['Improvement items'], status: 'not_started' },
      ],
      entry_criteria: ['Change live in production'],
      exit_criteria: ['Hypercare period complete or handed over', 'Support ownership confirmed'],
      artefacts: ['Support notes', 'Updated runbooks if needed'],
      client_inputs_required: ['Support contact and escalation path', 'Priority of improvement items'],
      legacy_focus: ['Knowledge concentration on a few individuals', 'Sparse runbooks', 'Monitoring gaps'],
    },
  ];

  return {
    model: 'waterfall_adapted_legacy',
    stages,
    notes: `SDLC stages adapted for takeover and incremental improvement of ${projectName}. Emphasis is on discovery, risk reduction, and safe pilot changes rather than green-field delivery.`,
  };
}

function buildRisks(form: FormState): Risk[] {
  const issues = form.knownIssues.trim();
  const risks: Risk[] = [
    {
      id: 'risk-1',
      description: 'Incomplete or outdated documentation of business rules and system behaviour.',
      impact: 'high',
      likelihood: 'high',
      mitigation: 'Discovery workshops, code and log review, and explicit assumption logging.',
      owner: 'Project Team / Client',
    },
    {
      id: 'risk-2',
      description: 'Limited or delayed access to repositories, environments, or production logs.',
      impact: 'high',
      likelihood: 'medium',
      mitigation: 'Early access checklist and escalation path to the platform owner.',
      owner: 'Client',
    },
    {
      id: 'risk-3',
      description: 'Hidden technical debt or fragile integrations that surface during the first changes.',
      impact: 'high',
      likelihood: 'medium',
      mitigation: 'Codebase review, dependency scan, and a carefully chosen low-risk pilot.',
      owner: 'Project Team',
    },
    {
      id: 'risk-4',
      description: 'Unclear support ownership and escalation after the pilot.',
      impact: 'medium',
      likelihood: 'medium',
      mitigation: 'Agree support model and contacts before the pilot goes live.',
      owner: 'Client / Project Team',
    },
  ];

  if (issues) {
    risks.push({
      id: 'risk-5',
      description: `Client-reported known issues may affect early delivery: ${issues.slice(0, 200)}${issues.length > 200 ? '…' : ''}`,
      impact: 'high',
      likelihood: 'high',
      mitigation: 'Prioritise assessment of these issues in the technical assessment phase.',
      owner: 'Project Team',
    });
  }

  return risks;
}

export function generateOnboardingPlan(form: FormState): OnboardingPlan {
  const projectName = form.projectName.trim() || 'Unnamed project';
  const technology_stack = splitList(form.technologyStack);
  const team = splitList(form.team);
  const client_stakeholders = splitList(form.clientContacts);

  return {
    schema_version: '1.0',
    project: {
      name: projectName,
      type: 'existing_legacy_project',
      business_domain: form.businessDomain.trim() || 'To be confirmed',
      technology_stack: technology_stack.length ? technology_stack : ['To be confirmed'],
      current_status: form.currentStatus.trim() || 'To be confirmed',
      team: team.length ? team : ['To be confirmed'],
      client_stakeholders: client_stakeholders.length ? client_stakeholders : ['To be confirmed'],
      known_issues: form.knownIssues.trim() || 'None supplied — to be explored during discovery',
    },
    context_used: {
      source: 'user_provided_input',
      previous_context: form.previousContext.trim() || '',
      project_management_prompt: form.projectManagementPrompt.trim(),
    },
    client_onboarding: {
      phases: buildPhases(form),
    },
    sdlc: buildSdlc(form),
    risks: buildRisks(form),
    dependencies: [
      'Timely access to source repositories, environments, and documentation',
      'Availability of client subject-matter experts for discovery workshops',
      'Clarity on production change windows and approval processes',
    ],
    assumptions: [
      'The system is an existing legacy application rather than a green-field build',
      'Client will provide access and decision-makers within agreed timeframes',
      'No fixed deadlines or budgets have been committed in this plan',
    ],
    open_questions: [
      'What is the exact repository and environment access path for the delivery team?',
      'Who is the primary product / business owner for prioritisation?',
      'Are there hard regulatory or contractual deadlines that constrain the pilot?',
      'What is the current production incident and support model?',
    ],
    next_actions: [
      'Confirm stakeholder list and schedule discovery workshop',
      'Request repository, environment, and monitoring access',
      'Share this plan with the client for review and correction of assumptions',
    ],
    metadata: {
      generation_method: 'frontend_template',
      generated_at: new Date().toISOString(),
      notes: 'Generated from form inputs using a deterministic frontend template. Pasted previous context is stored for reference only and is not automatically analysed.',
    },
  };
}

export function isValidPlan(value: unknown): value is OnboardingPlan {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.schema_version === 'string' &&
    p.project != null &&
    typeof p.project === 'object' &&
    p.client_onboarding != null &&
    typeof p.client_onboarding === 'object' &&
    Array.isArray(p.risks) &&
    p.sdlc != null &&
    typeof p.sdlc === 'object'
  );
}
