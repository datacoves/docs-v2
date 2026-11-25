/**
 * Swizzled from @docusaurus/theme-classic (MIT, Copyright (c) Facebook, Inc.
 * and its affiliates) to add a Jinja grammar and a few fence aliases.
 */
import siteConfig from '@generated/docusaurus.config';

// Prism's own django/jinja2 grammar only works with the markup-templating
// hooks, which prism-react-renderer never runs, so comments like {# ... #}
// were colored as code. This grammar matches whole tags in the raw text
// instead. Tags must close on the same line, so the deliberately broken
// examples in the dbt docs stay plain text rather than swallowing what follows.
const JINJA_EXPRESSION = {
  string: {pattern: /("|')(?:\\.|(?!\1)[^\\\r\n])*\1/, greedy: true},
  keyword:
    /\b(?:and|as|block|call|do|elif|else|endblock|endcall|endfilter|endfor|endif|endmacro|endraw|endset|endwith|extends|filter|for|from|if|import|in|include|is|macro|not|or|raw|recursive|set|with)\b/,
  boolean: /\b(?:false|none|true|False|None|True)\b/,
  number: /\b\d+(?:\.\d+)?\b/,
  filter: {pattern: /(\|\s*)\w+/, lookbehind: true, alias: 'function'},
  function: /\b\w+(?=\s*\()/,
  operator: /\*\*|\/\/|[-+*/%~]|[=!<>]=?/,
  punctuation: /[()[\]{}.,:|]/,
  variable: /\b\w+\b/,
};

const JINJA = {
  comment: {pattern: /\{#[\s\S]*?#\}/, greedy: true},
  'jinja-tag': {
    pattern: /\{%-?[^\r\n]*?-?%\}|\{\{-?[^\r\n]*?-?\}\}/,
    greedy: true,
    inside: {
      delimiter: {pattern: /^\{[{%]-?|-?[%}]\}$/, alias: 'punctuation'},
      ...JINJA_EXPRESSION,
    },
  },
};

// Fence names writers are likely to use, mapped to a language Prism has.
const ALIASES = {
  jinja: 'jinja2',
  env: 'ini',
  dotenv: 'ini',
  kql: 'kusto',
};

export default function prismIncludeLanguages(PrismObject) {
  const {
    themeConfig: {prism},
  } = siteConfig;
  const {additionalLanguages} = prism;
  // Prism components work on the Prism instance on the window, while prism-
  // react-renderer uses its own Prism instance. We temporarily mount the
  // instance onto window, import components to enhance it, then remove it to
  // avoid polluting global namespace.
  const PrismBefore = globalThis.Prism;
  globalThis.Prism = PrismObject;
  additionalLanguages.forEach((lang) => {
    if (lang === 'php') {
      // eslint-disable-next-line global-require
      require('prismjs/components/prism-markup-templating.js');
    }
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(`prismjs/components/prism-${lang}`);
  });
  // Clean up and eventually restore former globalThis.Prism object (if any)
  delete globalThis.Prism;
  if (typeof PrismBefore !== 'undefined') {
    globalThis.Prism = PrismObject;
  }

  PrismObject.languages.jinja2 = JINJA;
  Object.entries(ALIASES).forEach(([alias, lang]) => {
    if (PrismObject.languages[lang]) {
      PrismObject.languages[alias] = PrismObject.languages[lang];
    }
  });
}
