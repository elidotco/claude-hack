import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { DollarSign, FileText, Search, Sparkles, Trophy } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <h2 className="text-3xl font-semibold italic">SCHOLARA</h2>
            {
              <Suspense>
                <AuthButton />
              </Suspense>
            }
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <main className="flex-1 flex flex-col gap-12 px-4 py-12 max-w-5xl mx-auto">
            {/* Hero Section */}
            <section className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
                <Sparkles size={14} />
                <span>
                  AI-Powered Matching for University of Ghana Students
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-serif font-bold text-white tracking-tight">
                Your Education, <br />
                <span className="text-[#eec67a] italic">Fully Funded.</span>
              </h1>

              <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                Scholara uses Gemini AI to scan thousands of global and local
                scholarships, matching them to your GPA, major, and career goals
                in seconds.
              </p>

              {/* Primary Search/CTA Area */}
              <div className="max-w-xl mx-auto pt-4">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-[#eec67a] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative flex items-center bg-[#11141b] border border-slate-800 rounded-2xl p-2">
                    <Search className="ml-4 text-slate-500" size={20} />
                    <input
                      type="text"
                      placeholder="Search for 'Physics scholarships' or 'UG financial aid'..."
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 py-3 text-slate-200"
                    />
                    <button className="bg-[#eec67a] text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#d4b06a] transition">
                      Match Me
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Stats / Trust Bar */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 border-y border-slate-800/50 py-8 opacity-60">
              <div className="text-center">
                <div className="text-xl font-bold text-white">5k+</div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500">
                  Scholarships
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">$12M+</div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500">
                  Available Funds
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">98%</div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500">
                  Match Accuracy
                </div>
              </div>
            </div>

            {/* Feature Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <LandingCard
                icon={<Trophy className="text-indigo-400" />}
                title="Smart Matching"
                description="We map your University of Ghana transcript directly to international eligibility criteria."
              />
              <LandingCard
                icon={<FileText className="text-[#eec67a]" />}
                title="Essay Drafting"
                description="Generate high-converting personal statements tailored to specific scholarship requirements."
              />
              <LandingCard
                icon={<DollarSign className="text-emerald-400" />}
                title="Value Tracking"
                description="Save matches to your dashboard and track the total estimated value of your applications."
              />
            </section>
          </main>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}

// Small helper component for the grid
function LandingCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#161a22] border border-slate-800/50 p-6 rounded-2xl hover:border-slate-700 transition group">
      <div className="mb-4 bg-slate-900 w-10 h-10 flex items-center justify-center rounded-xl border border-slate-800 group-hover:border-slate-600">
        {icon}
      </div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
