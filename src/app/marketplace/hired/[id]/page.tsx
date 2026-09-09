import type { Metadata } from 'next';
import { HiredAgentDetailClient } from '@/components/(hired-agent-workspace)/hired-agent-detail.client';

export const metadata: Metadata = {
  title: 'Hired Agent Workspace | Argus',
  description:
    'Live telemetry, execution activity stream, and risk management workspace for hired autonomous agents on BNB Chain.',
};

export default async function HiredAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="flex-1 min-h-0 w-full flex flex-col overflow-hidden bg-theme-bg-base">
      <HiredAgentDetailClient id={id} />
    </main>
  );
}
