type RouteEntry = {
  path: string;
  methods: string;
  description: string;
  example?: string;
};

type RouteGroup = {
  title: string;
  accent: string;
  routes: RouteEntry[];
};

const ROUTE_GROUPS: RouteGroup[] = [
  {
    title: "API Routes",
    accent: "border-blue-500",
    routes: [
      {
        path: "/api/log-bulk",
        methods: "GET",
        description:
          "Writes `count` stdout log lines (Node runtime), each padded to `sizeKb`.",
        example: "/api/log-bulk?count=5&sizeKb=1&startIndex=1",
      },
      {
        path: "/api/log-bulk-requests",
        methods: "GET",
        description:
          "Fires `count` sequential HTTP calls to /api/log-bulk so each log is its own request.",
        example: "/api/log-bulk-requests?count=5&sizeKb=1",
      },
      {
        path: "/api/log-chunk",
        methods: "GET",
        description:
          "Emits chunked console.log lines capped at `lineKb`, tunes JSON response to `responseKb`.",
        example: "/api/log-chunk?lineKb=1&responseKb=10",
      },
      {
        path: "/api/log-size",
        methods: "GET",
        description: "Prints one console.log line of roughly `size` KB.",
        example: "/api/log-size?size=1024",
      },
      {
        path: "/api/reproduce-large-log",
        methods: "GET, POST",
        description:
          "Forwards a synthetic OTLP log record directly to the telemetry endpoint (bypasses stdout).",
        example: "/api/reproduce-large-log?size=1100000",
      },
      {
        path: "/api/reproduce-telemetry-kafka",
        methods: "GET, POST",
        description:
          "Writes one raw stdout line of `size` repeated characters (no OTLP wrapper).",
        example: "/api/reproduce-telemetry-kafka?size=1100000",
      },
    ],
  },
  {
    title: "Page Routes",
    accent: "border-purple-500",
    routes: [
      { path: "/", methods: "PAGE", description: "Home / landing page (this page)." },
      {
        path: "/rewrite",
        methods: "PAGE",
        description: "Rewrite source page demo.",
      },
      {
        path: "/rewrite/success",
        methods: "PAGE",
        description: "Rewrite destination page demo.",
      },
      {
        path: "/new_rewrite",
        methods: "PAGE",
        description: "Another rewrite demo page.",
      },
      {
        path: "/log-bulk-requests",
        methods: "PAGE",
        description: "UI wrapper that fires per-log requests to /api/log-bulk.",
      },
    ],
  },
  {
    title: "Edge Functions",
    accent: "border-teal-500",
    routes: [
      {
        path: "/edge",
        methods: "EDGE",
        description: "Returns the current server timestamp.",
      },
      {
        path: "/edge/geo",
        methods: "EDGE",
        description:
          "Returns geo headers (country/region/city) forwarded by the platform.",
      },
    ],
  },
  {
    title: "Redirects & Rewrites (launch.json)",
    accent: "border-orange-500",
    routes: [
      {
        path: "/redirect",
        methods: "308",
        description: "Redirects to /redirect/success.",
      },
      {
        path: "/new_redirect",
        methods: "REDIRECT",
        description:
          "Redirects to external URL launchassignment-b6f4d9.contentstackapps.com.",
      },
      {
        path: "/rewrite",
        methods: "REWRITE",
        description: "Rewrites to /rewrite/success.",
      },
      {
        path: "/rewrite1",
        methods: "REWRITE",
        description: "Rewrites to /new_rewrite.",
      },
    ],
  },
];

function methodBadgeClasses(methods: string) {
  if (methods.includes("POST")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (methods === "PAGE") return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
  if (methods === "EDGE") return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200";
  if (methods === "REDIRECT" || methods === "308") return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
  if (methods === "REWRITE") return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
  return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Contentstack Launch Test
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              A minimal Next.js app for testing Contentstack Launch features
            </p>
          </header>

          {/* Routes Reference */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Routes Reference
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              A running list of every route in this project, kept here so it survives each redeploy.
            </p>

            <div className="space-y-10">
              {ROUTE_GROUPS.map((group) => (
                <div key={group.title}>
                  <h3
                    className={`text-xl font-semibold text-gray-900 dark:text-white mb-4 border-l-4 ${group.accent} pl-3`}
                  >
                    {group.title}
                  </h3>
                  <div className="space-y-3">
                    {group.routes.map((route) => (
                      <div
                        key={`${group.title}-${route.path}-${route.methods}`}
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${methodBadgeClasses(
                              route.methods
                            )}`}
                          >
                            {route.methods}
                          </span>
                          <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                            {route.path}
                          </code>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {route.description}
                        </p>
                        {route.example && (
                          <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-2">
                            e.g. <code>{route.example}</code>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
