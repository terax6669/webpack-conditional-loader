let a = 1

// #if process.env.FEATURE_FLAG
a = 2
// #endif

module.exports = a
