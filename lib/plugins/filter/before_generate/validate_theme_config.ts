import { join } from 'path';
import Ajv2020, { type ErrorObject, type ValidateFunction } from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { exists, readFile } from 'hexo-fs';
import type Hexo from '../../../hexo';

interface CachedValidator {
  source: string;
  validate: ValidateFunction;
}

const validatorCache = new Map<string, CachedValidator>();

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function loadValidator(schemaPath: string): Promise<ValidateFunction> {
  let source: string,
    schema: any;

  try {
    source = await readFile(schemaPath);
  } catch (error) {
    throw new TypeError(`Failed to read theme config schema "${schemaPath}": ${errorMessage(error)}`);
  }

  const cached = validatorCache.get(schemaPath);
  if (cached?.source === source) return cached.validate;

  try {
    schema = JSON.parse(source);
  } catch (error) {
    throw new TypeError(`Failed to read theme config schema "${schemaPath}": ${errorMessage(error)}`);
  }

  const validate = compileSchema(schema, schemaPath);
  validatorCache.set(schemaPath, { source, validate });
  return validate;
}

function compileSchema(schema: any, schemaPath: string): ValidateFunction {
  if (schema && typeof schema === 'object' && schema.$async === true) {
    throw new TypeError(`Invalid theme config schema "${schemaPath}": asynchronous schemas are not supported`);
  }

  const ajv = new Ajv2020({
    allErrors: true,
    coerceTypes: false,
    removeAdditional: false,
    strict: true,
    useDefaults: false
  });

  addFormats(ajv);

  try {
    return ajv.compile(schema);
  } catch (error) {
    throw new TypeError(`Invalid theme config schema "${schemaPath}": ${errorMessage(error)}`);
  }
}

function escapeJsonPointer(value: string): string {
  return value.replace(/~/g, '~0').replace(/\//g, '~1');
}

function errorPath(error: ErrorObject): string {
  let property: unknown;
  let path = error.instancePath;

  if (error.keyword === 'additionalProperties' || error.keyword === 'unevaluatedProperties') {
    property = error.params.additionalProperty || error.params.unevaluatedProperty;
  } else if (error.keyword === 'required') {
    property = error.params.missingProperty;
  }

  if (typeof property === 'string') path += `/${escapeJsonPointer(property)}`;
  return path || '/';
}

function formatErrors(errors: ErrorObject[] = []): string {
  return errors.map(error => {
    const path = errorPath(error);
    return `  - ${path} ${error.message || 'is invalid'}`;
  }).join('\n');
}

async function validateThemeConfig(this: Hexo): Promise<void> {
  const schemaPath = join(this.theme_dir, 'config.schema.json');

  if (!await exists(schemaPath)) return;
  const validate = await loadValidator(schemaPath);

  if (!validate(this.theme.config)) {
    throw new TypeError(`Theme config validation failed using "${schemaPath}":\n${formatErrors(validate.errors)}`);
  }
}

export = validateThemeConfig;
