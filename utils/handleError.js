module.exports = async function (asyncFn, generateLogs) {
    try {
        await asyncFn();
    } catch (e) {
        if (generateLogs) {
            console.error(e);
        }
    }
}