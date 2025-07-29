import * as picocolors from 'picocolors';
import type Hexo from '../../hexo/index.js';

interface MigrateArgs {
  _: string[]
  [key: string]: any
}

function migrateConsole(this: Hexo, args: MigrateArgs): Promise<any> {
  // Display help message if user didn't input any arguments
  if (!args._.length) {
    return this.call('help', {_: ['migrate']});
  }

  const type = args._.shift();
  const migrators = this.extend.migrator.list();

  if (!migrators[type]) {
    let help = '';

    help += `${picocolors.magenta(type)} migrator plugin is not installed.\n\n`;
    help += 'Installed migrator plugins:\n';
    help += `  ${Object.keys(migrators).join(', ')}\n\n`;
    help += `For more help, you can check the online docs: ${picocolors.underline('https://hexo.io/')}`;

    console.log(help);
    return;
  }

  return Reflect.apply(migrators[type], this, [args]);
}

export default migrateConsole;
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = migrateConsole;
  module.exports.default = migrateConsole;
}
