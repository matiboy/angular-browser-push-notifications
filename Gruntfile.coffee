# Generated on 2015-08-24 using generator-bower 0.0.1
'use strict'

mountFolder = (connect, dir) ->
    connect.static require('path').resolve(dir)

module.exports = (grunt) ->
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks)

  yeomanConfig =
    src: 'src'
    dist : 'dist'
  grunt.initConfig
    yeoman: yeomanConfig


    copy:
      dist:
        files: [
          expand: true
          cwd: '<%= yeoman.src %>'
          src: '{,*/}*.js'
          dest: '<%= yeoman.dist %>'
        ]
    uglify:
      build:
        src: '<%=yeoman.dist %>/angular-browser-push-notifications.js'
        dest: '<%=yeoman.dist %>/angular-browser-push-notifications.min.js'
    mochaTest:
      test:
        options:
          reporter: 'spec'
          compilers: 'coffee:coffee-script'
        src: ['test/**/*.coffee']

    grunt.registerTask 'default', [
      # 'mochaTest'
      'copy'
      'uglify'
    ]
