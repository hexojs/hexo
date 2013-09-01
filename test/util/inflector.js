var util = require('../../lib/util'),
  cases = require('./inflector_test_cases');

describe('inflector', function(){
  var inflector = util.inflector;

  it('pluralize', function(){
    for (var i in cases.singularToPlural){
      inflector.pluralize(i).should.eql(cases.singularToPlural[i]);
    }

    for (var i in cases.irregularities){
      inflector.pluralize(i).should.eql(cases.irregularities[i]);
    }
  });

  it('singularize', function(){
    for (var i in cases.singularToPlural){
      inflector.singularize(cases.singularToPlural[i]).should.eql(i);
    }

    for (var i in cases.irregularities){
      inflector.singularize(cases.irregularities[i]).should.eql(i);
    }
  });

  it('camelize', function(){
    for (var i in cases.underscoreToLowerCamel){
      var str = cases.underscoreToLowerCamel[i];

      inflector.camelize(i).should.eql(str[0].toUpperCase() + str.substring(1));
      inflector.camelize(i, false).should.eql(str);
    }
  });

  it('underscore', function(){
    for (var i in cases.camelToUnderscore){
      inflector.underscore(i).should.eql(cases.camelToUnderscore[i]);
    }
  });

  it('humanize', function(){
    for (var i in cases.underscoreToHuman){
      inflector.humanize(i).should.eql(cases.underscoreToHuman[i]);
    }
  });

  it('startcase', function(){
    for (var i in cases.mixtureToTitleCase){
      inflector.startcase(i).should.eql(cases.mixtureToTitleCase[i]);
    }
  });

  it('titlecase', function(){
    inflector.titlecase('Today is a beatuiful day').should.eql('Today Is a Beatuiful Day');
    inflector.titlecase('TODAY IS A BEATUIFUL DAY').should.eql('Today Is a Beatuiful Day');
    inflector.titlecase('today is a beatuiful day').should.eql('Today Is a Beatuiful Day');
  });

  it('tableize', function(){
    for (var i in cases.classNameToTableName){
      inflector.tableize(i).should.eql(cases.classNameToTableName[i]);
    }
  });

  it('classify', function(){
    for (var i in cases.classNameToTableName){
      inflector.classify(cases.classNameToTableName[i]).should.eql(i);
    }
  });

  it('dasherize', function(){
    for (var i in cases.underscoresToDashes){
      inflector.dasherize(i).should.eql(cases.underscoresToDashes[i]);
    }
  });

  it('parameterize', function(){
    for (var i in cases.stringToParameterized){
      inflector.parameterize(i).should.eql(cases.stringToParameterized[i]);
    }

    for (var i in cases.stringToParameterizeWithNoSeparator){
      inflector.parameterize(i, '').should.eql(cases.stringToParameterizeWithNoSeparator[i]);
    }

    for (var i in cases.stringToParameterizeWithUnderscore){
      inflector.parameterize(i, '_').should.eql(cases.stringToParameterizeWithUnderscore[i]);
    }
  });

  it('foreignKey', function(){
    for (var i in cases.classNameToForeignKeyWithUnderscore){
      inflector.foreignKey(i).should.eql(cases.classNameToForeignKeyWithUnderscore[i]);
    }

    for (var i in cases.classNameToForeignKeyWithoutUnderscore){
      inflector.foreignKey(i, false).should.eql(cases.classNameToForeignKeyWithoutUnderscore[i]);
    }
  });

  it('ordinal', function(){
    for (var i in cases.ordinalNumbers){
      inflector.ordinal(+i).should.eql(cases.ordinalNumbers[i]);
    }
  });

  it('ordinalize', function(){
    for (var i in cases.ordinalNumbers){
      inflector.ordinalize(+i).should.eql(i + cases.ordinalNumbers[i]);
    }
  });
});