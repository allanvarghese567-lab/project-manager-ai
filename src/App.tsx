import { useCallback, useEffect, useState } from 'react';
import { ProjectForm } from './components/ProjectForm';
import { PlanView } from './components/PlanView';
import { JsonView } from './components/JsonView';
import { SdlcView } from './components/SdlcView';
import { CsvView } from './components/CsvView';
import { EMPTY_FORM, type FormState, type OnboardingPlan } from './types/plan';
import { generateOnboardingPlan } from './utils/generatePlan';
import {
  loadExternalPlanOnBoot,
  parseIncomingMessage,
  planToForm,
  type ExternalSource,
} from './utils/loadExternalPlan';
import './App.css';

type Tab = 'ui' | 'sdlc' | 'json' | 'csv';

function App() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [plan, setPlan] = useState<OnboardingPlan | null>(null);
  const [tab, setTab] = useState<Tab>('ui');
  const [isGenerating, setIsGenerating] = useState(false);
  const [bootSource, setBootSource] = useState<ExternalSource>('none');
  const [bootError, setBootError] = useState<string | null>(null);
  const [externalNotice, setExternalNotice] = useState<string | null>(null);

  // Boot: load from URL / hash / window.__INITIAL_PLAN__ once
  useEffect(() => {
    const result = loadExternalPlanOnBoot();
    setBootSource(result.source);
    if (result.error) {
      setBootError(result.error);
      return;
    }
    if (result.plan && result.form) {
      setPlan(result.plan);
      setForm(result.form);
      setTab('ui');
      setExternalNotice(`Plan loaded from external source (${result.source}).`);
      const t = window.setTimeout(() => setExternalNotice(null), 4000);
      return () => window.clearTimeout(t);
    }
  }, []);

  // Runtime: parent iframe / host can postMessage a plan
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const parsed = parseIncomingMessage(event.data);
      if (parsed.action === null) return;

      if (parsed.action === 'clear') {
        setForm(EMPTY_FORM);
        setPlan(null);
        setTab('ui');
        setExternalNotice('Plan cleared by external message.');
        window.setTimeout(() => setExternalNotice(null), 3000);
        return;
      }

      if (parsed.error) {
        setBootError(parsed.error);
        return;
      }

      if (parsed.plan) {
        setPlan(parsed.plan);
        setForm(planToForm(parsed.plan));
        setTab('ui');
        setBootError(null);
        setExternalNotice('Plan loaded from postMessage.');
        window.setTimeout(() => setExternalNotice(null), 3000);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    window.setTimeout(() => {
      const next = generateOnboardingPlan(form);
      setPlan(next);
      setTab('ui');
      setIsGenerating(false);
    }, 150);
  }, [form]);

  const handleReset = useCallback(() => {
    const hasData =
      plan !== null ||
      Object.entries(form).some(([k, v]) => {
        if (k === 'projectManagementPrompt') return false;
        return typeof v === 'string' && v.trim().length > 0;
      });
    if (hasData && !window.confirm('Clear all form inputs and the generated plan? This cannot be undone.')) {
      return;
    }
    setForm(EMPTY_FORM);
    setPlan(null);
    setTab('ui');
    setBootError(null);
  }, [form, plan]);

  const handleValidPlan = useCallback((next: OnboardingPlan) => {
    setPlan(next);
  }, []);

  const handleApplyForm = useCallback((nextForm: FormState) => {
    setForm(nextForm);
  }, []);

  const handlePlanChange = useCallback((next: OnboardingPlan) => {
    setPlan(next);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div>
            <h1>Project Manager AI</h1>
            <p className="subtitle">Legacy Project Client Onboarding Planner</p>
          </div>
          <p className="header-note">
            Frontend-only template planner · External JSON via URL / postMessage · Data in memory until refresh
          </p>
        </div>
      </header>

      <main className="app-main">
        {externalNotice && (
          <div className="banner banner-success" role="status">
            {externalNotice}
          </div>
        )}
        {bootError && (
          <div className="banner banner-error" role="alert">
            {bootError} Starting with a blank plan.
          </div>
        )}
        {bootSource === 'none' && !plan && !bootError && (
          <div className="banner banner-info" role="status">
            No external plan detected — ready for a new plan. You can also pass JSON via{' '}
            <code>?plan=</code>, <code>#plan=</code>, <code>window.__INITIAL_PLAN__</code>, or postMessage.
          </div>
        )}

        <ProjectForm
          form={form}
          onChange={setForm}
          onGenerate={handleGenerate}
          onReset={handleReset}
          isGenerating={isGenerating}
          hasResult={plan !== null}
        />

        <section className="results-panel" aria-label="Plan results">
          <div className="tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'ui'}
              className={`tab ${tab === 'ui' ? 'active' : ''}`}
              onClick={() => setTab('ui')}
            >
              Onboarding View
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'sdlc'}
              className={`tab ${tab === 'sdlc' ? 'active' : ''}`}
              onClick={() => setTab('sdlc')}
            >
              SDLC View
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'csv'}
              className={`tab ${tab === 'csv' ? 'active' : ''}`}
              onClick={() => setTab('csv')}
            >
              CSV View
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'json'}
              className={`tab ${tab === 'json' ? 'active' : ''}`}
              onClick={() => setTab('json')}
            >
              JSON View
            </button>
          </div>

          <div className="tab-panel" role="tabpanel">
            {tab === 'ui' && <PlanView plan={plan} onPlanChange={handlePlanChange} />}
            {tab === 'sdlc' && <SdlcView plan={plan} onPlanChange={handlePlanChange} />}
            {tab === 'csv' && <CsvView plan={plan} />}
            {tab === 'json' && (
              <JsonView plan={plan} onValidPlan={handleValidPlan} onApplyForm={handleApplyForm} />
            )}
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>
          External plan sources: <code>?plan=</code> / <code>?data=</code> (URL-encoded or base64 JSON),{' '}
          <code>#plan=</code>, <code>window.__INITIAL_PLAN__</code>, or{' '}
          <code>postMessage({'{'} type: 'project-manager-ai:load-plan', plan {'}'})</code>. Invalid or missing data
          starts a new blank plan.
        </p>
      </footer>
    </div>
  );
}

export default App;
