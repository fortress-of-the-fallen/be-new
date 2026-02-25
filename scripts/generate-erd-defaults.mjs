import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const schemaPath = path.resolve('prisma/schema.prisma');
const outMmd = path.resolve('prisma/ERD-defaults.mmd');
const outSvg = path.resolve('prisma/ERD-defaults.svg');
const tmpConfig = path.resolve('prisma/.mermaid-defaults-config.json');

const raw = fs.readFileSync(schemaPath, 'utf8');
const lines = raw.split(/\r?\n/);

const models = [];
let current = null;
const scalarTypes = new Set([
  'String',
  'Boolean',
  'Int',
  'BigInt',
  'Float',
  'Decimal',
  'DateTime',
  'Json',
  'Bytes',
]);

function mapType(t) {
  if (t.endsWith('[]')) return mapType(t.slice(0, -2));
  if (t.endsWith('?')) return mapType(t.slice(0, -1));
  return t;
}

function extractDefault(attrs) {
  const marker = '@default(';
  const start = attrs.indexOf(marker);
  if (start === -1) return '';

  let i = start + marker.length;
  let depth = 1;
  let value = '';
  while (i < attrs.length && depth > 0) {
    const ch = attrs[i];
    if (ch === '(') depth += 1;
    if (ch === ')') depth -= 1;
    if (depth > 0) value += ch;
    i += 1;
  }
  return value.trim();
}

for (const line of lines) {
  const trimmed = line.trim();

  if (!current) {
    const mm = trimmed.match(/^model\s+(\w+)\s+\{$/);
    if (mm) {
      current = { name: mm[1], dbName: mm[1], fields: [] };
      models.push(current);
    }
    continue;
  }

  if (trimmed === '}') {
    current = null;
    continue;
  }

  if (trimmed.startsWith('@@map(')) {
    const m = trimmed.match(/@@map\("([^"]+)"\)/);
    if (m) current.dbName = m[1];
    continue;
  }

  if (trimmed.startsWith('@@') || trimmed.startsWith('@') || trimmed.length === 0) {
    continue;
  }

  const m = trimmed.match(/^(\w+)\s+([^\s]+)(.*)$/);
  if (!m) continue;

  const [, name, rawType, attrs] = m;
  const isList = rawType.endsWith('[]');
  const isOptional = rawType.endsWith('?');
  const type = mapType(rawType);
  const isId = /@id\b/.test(attrs);
  const isUnique = /@unique\b/.test(attrs);
  const defaultValue = extractDefault(attrs);

  const relMatch = attrs.match(/@relation\(fields:\s*\[([^\]]+)\],\s*references:\s*\[([^\]]+)\]/);
  const rel = relMatch
    ? {
        fields: relMatch[1].split(',').map(s => s.trim()).filter(Boolean),
        references: relMatch[2].split(',').map(s => s.trim()).filter(Boolean),
      }
    : null;

  current.fields.push({
    name,
    rawType,
    type,
    isList,
    isOptional,
    isId,
    isUnique,
    defaultValue,
    rel,
  });
}

const modelByName = new Map(models.map(m => [m.name, m]));

const mmd = [];
mmd.push('erDiagram');

for (const model of models) {
  const fkFields = new Set(
    model.fields
      .filter(f => f.rel)
      .flatMap(f => f.rel.fields ?? []),
  );
  mmd.push(`  "${model.dbName}" {`);
  for (const f of model.fields) {
    if (f.rel) continue; // hide relation object fields, keep FK scalar fields
    if (!scalarTypes.has(f.type)) continue;
    const key = f.isId ? 'PK' : fkFields.has(f.name) ? 'FK' : '';
    const safeDefault = f.defaultValue.replace(/"/g, "'");
    const comment = f.defaultValue ? `"default: ${safeDefault}"` : '';
    mmd.push(`    ${f.type} ${f.name} ${key} ${comment}`.trimEnd());
  }
  mmd.push('  }');
}

for (const model of models) {
  for (const f of model.fields) {
    if (!f.rel) continue;
    const target = modelByName.get(f.type);
    if (!target) continue;

    // parent(one) to child(many/one)
    const left = f.isOptional ? 'o|' : '||';
    const fkUnique =
      (f.rel.fields ?? []).length > 0 &&
      (f.rel.fields ?? []).every(fieldName =>
        model.fields.some(mf => mf.name === fieldName && mf.isUnique),
      );
    const right = fkUnique ? 'o|' : 'o{';
    mmd.push(`  "${target.dbName}" ${left}--${right} "${model.dbName}" : "${f.name}"`);
  }
}

fs.writeFileSync(outMmd, mmd.join('\n'));

const mermaidConfig = {
  theme: 'forest',
  deterministicIds: true,
  er: { useMaxWidth: true },
};
fs.writeFileSync(tmpConfig, JSON.stringify(mermaidConfig));

const mmdcPath = path.resolve('node_modules/.bin/mmdc');
execSync(`"${mmdcPath}" -i "${outMmd}" -o "${outSvg}" -c "${tmpConfig}"`, {
  stdio: 'inherit',
});

fs.unlinkSync(tmpConfig);
console.log(`Generated: ${outSvg}`);
