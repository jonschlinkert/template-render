'use strict';

var should = require('should');
var through = require('through2');
var assemble = require('assemble');
var Push = require('assemble-push');
var extname = require('gulp-extname');
var Render = require('../');

describe('template-render', function () {
  var app = null;
  var push = null;
  var render = null;
  beforeEach(function () {
    app = assemble.init();
    push = Push(app);
    render = Render(app);
    app.create('item', {isRenderable: true});
    app.items({
      one: { path: 'one.hbs', content: '---\nmsg: hello one\n---\n1: {{ msg }}' },
      two: { path: 'two.hbs', content: '---\nmsg: hello two\n---\n2: {{ msg }}' },
      three: { path: 'three.hbs', content: '---\nmsg: hello three\n---\n3: {{ msg }}' },
      four: { path: 'four.hbs', content: '---\nmsg: hello four\n---\n4: {{ msg }}' }
    });
  });

  it('should render default pages from `assemble.src`', function (done) {
    app.src('test/fixtures/*.hbs')
      .pipe(render())
      .on('data', function (file) {
        file.contents.toString().should.eql('test: hello test\n');
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

  it('should render items from multiple collections', function (done) {
    app.task('items-test', function () {
      app.create('item2', 'items2', {isRenderable: true});
      app.items2({
        two: { path: 'items2/two.hbs', content: '---\nmsg: hello items2.two\n---\n2: {{ msg }}' },
        three: { path: 'items2/three.hbs', content: '---\nmsg: hello items2.three\n---\n3: {{ msg }}' },
        four: { path: 'items2/four.hbs', content: '---\nmsg: hello items2.four\n---\n4: {{ msg }}' },
        five: { path: 'items2/five.hbs', content: '---\nmsg: hello items2.five\n---\n5: {{ msg }}' }
      });

      var stream = push('items');
      return stream.pipe(push('items2'))
        .pipe(render())
        .on('data', function (file) {
          switch (file.path) {
            case 'items2/one.hbs':
              file.contents.toString().should.eql('1: hello one');
              break;
            case 'items2/two.hbs':
              file.contents.toString().should.eql('2: hello items2.two');
              break;
            case 'items2/three.hbs':
              file.contents.toString().should.eql('3: hello items2.three');
              break;
            case 'items2/four.hbs':
              file.contents.toString().should.eql('4: hello items2.four');
              break;
            case 'items2/five.hbs':
              file.contents.toString().should.eql('5: hello items2.five');
              break;
            case 'one.hbs':
              file.contents.toString().should.eql('1: hello one');
              break;
            case 'two.hbs':
              file.contents.toString().should.eql('2: hello items2.two');
              break;
            case 'three.hbs':
              file.contents.toString().should.eql('3: hello items2.three');
              break;
            case 'four.hbs':
              file.contents.toString().should.eql('4: hello items2.four');
              break;
          }
        });
      });
    app.task('default', ['items-test'], function () { done(); });
    app.run('default');
  });

  it('should render pages loaded with custom renameKey', function (done) {
    app.option('renameKey', function (fp) {
      return fp;
    });
    app.task('renameKey-test', function () {
      return app.src('test/fixtures/*.hbs')
        .pipe(render())
        .on('data', function (file) {
          file.contents.toString().should.eql('test: hello test\n');
        });
    });
    app.task('default', ['renameKey-test'], function () { done(); });
    app.run('default');
  });

  it('should sync the path propety if changed in the pipeline before rendering', function (done) {
    var origPath = null;
    app.src('test/fixtures/*.hbs')
      .on('data', function (file) {
        origPath = file.path;
      })
      .pipe(extname())
      .on('data', function (file) {
        file.path.should.eql(origPath.replace('.hbs', '.html'));
      })
      .pipe(render())
      .on('data', function (file) {
        file.path.should.eql(origPath.replace('.hbs', '.html'));
      })
      .on('error', done)
      .on('end', done);
  });

  it('should sync the path property if changed during rendering', function (done) {
    app.preRender(/./, function (file, next) {
      file.path = file.path.replace('.hbs', '.html');
      next(null, file);
    });

    var origPath = null;
    app.src('test/fixtures/*.hbs')
      .on('data', function (file) {
        origPath = file.path;
      })
      .pipe(render())
      .on('data', function (file) {
        file.contents.toString().should.eql('test: hello test\n');
        file.path.should.eql(origPath.replace('.hbs', '.html'));
      })
      .on('error', done)
      .on('end', done);
  });
});
