'use strict';

var should = require('should');
var through = require('through2');
var assemble = require('assemble');
var push = require('assemble-push')(assemble);
var render = require('../')(assemble);

describe('template-render', function () {
  assemble.create('item', {isRenderable: true});
  assemble.items({
    one: { path: 'one.hbs', content: '---\nmsg: hello one\n---\n1: {{ msg }}' },
    two: { path: 'two.hbs', content: '---\nmsg: hello two\n---\n2: {{ msg }}' },
    three: { path: 'three.hbs', content: '---\nmsg: hello three\n---\n3: {{ msg }}' },
    four: { path: 'four.hbs', content: '---\nmsg: hello four\n---\n4: {{ msg }}' }
  });

  it('should render default pages from `assemble.src`', function (done) {
    assemble.src('test/fixtures/*.hbs')
      .pipe(render())
      .on('data', function (file) {
        file.contents.toString().should.eql('test: hello test');
      })
      .on('error', done)
      .on('end', done);
  });

  it('should render items', function (done) {
    var stream = push('items');
    stream.pipe(render())
      .on('data', function (file) {
        switch (file.path) {
          case 'one.hbs':
            file.contents.toString().should.eql('1: hello one');
            break;
          case 'two.hbs':
            file.contents.toString().should.eql('2: hello two');
            break;
          case 'three.hbs':
            file.contents.toString().should.eql('3: hello three');
            break;
          case 'four.hbs':
            file.contents.toString().should.eql('4: hello four');
            break;
        }
      })
      .on('error', done)
      .on('end', done);
  });
});
