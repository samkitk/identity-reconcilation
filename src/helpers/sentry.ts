// import * as Sentry from "@sentry/node";

// Sentry.init({
//   dsn: "https://81c5afaa7d954866948e18c11e4c989c@o418795.ingest.sentry.io/4505317087117312",
//   integrations: [
//     // enable HTTP calls tracing
//     new Sentry.Integrations.Http({ tracing: true }),
//     // enable Express.js middleware tracing
//     new Sentry.Integrations.Express({ app }),
//     // Automatically instrument Node.js libraries and frameworks
//     ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
//   ],

//   // Set tracesSampleRate to 1.0 to capture 100%
//   // of transactions for performance monitoring.
//   // We recommend adjusting this value in production
//   tracesSampleRate: 1.0,
// });

// // RequestHandler creates a separate execution context, so that all
// // transactions/spans/breadcrumbs are isolated across requests
// app.use(
//   Sentry.Handlers.requestHandler({
//     ip: true,
//     request: ["headers", "data", "method", "query_string", "url"],
//     serverName: true,
//     transaction: true,
//   }) as express.RequestHandler
// );

// // TracingHandler creates a trace for every incoming request
// app.use(Sentry.Handlers.tracingHandler());

// // All controllers should live here
// // The error handler must be before any other error middleware and after all controllers
// app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler);

// // Optional fallthrough error handler
// app.use(function onError(err:any, req:any, res:any, next:any) {
//   // The error id is attached to `res.sentry` to be returned
//   // and optionally displayed to the user for support.
//   res.statusCode = 500;
//   res.json({"id":res.sentry,"description": String(err)});
// });
