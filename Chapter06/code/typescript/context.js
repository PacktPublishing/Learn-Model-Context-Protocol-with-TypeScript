function* usingGroup() {
   console.group()
   console.log('starting a group')
   try {
     yield
   } finally {
    console.log('ending a group')
     console.groupEnd()
   }
}

for(const _ of usingGroup()) {
   console.log('inside a group')
}

// run a ts file with `ts-node`