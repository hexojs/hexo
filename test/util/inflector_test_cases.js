// https://github.com/rails/rails/blob/master/activesupport/test/inflector_test_cases.rb

exports.singularToPlural = {
  'search': 'searches',
  'switch': 'switches',
  'fix': 'fixes',
  'box': 'boxes',
  'process': 'processes',
  'address': 'addresses',
  'case': 'cases',
  'stack': 'stacks',
  'wish': 'wishes',
  'fish': 'fish',
  'jeans': 'jeans',
  'funky jeans': 'funky jeans',
  'my money': 'my money',

  'category': 'categories',
  'query': 'queries',
  'ability': 'abilities',
  'agency': 'agencies',
  'movie': 'movies',

  'archive': 'archives',

  'index': 'indices',

  'wife': 'wives',
  'safe': 'saves',
  'half': 'halves',

  'move': 'moves',

  'salesperson': 'salespeople',
  'person': 'people',

  'spokesman': 'spokesmen',
  'man': 'men',
  'woman': 'women',

  'basis': 'bases',
  'diagnosis': 'diagnoses',
  'diagnosis_a': 'diagnosis_as',

  'datum': 'data',
  'medium': 'media',
  'stadium': 'stadia',
  'analysis': 'analyses',
  'my_analysis': 'my_analyses',

  'node_child': 'node_children',
  'child': 'children',

  'experience': 'experiences',
  'day': 'days',

  'comment': 'comments',
  'foobar': 'foobars',
  'newsletter': 'newsletters',

  'old_news': 'old_news',
  'news': 'news',

  'series': 'series',
  'species': 'species',

  'quiz': 'quizzes',

  'perspective': 'perspectives',

  'ox': 'oxen',
  'photo': 'photos',
  'buffalo': 'buffaloes',
  'tomato': 'tomatoes',
  'dwarf': 'dwarves',
  'elf': 'elves',
  'information': 'information',
  'equipment': 'equipment',
  'bus': 'buses',
  'status': 'statuses',
  'status_code': 'status_codes',
  'mouse': 'mice',

  'louse': 'lice',
  'house': 'houses',
  'octopus': 'octopi',
  'virus': 'viri',
  'alias': 'aliases',
  'portfolio': 'portfolios',

  'vertex': 'vertices',
  'matrix': 'matrices',
  'matrix_fu': 'matrix_fus',

  'axis': 'axes',
  'taxi': 'taxis', // prevents regression
  'testis': 'testes',
  'crisis': 'crises',

  'rice': 'rice',
  'shoe': 'shoes',

  'horse': 'horses',
  'prize': 'prizes',
  'edge': 'edges',

  'database': 'databases',

  'slice': 'slices',
  'police': 'police'
};

exports.camelToUnderscore = {
  'Product': 'product',
  'SpecialGuest': 'special_guest',
  'ApplicationController': 'application_controller',
  'Area51Controller': 'area51_controller'
};

exports.underscoreToLowerCamel = {
  'product': 'product',
  'special_guest': 'specialGuest',
  'application_controller': 'applicationController',
  'area51_controller': 'area51Controller'
};

exports.classNameToForeignKeyWithUnderscore = {
  'Person': 'person_id',
  'posts': 'post_id'
};

exports.classNameToForeignKeyWithoutUnderscore = {
  'Person': 'personid',
  'posts': 'postid'
};

exports.classNameToTableName = {
  'PrimarySpokesman': 'primary_spokesmen',
  'NodeChild': 'node_children'
};

exports.stringToParameterized = {
  'Donald E. Knuth': 'donald-e-knuth',
  'Random text with *(bad)* characters': 'random-text-with-bad-characters',
  'Allow_Under_Scores': 'allow_under_scores',
  'Trailing bad characters!@#': 'trailing-bad-characters',
  '!@#Leading bad characters': 'leading-bad-characters',
  'Squeeze   separators': 'squeeze-separators',
  'Test with + sign': 'test-with-sign',
  'Test with malformed utf8 \251': 'test-with-malformed-utf8'
};

exports.stringToParameterizeWithNoSeparator = {
  'Donald E. Knuth': 'donaldeknuth',
  'With-some-dashes': 'with-some-dashes',
  'Random text with *(bad)* characters': 'randomtextwithbadcharacters',
  'Trailing bad characters!@#': 'trailingbadcharacters',
  '!@#Leading bad characters': 'leadingbadcharacters',
  'Squeeze   separators': 'squeezeseparators',
  'Test with + sign': 'testwithsign',
  'Test with malformed utf8 \251': 'testwithmalformedutf8'
};

exports.stringToParameterizeWithUnderscore = {
  'Donald E. Knuth': 'donald_e_knuth',
  'Random text with *(bad)* characters': 'random_text_with_bad_characters',
  'With-some-dashes': 'with-some-dashes',
  'Retain_underscore': 'retain_underscore',
  'Trailing bad characters!@#': 'trailing_bad_characters',
  '!@#Leading bad characters': 'leading_bad_characters',
  'Squeeze   separators': 'squeeze_separators',
  'Test with + sign': 'test_with_sign',
  'Test with malformed utf8 \251': 'test_with_malformed_utf8'
};

exports.stringToParameterizedAndNormalized = {
  'Malmö': 'malmo',
  'Garçons': 'garcons',
  'Ops\331': 'opsu',
  'Ærøskøbing': 'aeroskobing',
  'Aßlar': 'asslar',
  'Japanese: 日本語': 'japanese'
};

exports.underscoreToHuman = {
  'employee_salary': 'Employee salary',
  'employee_id': 'Employee',
  'underground': 'Underground'
};

exports.mixtureToTitleCase = {
  'active_record': 'Active Record',
  'ActiveRecord': 'Active Record',
  'action web service': 'Action Web Service',
  'Action Web Service': 'Action Web Service',
  'Action web service': 'Action Web Service',
  'actionwebservice': 'Actionwebservice',
  'Actionwebservice': 'Actionwebservice',
  'david\'s code': 'David\'s Code',
  'David\'s code': 'David\'s Code',
  'david\'s Code': 'David\'s Code',
  'sgt. pepper\'s': 'Sgt. Pepper\'s',
  'i\'ve just seen a face': 'I\'ve Just Seen A Face',
  'maybe you\'ll be there': 'Maybe You\'ll Be There',
  '¿por qué?': '¿Por Qué?',
  'Fred’s': 'Fred’s',
  'Fred`s': 'Fred`s'
};

exports.ordinalNumbers = {
  '-1': 'st',
  '-2': 'nd',
  '-3': 'rd',
  '-4': 'th',
  '-5': 'th',
  '-6': 'th',
  '-7': 'th',
  '-8': 'th',
  '-9': 'th',
  '-10': 'th',
  '-11': 'th',
  '-12': 'th',
  '-13': 'th',
  '-14': 'th',
  '-20': 'th',
  '-21': 'st',
  '-22': 'nd',
  '-23': 'rd',
  '-24': 'th',
  '-100': 'th',
  '-101': 'st',
  '-102': 'nd',
  '-103': 'rd',
  '-104': 'th',
  '-110': 'th',
  '-111': 'th',
  '-112': 'th',
  '-113': 'th',
  '-1000': 'th',
  '-1001': 'st',
  '0': 'th',
  '1': 'st',
  '2': 'nd',
  '3': 'rd',
  '4': 'th',
  '5': 'th',
  '6': 'th',
  '7': 'th',
  '8': 'th',
  '9': 'th',
  '10': 'th',
  '11': 'th',
  '12': 'th',
  '13': 'th',
  '14': 'th',
  '20': 'th',
  '21': 'st',
  '22': 'nd',
  '23': 'rd',
  '24': 'th',
  '100': 'th',
  '101': 'st',
  '102': 'nd',
  '103': 'rd',
  '104': 'th',
  '110': 'th',
  '111': 'th',
  '112': 'th',
  '113': 'th',
  '1000': 'th',
  '1001': 'st'
};

exports.underscoresToDashes = {
  'street': 'street',
  'street_address': 'street-address',
  'person_street_address': 'person-street-address'
};

exports.irregularities = {
  'person': 'people',
  'man': 'men',
  'child': 'children',
  'sex': 'sexes',
  'move': 'moves',
  'cow': 'kine',
  'zombie': 'zombies',
  'genus': 'genera'
};