function execQueue(arr, maxQueue) {
    return new Promise(async (resolve) => {
        const queue = [];
        let activeCount = 0;

        const processQueue = async () => {
            if(queue.length === 0){
                resolve();
                return;
            }
            if (activeCount >= maxQueue) {
                return;
            }

            const task = queue.shift();
            activeCount++;

            try {
                await task();
            } catch (error) {
                console.error('任务执行失败:', error);
            } finally {
                activeCount--;
                processQueue();
            }
        };

        arr.forEach(task => {
            queue.push(task);
            processQueue();
        });
    })
}

module.exports = {
    execQueue
}

