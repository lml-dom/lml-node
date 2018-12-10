/**
 * LML-related CLI tool
 * Converts from HTML/LML to HTML/JSON/LML
 * Usage:
 * lml [--from=html|lml] [--to=html|lml|json] [--minify] [--indentation=INDENT_SPEC] [--out=outfile] source.html
 * Note:
 *   --indentation allows for spaces or tab. Defaults to 2 spaces ("  "). You may use "s" or "t" to keep your CLI argument sane
 *   --minify only works with HTML and JSON outputs and is mutually exclusive with --indentation
 */

import { readFile, writeFile } from 'fs';
import * as minimist from 'minimist';

import { HtmlParser } from './src/html-parser';
import { LmlParser } from './src/lml-parser';
import { ParseError } from './src/parse-error';

/**
 * Print human readable error(s) and stop running.
 */
function error(...errors: (string | Error | ParseError)[]): void {
  errors = errors.filter((err) => !!err);
  if (errors.length) {
    for (const err of errors) {
      console.error(typeof err === 'string' ? err : (String(err)));
    }
    process.exit(1);
  }
}

const convertMethods = {html: 'toHtml', json: 'toJSON', lml: 'toLml'};
const sourceTypes = ['html', 'lml'];

const ARG_START_INDEX = 2;
const args = minimist(process.argv.slice(ARG_START_INDEX));

const url = args._[0];
if (!url) {
  error('file path argument is required');
}
if (args._.length > 1) {
  error('more than 1 source specified: ' + args._.join(', '));
}

if (args.from) {
  const from = String(args.from).toLowerCase();
  if (sourceTypes.indexOf[from] === -1) {
    error('unknown source type (`--from`): ' + args.from);
  }
  args.from = from;
} else {
  const ext = String(url || '').toLowerCase().split('.').pop();
  args.from = ext === 'html' || ext === 'html' ? 'html' : 'lml';
}

if (args.to) {
  const to = String(args.to).toLowerCase();
  if (!convertMethods[to]) {
    error('unknown conversion target (`--to`): ' + args.to);
  }
  args.to = to;
} else {
  const ext = String(args.out || '').toLowerCase().split('.').pop();
  args.to = ['html', 'json', 'lml'].indexOf(ext) > -1 ? ext : (args.from === 'html' ? 'lml' : 'html');
}

args.indentation = !args.minify && (args.indentation == null || args.indentation === true) ? '  ' : args.indentation;
if (args.indentation) {
  args.indentation = args.indentation.toLowerCase()
    .split('\\s').join(' ').split('\\t').join('\t').split('s').join(' ').split('t').join('\t');
  if (args.indentation.replace(/[ \t]/g, '').length || (args.indentation.length > 1 && args.indentation.indexOf('\t') > -1)) {
    error('indentation can only be spaces or one tab');
  }
}
if (args.indentation === '' && args.to === 'lml') {
  error('indentation must be at least one space for LML');
}

if (args.minify) {
  if (args.to === 'lml') {
    error('LML output can not take `--minify`');
  }
  if (args.indentation) {
    error('Can not combine `--minify` and `--indentation`');
  }
  args.indentation = '';
}

readFile(url, 'utf8', (readErr, src) => {
  error(readErr);

  const ast = (args.from === 'html' ? new HtmlParser(url, src) : new LmlParser(url, src)).ast;
  if (ast.errors && ast.errors.length) {
    error(...ast.errors);
  }

  const out = ast[convertMethods[args.to]]({indentation: args.indentation, minify: !!args.minify});

  if (args.out) {
    writeFile(args.out, out, (writeErr) => {
      error(writeErr);
    });
  } else if (args.to === 'json') {
    console.log(JSON.stringify(out, null, args.indentation));
  } else {
    console.log(out.trim());
  }
});
