import { useCallback, useState } from 'react';
import { ProjectForm } from './components/ProjectForm';
import { PlanView } from './components/PlanView';
import { JsonView } from './components/JsonView';
import { SdlcView } from './components/SdlcView';
import { EMPTY_FORM, type FormState, type OnboardingPlan } from './types/plan';
import { generateOnboardingPlan } from './utils/generatePlan';
import './App.css';

type Tab = 'ui' | 'sdlc' | 'json';

function App() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [plan, setPlan] = useState<OnboardingPlan | null>(null);
  const [tab, setTab] = useState<Tab>('ui');
  const [isGenerating, setIsGenerating] = useState(false);

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
            Frontend-only template planner · No remote AI · Data lives in memory until refresh
          </p>
        </div>
      </header>

      <main className="app-main">
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
            {tab === 'json' && (
              <JsonView plan={plan} onValidPlan={handleValidPlan} onApplyForm={handleApplyForm} />
            )}
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>
          Project Manager AI generates structured onboarding plans from form inputs using frontend templates only.
          Paste any prior context yourself — nothing is retrieved automatically. No API keys, backend, or persistent
          storage are used.
        </p>
      </footer>
    </div>
  );
}

export default App;
