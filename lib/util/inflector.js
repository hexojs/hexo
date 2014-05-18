/**
* Inflector.
*
* @class inflector
* @namespace util
* @since 2.4.0
* @module hexo
*/

var plurals = [],
  singulars = [],
  uncountables = [];

var words = [
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'en', 'for', 'if', 'in', 'of', 'on',
  'or', 'the', 'to', 'v', 'v.', 'via', 'vs', 'vs.'
];

var plural = function(key, value){
  plurals.push([key, value]);
};

var singular = function(key, value){
  singulars.push([key, value]);
};

var irregular = function(key, value){
  plural(new RegExp('(' + key + ')$', 'i'), value);
  singular(new RegExp('(' + value + ')$', 'i'), key);
};

var uncountable = function(word){
  uncountables.push(new RegExp('(' + word + ')$', 'i'));
};

plural(/$/, 's');
plural(/s$/i, 's');
plural(/(ax|test)is$/i, '$1es');
plural(/(octop|vir)us$/i, '$1i');
plural(/(alias|status)$/i, '$1es');
plural(/(bu)s$/i, '$1ses');
plural(/(buffal|tomat)o$/i, '$1oes');
plural(/([ti])um$/i, '$1a');
plural(/sis$/i, 'ses');
plural(/(?:([^f])fe|([lr])f)$/i, '$1$2ves');
plural(/(hive)$/i, '$1s');
plural(/([^aeiouy]|qu)y$/i, '$1ies');
plural(/(x|ch|ss|sh)$/i, '$1es');
plural(/(matr|vert|ind)(?:ix|ex)$/i, '$1ices');
plural(/([m|l])ouse$/i, '$1ice');
plural(/^(ox)$/i, '$1en');
plural(/(quiz)$/i, '$1zes');

singular(/s$/i, '');
singular(/(n)ews$/i, '$1ews');
singular(/([ti])a$/i, '$1um');
singular(/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i, '$1$2sis');
singular(/(analy)ses$/i, '$1sis');
singular(/([^f])ves$/i, '$1fe');
singular(/(hive)s$/i, '$1');
singular(/(tive)s$/i, '$1');
singular(/([lr])ves$/i, '$1f');
singular(/([^aeiouy]|qu)ies$/i, '$1y');
singular(/(s)eries$/i, '$1eries');
singular(/(m)ovies$/i, '$1ovie');
singular(/(x|ch|ss|sh)es$/i, '$1');
singular(/([m|l])ice$/i, '$1ouse');
singular(/(bus)es$/i, '$1');
singular(/(o)es$/i, '$1');
singular(/(shoe)s$/i, '$1');
singular(/(cris|ax|test)es$/i, '$1is');
singular(/(octop|vir)i$/i, '$1us');
singular(/(alias|status)es$/i, '$1');
singular(/^(ox)en/i, '$1');
singular(/(vert|ind)ices$/i, '$1ex');
singular(/(matr)ices$/i, '$1ix');
singular(/(quiz)zes$/i, '$1');
singular(/(database)s$/i, '$1');

irregular('person', 'people');
irregular('man', 'men');
irregular('child', 'children');
irregular('sex', 'sexes');
irregular('move', 'moves');
irregular('cow', 'kine');
irregular('zombie', 'zombies');
irregular('genus', 'genera');

uncountable('equipment');
uncountable('information');
uncountable('rice');
uncountable('money');
uncountable('species');
uncountable('series');
uncountable('fish');
uncountable('sheep');
uncountable('jeans');
uncountable('police');
uncountable('status');

/**
* Returns the plural form of the string.
*
* @method pluralize
* @param {String} str
* @return {String}
* @static
*/

var pluralize = exports.pluralize = function(str){
  str = str.toLowerCase();

  var i;

  for (i = uncountables.length - 1; i >= 0; i--){
    if (uncountables[i].test(str)){
      return str;
    }
  }

  for (i = plurals.length - 1; i >= 0; i--){
    var item = plurals[i],
      rule = item[0];

    if (item[1] === str) return str;

    if (rule.test(str)){
      return str.replace(rule, item[1]);
    }
  }

  return str;
};

/**
* Returns the singular form of the string.
*
* @method singularize
* @param {String} str
* @return {String}
* @static
*/

var singularize = exports.singularize = function(str){
  str = str.toLowerCase();

  var i;

  for (i = uncountables.length - 1; i >= 0; i--){
    if (uncountables[i].test(str)){
      return str;
    }
  }

  for (i = singulars.length - 1; i >= 0; i--){
    var item = singulars[i],
      rule = item[0];

    if (rule.test(str)){
      return str.replace(rule, item[1]);
    }
  }

  return str;
};

/**
* Converts the string to CamelCase.
*
* @method singularize
* @param {String} str
* @param {Boolean} uppercase
* @return {String}
* @static
*/

var camelize = exports.camelize = function(str, uppercase){
  if (uppercase == null) uppercase = true;

  str = str.replace(/(?:_|(\/))([a-z\d]*)/g, function(){
    var word = arguments[2];

    return word[0].toUpperCase() + word.substring(1);
  });

  if (uppercase) str = str[0].toUpperCase() + str.substring(1);

  return str;
};

/**
* Returns an underscored, lowercased form of the string.
*
* @method underscore
* @param {String} str
* @return {String}
* @static
*/

var underscore = exports.underscore = function(str){
  return str
    .replace(/([A-Z\d]+)([A-Z][a-z])/g, function(){
      return arguments[1] + '_' + arguments[2].toLowerCase();
    })
    .replace(/([a-z\d])([A-Z])/g, function(){
      return arguments[1] + '_' + arguments[2].toLowerCase();
    })
    .replace(/-/g, '_')
    .toLowerCase();
};

/**
* Capitalizes the first word, turns underscores into spaces and strip a trailing "_id".
*
* @method humanize
* @param {String} str
* @return {String}
* @static
*/

var humanize = exports.humanize = function(str){
  str = str
    .replace(/_id$/, '')
    .replace(/_/g, ' ')
    .toLowerCase();

  return str[0].toUpperCase() + str.substring(1);
};

/**
* Capitalizes all the words.
*
* @method startcase
* @param {String} str
* @return {String}
* @static
*/

var startcase = exports.startcase = function(str){
  return humanize(underscore(str))
    .replace(/\b(['’`])?([a-z])/g, function(match){
      if (arguments[1]){
        return match;
      } else {
        return arguments[2].toUpperCase();
      }
    });
};

/**
* Capitalizes all the words, except for articles, prepositions, and conjunctions.
*
* `titleize` is also aliased as `titlecase`.
*
* @method titleize
* @param {String} str
* @return {String}
* @static
*/

var titleize = exports.titleize = exports.titlecase = function(str){
  return startcase(str)
    .replace(/(['’`])?(\w+)/g, function(match, mark, str){
      if (mark){
        return match;
      } else {
        str = str.toLowerCase();

        if (words.indexOf(str) == -1){
          return str[0].toUpperCase() + str.substring(1);
        } else {
          return str;
        }
      }
    });
};

/**
* Creates a name of a table.
*
* @method tableize
* @param {String} str
* @return {String}
* @static
*/

var tableize = exports.tableize = function(str){
  return pluralize(underscore(str));
};

/**
* Creates a class name.
*
* @method classify
* @param {String} str
* @return {String}
* @static
*/

var classify = exports.classify = function(str){
  return camelize(singularize(str.replace(/.*\./g, '')));
};

/**
* Replaces underscores with dashes in the string.
*
* @method dasherize
* @param {String} str
* @return {String}
* @static
*/

var dasherize = exports.dasherize = function(str){
  return str.replace(/_/g, '-');
};

/**
* Replaces special characters in a string so that it may be used as part of a ‘pretty’ URL.
*
* @method parameterize
* @param {String} str
* @return {String}
* @static
*/

var parameterize = exports.parameterize = function(str, sep){
  if (sep == null) sep = '-';

  str = str
    .toLowerCase()
    .replace(/[^a-z0-9\-_]+/g, sep);

  if (sep){
    str = str
      // Remove repeated separators
      .replace(new RegExp(sep + '{2,}', 'g'), sep)
      // Remove leading/trailing separators
      .replace(new RegExp('^' + sep + '|' + sep + '$'), '');
  }

  return str;
};

/**
* Creates a foreign key name from a class name. `separate_class_name_and_id_with_underscore` sets
* whether the method should put '_' between the name and 'id'.
*
* @method foreignKey
* @param {String} str
* @param {Boolean} sep
* @return {String}
* @static
*/

var foreignKey = exports.foreignKey = exports.foreign_key = function(str, sep){
  if (sep == null) sep = true;

  return underscore(singularize(str) + (sep ? '_id' : 'id'));
};

/**
* Returns the suffix that should be added to a number to denote the position in
* an ordered sequence such as 1st, 2nd, 3rd, 4th.
*
* @method ordinal
* @param {Number} num
* @return {String}
* @static
*/

var ordinal = exports.ordinal = function(num){
  num = Math.abs(+num) % 100;

  if (num >= 11 && num <= 13){
    return 'th';
  } else {
    switch (num % 10){
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }
};

/**
* Turns a number into an ordinal string used to denote the position in an ordered sequence
* such as 1st, 2nd, 3rd, 4th.
*
* @method ordinalize
* @param {Number} num
* @return {String}
* @static
*/

var ordinalize = exports.ordinalize = function(num){
  return num + ordinal(num);
};