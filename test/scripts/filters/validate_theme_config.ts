import { join, sep } from 'path';
import BluebirdPromise from 'bluebird';
import chai from 'chai';
import { exists, mkdirs, rmdir, writeFile } from 'hexo-fs';
import Hexo from '../../../lib/hexo';
import validateThemeConfigFilter from '../../../lib/plugins/filter/before_generate/validate_theme_config';

type ValidateThemeConfigFilterReturn = ReturnType<typeof validateThemeConfigFilter>;
chai.should();

describe('Validate theme config', () => {
  const baseDir = join(__dirname, 'validate_theme_config_test');
  const themeDir = join(baseDir, 'themes', 'test');
  const schemaPath = join(themeDir, 'config.schema.json');
  const hexo = new Hexo(baseDir, { silent: true });
  const validateThemeConfig: () => BluebirdPromise<ValidateThemeConfigFilterReturn> = BluebirdPromise.method(validateThemeConfigFilter).bind(hexo);

  hexo.theme_dir = themeDir + sep;

  async function resetThemeDir() {
    if (await exists(baseDir)) await rmdir(baseDir);
    await mkdirs(themeDir);
    hexo.theme.config = {};
  }

  function writeSchema(schema: any) {
    return writeFile(schemaPath, JSON.stringify(schema));
  }

  async function getValidationError(): Promise<Error> {
    try {
      await validateThemeConfig();
    } catch (error) {
      return error as Error;
    }

    throw new Error('Expected theme config validation to fail');
  }

  beforeEach(resetThemeDir);

  after(async () => {
    if (await exists(baseDir)) await rmdir(baseDir);
  });

  it('does nothing when the theme has no config.schema.json', async () => {
    await validateThemeConfig();
  });

  it('accepts a valid theme config', async () => {
    hexo.theme.config = {
      darkmode: true,
      homepage: 'https://hexo.io/'
    };

    await writeSchema({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        darkmode: { type: 'boolean' },
        homepage: { type: 'string', format: 'uri' }
      },
      required: ['darkmode', 'homepage']
    });

    await validateThemeConfig();
  });

  it('reports all validation errors without config values', async () => {
    hexo.theme.config = {
      darkmode: 'yes',
      scheme: 'secret-value',
      'unexpected/key': 'another-secret-value'
    };

    await writeSchema({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        darkmode: { type: 'boolean' },
        scheme: { enum: ['Muse', 'Gemini'] },
        requiredOption: { type: 'string' }
      },
      required: ['requiredOption'],
      additionalProperties: false
    });

    const error = await getValidationError();

    error.should.be.instanceOf(TypeError);
    error.message.should.contain('/darkmode must be boolean');
    error.message.should.contain('/scheme must be equal to one of the allowed values');
    error.message.should.contain('/requiredOption must have required property');
    error.message.should.contain('/unexpected~1key must NOT have additional properties');
    error.message.should.not.contain('secret-value');
    error.message.should.not.contain('another-secret-value');
  });

  it('validates the merged theme config during generation', async () => {
    await Promise.all([
      writeFile(join(baseDir, '_config.yml'), [
        'url: https://hexo.io/',
        'theme: test'
      ].join('\n')),
      writeFile(join(baseDir, '_config.test.yml'), 'darkmode: yes'),
      writeFile(join(themeDir, '_config.yml'), 'darkmode: true'),
      writeSchema({
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'object',
        properties: {
          darkmode: { type: 'boolean' }
        }
      })
    ]);

    const siteHexo = new Hexo(baseDir, { silent: true });
    siteHexo.env.init = true;
    await siteHexo.init();

    let error: Error | undefined;

    try {
      await siteHexo.load();
    } catch (loadError) {
      error = loadError as Error;
    }

    error.should.be.instanceOf(TypeError);
    error.message.should.contain('/darkmode must be boolean');
  });

  it('reports malformed schema files', async () => {
    await writeFile(schemaPath, '{');

    const error = await getValidationError();

    error.should.be.instanceOf(TypeError);
    error.message.should.contain('Failed to read theme config schema');
  });

  it('reloads the validator when the schema changes', async () => {
    hexo.theme.config = { darkmode: true };

    await writeSchema({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        darkmode: { type: 'boolean' }
      }
    });

    await validateThemeConfig();

    await writeSchema({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {
        darkmode: { type: 'string' }
      }
    });

    const error = await getValidationError();
    error.message.should.contain('/darkmode must be string');
  });

  it('rejects asynchronous schemas', async () => {
    await writeSchema({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $async: true,
      type: 'object'
    });

    const error = await getValidationError();

    error.should.be.instanceOf(TypeError);
    error.message.should.contain('asynchronous schemas are not supported');
  });
});
