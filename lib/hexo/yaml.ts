import { parseDocument, type ParseOptions, type Tags } from 'yaml';

interface ParseYamlOptions {
  customTags?: Tags;
  uniqueKeys?: ParseOptions['uniqueKeys'];
}

export default function parseYaml(source: string, options: ParseYamlOptions = {}): any {
  const customTags: Tags = options.customTags ? ['timestamp', ...options.customTags] : ['timestamp'];
  const document = parseDocument(source, {
    customTags,
    merge: true,
    uniqueKeys: options.uniqueKeys
  });

  if (document.errors.length > 0) throw document.errors[0];

  const unresolvedTag = document.warnings.find(warning => warning.code === 'TAG_RESOLVE_FAILED');
  if (unresolvedTag) throw unresolvedTag;

  return document.toJS();
}
