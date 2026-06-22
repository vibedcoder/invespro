import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: "https://github.com/zagvar/helm",
    nav: {
      title: "Helm",
    },
    searchToggle: {
      enabled: true,
    },
    themeSwitch: {
      enabled: true,
    },
  };
}
