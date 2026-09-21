import type { ComponentType } from 'react';
import type {
  IndexRouteObject,
  LazyRouteFunction,
  NonIndexRouteObject,
} from 'react-router-dom';

type LazyRoute = LazyRouteFunction<IndexRouteObject> &
  LazyRouteFunction<NonIndexRouteObject>;

type RouteModule = Record<string, unknown>;
type RouteImporter = () => Promise<RouteModule>;

const routeDebugDelayMsRaw = Number(import.meta.env.VITE_ROUTE_DEBUG_DELAY_MS ?? 0);
const routeDebugDelayMs = Number.isFinite(routeDebugDelayMsRaw)
  ? Math.max(0, Math.trunc(routeDebugDelayMsRaw))
  : 0;
const routeModules = import.meta.glob<RouteModule>([
  '../layout/**/*.{ts,tsx}',
  '../page/**/*.{ts,tsx}',
]);

async function delayRouteLoading() {
  if (!import.meta.env.DEV || routeDebugDelayMs <= 0) {
    return;
  }

  await new Promise<void>((resolve) => {
    setTimeout(resolve, routeDebugDelayMs);
  });
}

function resolvePageImporter(modulePath: string): RouteImporter {
  const normalizedPath = modulePath.replace(/\\/g, '/');
  const candidates = [
    normalizedPath,
    `${normalizedPath}.tsx`,
    `${normalizedPath}.ts`,
    `${normalizedPath}/index.tsx`,
    `${normalizedPath}/index.ts`,
  ];

  for (const candidate of candidates) {
    const importer = routeModules[candidate];
    if (importer) {
      return importer;
    }
  }

  throw new Error(`Route module not found: ${modulePath}`);
}

function resolveRouteComponent(
  module: RouteModule,
  modulePath: string,
  exportName: string,
): ComponentType<unknown> {
  const component = module[exportName];

  if (!component) {
    throw new Error(`Route export "${exportName}" not found in module: ${modulePath}`);
  }

  return component as ComponentType<unknown>;
}

export function lazying(modulePath: string, exportName: string): LazyRoute {
  return (async () => {
    await delayRouteLoading();

    const importer = resolvePageImporter(modulePath);
    const module = await importer();
    const component = resolveRouteComponent(module, modulePath, exportName);

    return { Component: component };
  }) as LazyRoute;
}
