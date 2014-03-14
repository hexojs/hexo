var should = require('chai').should();

describe('Helper - number', function(){
  var number = require('../../lib/plugins/helper/number');

  describe('number_format', function(){
    it('default', function(){
      number.number_format(1234.567).should.eql('1,234.567');
    });

    it('precision', function(){
      number.number_format(1234.567, {precision: false}).should.eql('1,234.567');
      number.number_format(1234.567, {precision: 0}).should.eql('1,234');
      number.number_format(1234.567, {precision: 1}).should.eql('1,234.6');
      number.number_format(1234.567, {precision: 2}).should.eql('1,234.57');
      number.number_format(1234.567, {precision: 3}).should.eql('1,234.567');
      number.number_format(1234.567, {precision: 4}).should.eql('1,234.5670');
    });

    it('delimiter', function(){
      number.number_format(1234.567, {delimiter: ' '}).should.eql('1 234.567');
    });

    it('separator', function(){
      number.number_format(1234.567, {separator: '*'}).should.eql('1,234*567');
    });
  });
});