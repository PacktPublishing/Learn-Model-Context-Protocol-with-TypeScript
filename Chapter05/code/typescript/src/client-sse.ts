import { EventSource } from 'eventsource';

const es = new EventSource('http://localhost:8000/sse');

es.addEventListener('notice', (event) => {
  console.log(event.data)
})

es.addEventListener('update', (event) => {
  console.log(event.data)
})

es.addEventListener('message', (event) => {
  console.log(event.data)
})

setTimeout(() => {
  es.close()
}, 10_000)
