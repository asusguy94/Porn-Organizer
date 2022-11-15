const fetcher = (input: RequestInfo | URL, init?: RequestInit) => fetch(input, init).then(res => res.json()!)

export default fetcher
