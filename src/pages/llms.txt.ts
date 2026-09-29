import { TOOLS, CATEGORY_ORDER } from '../lib/tools.ts';

// Build-time generated llms.txt (llmstxt.org format) so it never goes stale:
// tool list and one-liners come straight from the catalog in src/lib/tools.ts.
export function GET() {
  const lines: string[] = [
    '# Lidless',
    '',
    '> Lidless is an open-source lab of MCP servers and CLIs for security, network ops, and homelab systems. Everything is MIT licensed and local-first, and agent writes are gated behind explicit confirmation.',
    '',
    '## Tools',
    '',
  ];

  for (const cat of CATEGORY_ORDER) {
    const inCat = TOOLS.filter((t) => t.category === cat);
    if (inCat.length === 0) continue;
    lines.push(`### ${cat}`, '');
    for (const t of inCat) {
      lines.push(`- [${t.name}](https://lidless.dev/${t.slug}): ${t.oneLiner}`);
    }
    lines.push('');
  }

  lines.push(
    '## Links',
    '',
    '- [GitHub org](https://github.com/lidless-labs)',
    '- [The Log](https://lidless.dev/blog)',
    '',
  );

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
