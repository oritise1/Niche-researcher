import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Hint } from '../components/ui/Hint'
import { TextField, TextArea, SelectField } from '../components/ui/Field'
import { rulesPlan } from '../lib/rulesPlan'
import { fetchPlan } from '../lib/fetchPlan'
import { HAS_AI } from '../lib/config'
import type { Intake, Plan } from '../lib/types'

interface Props {
  intake: Intake
  hasExistingPlan: boolean
  onIntakeField: (key: keyof Intake, value: string) => void
  onBuild: (plan: Plan) => void
  onBack: () => void
}

export function IntakePage({ intake, hasExistingPlan, onIntakeField, onBuild, onBack }: Props) {
  const [hp, setHp] = useState('')
  const [building, setBuilding] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (building) return
    setBuilding(true)
    setMsg(HAS_AI ? 'Building your plan. This usually takes 10 to 20 seconds.' : 'Building your plan.')

    let plan: Plan
    if (HAS_AI) {
      try {
        plan = await fetchPlan(intake, hp)
      } catch {
        plan = rulesPlan(intake)
        plan.note = 'The AI generator was unavailable, so this plan comes from built-in rules.'
      }
    } else {
      plan = rulesPlan(intake)
      plan.note = 'This plan comes from built-in rules.'
    }

    setBuilding(false)
    setMsg('')
    onBuild(plan)
  }

  return (
    <section aria-labelledby="h-intake" className="mt-7">
      <h2 id="h-intake" className="text-[30px] sm:text-[36px] font-display font-bold leading-[1.08] max-w-[18ch]">
        Build your 30-minute research plan
      </h2>
      <p className="max-w-[62ch] mt-3.5 text-muted">
        Answer a few questions. You get a timed plan for your niche: where to look, what to search, what to log, and how to score what you find.
      </p>

      <form onSubmit={handleSubmit} className="mt-2">
        <div className="grid gap-4 mt-4">
          <TextField
            id="in-niche"
            label="What is the product idea or niche?"
            required
            maxLength={200}
            placeholder="e.g. client onboarding system for freelance web developers"
            value={intake.niche}
            onChange={e => onIntakeField('niche', e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              id="in-productType"
              label="What will you make?"
              required
              value={intake.productType}
              onChange={e => onIntakeField('productType', e.target.value)}
            >
              <option value="">Choose one</option>
              <option value="template">Template (Notion, Sheets, Airtable)</option>
              <option value="uikit">UI kit or code starter</option>
              <option value="prompts">AI prompt or workflow pack</option>
              <option value="ebook">Ebook, guide or playbook</option>
              <option value="tool">Small web tool or calculator</option>
              <option value="framer">Framer, Webflow or Figma template</option>
              <option value="other">Something else</option>
            </SelectField>

            <TextField
              id="in-buyer"
              label="Who is the buyer?"
              required
              maxLength={120}
              placeholder="e.g. freelance designers"
              list="buyers"
              value={intake.buyer}
              onChange={e => onIntakeField('buyer', e.target.value)}
            />
            <datalist id="buyers">
              <option value="freelancers" />
              <option value="small business owners" />
              <option value="developers" />
              <option value="designers" />
              <option value="students" />
              <option value="job seekers" />
              <option value="content creators" />
              <option value="agencies" />
            </datalist>
          </div>

          <TextArea
            id="in-skills"
            label="What do you know or do well?"
            maxLength={600}
            placeholder="e.g. 4 years of frontend work, strong in React, no design background, some writing experience"
            hint="This shapes what you can realistically build in your time frame."
            value={intake.skills}
            onChange={e => onIntakeField('skills', e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              id="in-timeline"
              label="How long do you have to launch?"
              value={intake.timeline}
              onChange={e => onIntakeField('timeline', e.target.value)}
            >
              <option value="72h">72 hours</option>
              <option value="1w">About a week</option>
              <option value="2w">Two weeks or more</option>
            </SelectField>

            <SelectField
              id="in-audience"
              label="How big is your audience today?"
              value={intake.audience}
              onChange={e => onIntakeField('audience', e.target.value)}
            >
              <option value="none">No audience yet</option>
              <option value="small">Under 500 followers or subscribers</option>
              <option value="medium">500 to 5,000</option>
              <option value="large">More than 5,000</option>
            </SelectField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              id="in-country"
              label="Where are you based?"
              maxLength={60}
              placeholder="Country"
              hint="Payout options depend on your country."
              value={intake.country}
              onChange={e => onIntakeField('country', e.target.value)}
            />
            <SelectField
              id="in-platform"
              label="Where do you plan to sell?"
              value={intake.platform}
              onChange={e => onIntakeField('platform', e.target.value)}
            >
              <option value="unsure">Not sure yet</option>
              <option value="etsy">Etsy</option>
              <option value="gumroad">Gumroad</option>
              <option value="own">My own site</option>
            </SelectField>
          </div>

          {/* Honeypot: hidden from humans, visible to naive bots */}
          <div className="absolute left-[-10000px] w-px h-px overflow-hidden" aria-hidden="true">
            <label>
              Leave this empty
              <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={e => setHp(e.target.value)} />
            </label>
          </div>

          <p className="text-sm text-muted max-w-[62ch]">
            {HAS_AI
              ? 'Your answers are sent to an AI service to write the plan. Do not include private or confidential details.'
              : 'Your answers stay in this browser. The plan comes from built-in rules.'}
          </p>

          {hasExistingPlan && (
            <p className="text-sm text-muted">Building a new plan replaces your current plan and notes.</p>
          )}

          <div className="flex flex-wrap gap-3 items-center">
            <Button type="submit" size="lg" disabled={building}>Build my plan</Button>
            {hasExistingPlan && (
              <Button type="button" variant="ghost" onClick={onBack}>Back to my plan</Button>
            )}
            <Hint live>{msg}</Hint>
          </div>
        </div>
      </form>
    </section>
  )
}