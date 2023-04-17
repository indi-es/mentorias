import json2md from 'json2md';
import { getFile, saveFile, sortByName } from './utils.js';

const formatter = new Intl.ListFormat('es', {
  style: 'long',
  type: 'conjunction',
});

const headers = ['Nombre', 'Temas', 'Calendly', 'Twitter', 'Idiomas'];

function getName({ nombre, pronombres }) {
  if (!pronombres) return nombre;
  return `${nombre} (${pronombres})`;
}

async function createMD({ pre, data, post }) {
  const jsonStudios = {
    table: {
      headers,
      rows: data.map((item) => {
        const { nombre, pronombres, idiomas, temas, web, calendly, twitter } =
          item;

        const row = {
          Nombre: getName({ nombre, pronombres }),
          Temas: `[${formatter.format(temas)}](${web})`,
          Calendly: `[Calendly](${calendly})`,
          Twitter: `[@${twitter}](https://twitter.com/${twitter})`,
          Idiomas: formatter.format(idiomas),
        };

        return row;
      }),
    },
  };

  return `
  ${pre}
  ${json2md(jsonStudios)}
  ${post}
  `;
}

(async function main() {
  const db = await getFile('../../db.json');
  const parsed = JSON.parse(db).sort((a, b) => sortByName(a, b, 'nombre'));
  const pre = await getFile('../../src/pre.md');
  const post = await getFile('../../src/post.md');
  const md = await createMD({ pre, data: parsed, post });

  await saveFile('../../README.md', md);
  process.exit(0);
})().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
