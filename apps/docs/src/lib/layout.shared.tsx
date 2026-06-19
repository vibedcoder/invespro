import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: "https://github.com/vibedcoder/invespro",
    nav: {
      title: "Invespro",
    },
    links: [
      {
        text: "Docs",
        url: "/docs",
        active: "nested-url",
      },
      {
        text: "Demo",
        url: "/demo",
      },
      {
        text: "npm",
        url: "https://www.npmjs.com/package/@vibedcoder/invespro-core",
        external: true,
      },
    ],
    searchToggle: {
      enabled: false,
    },
    themeSwitch: {
      enabled: false,
    },
  };
}
