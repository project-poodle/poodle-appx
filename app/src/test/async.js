
const func = (input, callback) => {
  // console.log(input)
  setTimeout(() => {
    if (input % 2 === 0) {
      callback(null, input)
    } else {
      callback('not divisible by 2!', null)
    }
  }, 1000)
}

const promiseFunc = async (input) => {
  return new Promise((resolve, reject) => {
    func(input, (err, result) => {
      if (!!err) {
        reject(err)
      } else {
        resolve (input)
      }
    })
  })
}

async function test(variable) {
  const result = await promiseFunc(variable)
  console.log(`result`, result)
}

test(2)

test(3)

test(4)
