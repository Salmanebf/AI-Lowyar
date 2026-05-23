import * as fs from 'node:fs';
import * as path from 'node:path';

type Meta = {
  current: string;
  frozen: string[];
};

const SRC_DIR = path.join(__dirname, 'src');

export function loadPrompt(
  name: string,
  lang: string,
  variables: Record<string, string>,
  version?: string,
): string {
  const promptDir = path.join(SRC_DIR, name);
  const metaPath = path.join(promptDir, 'meta.json');
  const meta: Meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

  const resolvedVersion = version ?? meta.current;
  const filePath = path.join(promptDir, `${resolvedVersion}.${lang}.md`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Prompt file not found: ${filePath}`);
  }

  let template = fs.readFileSync(filePath, 'utf-8');

  const missing: string[] = [];
  template = template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    if (key in variables) {
      return variables[key];
    }
    missing.push(key);
    return match;
  });

  if (missing.length > 0) {
    throw new Error(`Missing prompt variables: ${missing.join(', ')}`);
  }

  return template;
}
