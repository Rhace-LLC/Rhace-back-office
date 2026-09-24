import { serviceAggregators } from "./serviceAggregatorRegistry";

import {
  apiServiceModules,
  serviceAggregatorDefinitions,
} from "./aggregators";

const EXCLUDED_FROM_COVERAGE = new Set(["utils/types.service.ts"]);

const requestMakingServices = apiServiceModules.filter(
  (module) => !EXCLUDED_FROM_COVERAGE.has(module.serviceFile)
);

if (import.meta.env.DEV) {
  const registeredFiles = new Set(
    serviceAggregatorDefinitions.map((definition) => definition.serviceFile)
  );
  // order.service.ts and orderService.ts share the orders aggregator,
  // so treat orderService.ts as covered when order.service.ts is registered.
  if (registeredFiles.has("order.service.ts")) {
    registeredFiles.add("orderService.ts");
  }
  const missingServices = requestMakingServices
    .map((module) => module.serviceFile)
    .filter((file) => !registeredFiles.has(file));

  if (missingServices.length > 0) {
    console.error(
      `Debug aggregators are missing service modules: ${missingServices.join(", ")}`
    );
  }
}

export function APIResponseAggregator() {
  return (
    <section className="space-y-4" aria-label="API service aggregators">
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4">
        <h2 className="text-base font-semibold text-gray-800">
          Service API aggregators
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Reads run with one click and never change data. Cards with write
          coverage can also fire mutating test requests once you opt in —
          those create clearly-tagged <span className="font-mono">[API-TEST]</span> records
          and clean them up.
        </p>
        <p className="mt-2 text-xs text-gray-400">
          {serviceAggregators.length} service aggregators configured
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {serviceAggregators.map(({ id, component: Aggregator }) => (
          <Aggregator key={id} />
        ))}
      </div>
    </section>
  );
}

export default APIResponseAggregator;
