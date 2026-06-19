import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: "https://github.com/vibedcoder/invespro",
    nav: {
      title: "Invespro",
    },
    searchToggle: {
      enabled: true,
    },
    themeSwitch: {
      enabled: true,
    },
  };
}
