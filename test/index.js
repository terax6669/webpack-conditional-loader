const tap = require('tap')
const booleanTest = require('../build/boolean')
const elseFalsey = require('../build/else-falsey')
const elseTruthy = require('../build/else-truthy')
const envVarFalsey = require('../build/env-var-falsey')
const envVarTruthy = require('../build/env-var-truthy')
const falsey = require('../build/falsey')
const truthy = require('../build/truthy')

tap.test('recognise boolean flags', (test) => {
  test.equal(booleanTest, 2)
  test.end()
})

tap.test('only render else block if conditon not met (falsey)', (test) => {
  test.equal(elseFalsey, 2)
  test.end()
})

tap.test('only render else block if conditon not met (truthy)', (test) => {
  test.equal(elseTruthy, 2)
  test.end()
})

tap.test('comment blocks with falsey predicate', (test) => {
  test.equal(falsey, 1)
  test.end()
})

tap.test('dont comment blocks with truthy predicate', (test) => {
  test.equal(truthy, 2)
  test.end()
})

tap.test('dont comment env var blocks with truthy predicate', (test) => {
  test.equal(envVarTruthy, 2)
  test.end()
})

tap.test('comment env var blocks with falsey predicate', (test) => {
  test.equal(envVarFalsey, 1)
  test.end()
})
