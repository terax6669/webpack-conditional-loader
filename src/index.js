/* eslint-disable no-eval */
const dotenvParseVariables = require('dotenv-parse-variables');
const startBlockRegex = /(<!--|\/\/) #if ([\s\S]*?)(-->)?$/
const elseBlockRegex = /(<!--|\/\/) #else[\s\S]*?(-->)?$/
const endBlockRegex = /(<!--|\/\/) #endif[\s\S]*?(-->)?$/

function getPredicate(line) {
	return startBlockRegex.exec(line)[2]
}

function searchBlocks(sourceByLine) {
	const blocks = []
//	let lastBlock = null
	let current = 0

	while (current < sourceByLine.length) {
		const currentLine = sourceByLine[current]
		if (startBlockRegex.test(currentLine)) {
			blocks[current] = {
				type: 'if',
				predicate: getPredicate(currentLine),
			}
		} else if (elseBlockRegex.test(currentLine)) {
			blocks[current] = {
				type: 'else',
			}
		} else if (endBlockRegex.test(currentLine)) {
			blocks[current] = {
				type: 'endif',
			}
		}

//		lastBlock = blocks[current] ? blocks[current]['type'] : null
		current += 1
	}

	return blocks
}

function isBlockTruthy(block) {
	return block.type === 'if' && eval(block.predicate) === true
}

function removeBlocks(sourceByLine, blocks) {
	let currentBlock
	let i = 0
	let action = false
	let sourceByLineTransformed = sourceByLine.slice()

	while (i < sourceByLine.length) {
		currentBlock = blocks[i]

		if (currentBlock) {
			if (currentBlock.type === 'if') {
				action = !isBlockTruthy(currentBlock)
				sourceByLineTransformed[i] = sourceByLineTransformed[i].replace(startBlockRegex, '')
				i += 1
				continue
			}

			if (currentBlock.type === 'else') {
				action = !action
				if (action) {
					sourceByLineTransformed[i] = null
				} else {
					sourceByLineTransformed[i] = sourceByLineTransformed[i].replace(elseBlockRegex, '')
				}
				i += 1
				continue
			}

			if (currentBlock.type === 'endif') {
				if (action) {
					sourceByLineTransformed[i] = null
				} else {
					sourceByLineTransformed[i] = sourceByLineTransformed[i].replace(endBlockRegex, '')
				}
				action = false
				i += 1
				continue
			}
		}

		if (action) {
			sourceByLineTransformed[i] = null
		}

		i += 1
	}

	return sourceByLineTransformed
}

module.exports = function (source) {
	process.env = dotenvParseVariables(process.env)
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
