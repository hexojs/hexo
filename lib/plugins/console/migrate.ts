import { underline, magenta } from 'picocolors';
import type Hexo from '../../hexo';

interface MigrateArgs {
  _: string[]
  [key: string]: any
}

function migrateConsole(this: Hexo, args: MigrateArgs) {
  // Display help message if user didn't input any arguments
  if (!args._.length) {
    return this.call('help', {_: ['migrate']});
  }

  const type = args._.shift();
  const migrators = this.extend.migrator.list();

  if (!migrators[type]) {
    let help = '';

    help += `${magenta(type)} migrator plugin is not installed.\n\n`;
    help += 'Installed migrator plugins:\n';
    help += `  ${Object.keys(migrators).join(', ')}\n\n`;
    help += `For more help, you can check the online docs: ${underline('https://hexo.io/')}`;

    console.log(help);
    return;
  }

  return Reflect.apply(migrators[type], this, [args]);
}

export = migrateConsole;
