import { CopilotManager } from "@/components/ai/CopilotManager";
import { PageHeader } from "@/components/ui/PageHeader";
export default function AiCopilotPage(){return <section className="space-y-7"><PageHeader eyebrow="Private assistant" title="AI Copilot" description="Mock intelligence uses your private metadata only. No external AI service is connected."/><CopilotManager/></section>}
