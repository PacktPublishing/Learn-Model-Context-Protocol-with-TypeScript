async function consumeStream() {
    const response = await fetch('http://localhost:8000/stream');

    const reader = response.body?.getReader();

    while (true) {
        // const { done, value } = await reader?.read();
        const res = await reader?.read();
        if (res?.done) break;
        console.log(new TextDecoder().decode(res?.value));
    }
}
consumeStream().catch(console.error);