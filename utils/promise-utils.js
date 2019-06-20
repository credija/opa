export default {
    promiseTimeout(ms, promise) {
        let timeout = new Promise((resolve, reject) => {
            let id = setTimeout(() => {
                clearTimeout(id);
                resolve([]);
            }, ms)
        })
    
        return Promise.race([
            promise,
            timeout
        ])
    }
}