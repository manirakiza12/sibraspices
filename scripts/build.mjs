import fs from 'node:fs/promises';
import path from 'node:path';
import { compile } from '@tailwindcss/node';
export async function build() {
  const root = process.cwd();
  const [source, html, js] = await Promise.all([
    fs.readFile(path.join(root, 'src/tailwind.css'), 'utf8'),
    fs.readFile(path.join(root, 'index.html'), 'utf8'),
    fs.readFile(path.join(root, 'main.js'), 'utf8')
  ]);
  const compiler = await compile(source, { base: root, onDependency() {} });
  const candidates = new Set(['sr-only']);
  for (const match of html.matchAll(/class="([^"]+)"/g)) for (const token of match[1].split(/\s+/)) candidates.add(token);
  // Classes used for carousel/filter states also exist in the static markup.
  const css = compiler.build([...candidates]);
  const output = path.resolve(root, 'dist');
  if (path.dirname(output) !== root || path.basename(output) !== 'dist') throw new Error('Unexpected build output path');
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });
  await Promise.all([
    fs.writeFile('style.css', css),
    fs.writeFile('dist/index.html', html),
    fs.writeFile('dist/style.css', css),
    fs.writeFile('dist/main.js', js),
    fs.cp('assets', 'dist/assets', { recursive: true })
  ]);
  console.log('SIBRA SPICES built: browser-ready HTML, Tailwind CSS, JavaScript, and local assets.');
}
await build();
