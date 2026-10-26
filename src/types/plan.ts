export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'done';
export type ImpactLikelihood = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description: string;
  owner: string;
  priority: Priority;
  status: TaskStatus;
  acceptance_criteria: string[];
}

export interface Phase {
  id: string;
  name: string;
  objective: string;
  tasks: Task[];
  expected_outcomes: string[];
  client_decisions_required: string[];
}

export interface Risk {
  id: string;
  description: string;
  impact: ImpactLikelihood;
  likelihood: ImpactLikelihood;
  mitigation: string;
  owner: string;
}

export interface ProjectInfo {
  name: string;
  type: 'existing_legacy_project';
  business_domain: string;
  technology_stack: string[];
  current_status: string;
  team: string[];
  client_stakeholders: string[];
  known_issues: string;
}

export interface ContextUsed {
  source: 'user_provided_input';
  previous_context: string;
  project_management_prompt: string;
}

export interface Metadata {
  generation_method: 'frontend_template';
  generated_at: string;
  notes: string;
}

export interface OnboardingPlan {
  schema_version: string;
  project: ProjectInfo;
  context_used: ContextUsed;
  client_onboarding: {
    phases: Phase[];
  };
  sdlc: SdlcView;
  risks: Risk[];
  dependencies: string[];
  assumptions: string[];
  open_questions: string[];
  next_actions: string[];
  metadata: Metadata;
}

export interface FormState {
  projectName: string;
  businessDomain: string;
  technologyStack: string;
  team: string;
  clientContacts: string;
  currentStatus: string;
  knownIssues: string;
  previousContext: string;
  projectManagementPrompt: string;
}

export const DEFAULT_PROMPT = `Prepare a professional client onboarding and takeover plan for this existing legacy software project. Focus on discovery, technical assessment, risk identification, scope validation, a low-risk pilot change, and governance. Clearly separate confirmed inputs, assumptions, and open questions. Do not invent deadlines, budgets, or client commitments. Highlight legacy concerns such as repository access, environment configuration, undocumented business rules, integrations, security, support ownership, and production incident history. Provide concrete questions the client must answer before delivery work begins.`;

export const EMPTY_FORM: FormState = {
  projectName: '',
  businessDomain: '',
  technologyStack: '',
  team: '',
  clientContacts: '',
  currentStatus: '',
  knownIssues: '',
  previousContext: '',
  projectManagementPrompt: DEFAULT_PROMPT,
};

/** Classic SDLC stages adapted for legacy project takeover */
export type SdlcStageId =
  | 'requirements'
  | 'design'
  | 'implementation'
  | 'testing'
  | 'deployment'
  | 'maintenance';

export interface SdlcActivity {
  id: string;
  title: string;
  description: string;
  owner: string;
  deliverables: string[];
  status: TaskStatus;
}

export interface SdlcStage {
  id: SdlcStageId;
  name: string;
  purpose: string;
  activities: SdlcActivity[];
  entry_criteria: string[];
  exit_criteria: string[];
  artefacts: string[];
  client_inputs_required: string[];
  legacy_focus: string[];
}

export interface SdlcView {
  model: 'waterfall_adapted_legacy';
  stages: SdlcStage[];
  notes: string;
}
