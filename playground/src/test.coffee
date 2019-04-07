# This is a test CoffeeScript file used by `packem-coffeescript-plugin`
# Demo comments

import * as anotherStr from './another-test.js'

upperCaseExpr = (textParts, expressions...) ->
  textParts.reduce (text, textPart, i) ->
    text + expressions[i - 1].toUpperCase() + textPart

greet = (name, adjective) ->
  upperCaseExpr"""
               Hi #{name}. You look #{adjective}!
               """

# alert greet "GREG", "COOL"

alert anotherStr

export default "I am CoffeeScript"
