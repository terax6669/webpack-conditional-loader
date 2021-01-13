/* eslint-disable no-eval */

const startBlockRegex = /(<!--|\/\/) #if ([\s\S]*?)(-->)?$/
const endBlockRegex = /(<!--|\/\/) #endif[\s\S]*?(-->)?$/

function getPredicate (line) {
  return startBlockRegex.exec(line)[2]
}

function searchBlocks (sourceByLine) {
  const blocks = []
  let current = 0

  while (current < sourceByLine.length) {
    const currentLine = sourceByLine[current]
    if (startBlockRegex.test(currentLine)) {
      blocks[current] = {
        type: 'begin',
        predicate: getPredicate(currentLine),
      }
    } else if (endBlockRegex.test(currentLine)) {
      blocks[current] = {
        type: 'end',
      }
    }

    current += 1
  }

  return blocks
}

function isBlockTruthy (block) {
  if (block.type === 'begin') {
    if (eval(block.predicate)) {
      return true
    }
  }

  return false
}

function removeBlocks (sourceByLine, blocks) {
  let currentBlock
  let i = 0
  let action = false
  let sourceByLineTransformed = sourceByLine.slice()

  while (i < sourceByLine.length) {
    currentBlock = blocks[i]

    if (currentBlock && currentBlock.type === 'begin') {
      action = !isBlockTruthy(currentBlock)
      sourceByLineTransformed[i] = sourceByLineTransformed[i].replace(startBlockRegex, '')
      i += 1
      continue
    }

    if (currentBlock && currentBlock.type === 'end') {
      if (action) {
          sourceByLineTransformed[i] = null
      } else {
          sourceByLineTransformed[i] = sourceByLineTransformed[i].replace(endBlockRegex, '')
      }
      action = false
      i += 1
      continue
    }

    if (action) {
      sourceByLineTransformed[i] = null
    }

    i += 1
  }

  return sourceByLineTransformed
}

module.exports = function (source) {
  try {
    const sourceByLine = source.split(/\r\n|\n/)
    const blocks = searchBlocks(sourceByLine)
    if (blocks.length) {
      const transformedSource = removeBlocks(sourceByLine, blocks)
      return transformedSource.filter((v) => v !== null && v.trim()).join('\n')
    }
    return source
  } catch (error) {
    console.error(error)
    throw error
  }
}
