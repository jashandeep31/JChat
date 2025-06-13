import { Button } from "@repo/ui/components/button"
import { Rocket, Sparkles, Headset } from "lucide-react"
import { FeatureCard } from "./feature-card"

export const UpgradeSection = () => (
  <div>
    <div className="flex justify-between items-baseline mb-4">
      <h2 className="text-2xl font-bold text-slate-800">Upgrade to Pro</h2>
      <p className="text-3xl font-bold text-slate-800">
        $8<span className="text-base font-medium text-slate-500">/month</span>
      </p>
    </div>
    <div className="grid md:grid-cols-3 gap-4 mb-6">
      <FeatureCard icon={Rocket} title="Access to All Models">
        Get access to our full suite of models including Claude, o3-mini-high, and more!
      </FeatureCard>
      <FeatureCard icon={Sparkles} title="Generous Limits">
        Receive <span className="font-semibold text-brand-pink">1500 standard credits</span> per month, plus{" "}
        <span className="font-semibold text-brand-pink">100 premium credits*</span> per month.
      </FeatureCard>
      <FeatureCard icon={Headset} title="Priority Support">
        Get faster responses and dedicated assistance from the T3 team whenever you need help!
      </FeatureCard>
    </div>
    <Button size="lg" className="w-full bg-brand-pink hover:bg-brand-pink/90 text-white">
      Upgrade Now
    </Button>
    <p className="text-xs text-slate-500 mt-4 text-center md:text-left">
      *Premium credits are used for GPT Image Gen, Claude Sonnet, and Grok 3. Additional Premium credits can be
      purchased separately.
    </p>
  </div>
)
