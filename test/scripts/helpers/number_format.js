'use strict';

var should = require('chai').should();

describe('number_format', function(){
  var numberFormat = require('../../../lib/plugins/helper/number_format');

  it('default', function(){
    numberFormat(1234.567).should.eql('1,234.567');
  });

  it('precision', function(){
    numberFormat(1234.567, {precision: false}).should.eql('1,234.567');
    numberFormat(1234.567, {precision: 0}).should.eql('1,234');
    numberFormat(1234.567, {precision: 1}).should.eql('1,234.6');
    numberFormat(1234.567, {precision: 2}).should.eql('1,234.57');
    numberFormat(1234.567, {precision: 3}).should.eql('1,234.567');
    numberFormat(1234.567, {precision: 4}).should.eql('1,234.5670');
  });

  it('delimiter', function(){
    numberFormat(1234.567, {delimiter: ' '}).should.eql('1 234.567');
  });

  it('separator', function(){
    numberFormat(1234.567, {separator: '*'}).should.eql('1,234*567');
  });
});