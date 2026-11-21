import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { Bug } from "lucide-react";
import { APIResponseAggregator } from "./APIResponseAggregator";

export default function DebugPage() {
  return (
    <PageContainer>
      <PageHeader
        leading={
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cardfill text-brand">
            <Bug className="h-5 w-5" />
          </span>
        }
        title="Debug"
        description="Local-only tools. Not available in production."
      />

      <APIResponseAggregator />
    </PageContainer>
  );
}
