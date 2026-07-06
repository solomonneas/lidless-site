// jal-co/ui components (release-badge, ci-badge) import their data helpers and
// types from "@/lib/github". Unify on the fuller github-data module so one lib
// serves the jal-co components and the site (and exposes fetchReleases).
export * from './github-data';
