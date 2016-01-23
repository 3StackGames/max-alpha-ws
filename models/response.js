module.exports = function(data, errors, meta) {
    if(data) this.data = data
    else if (errors) {
        if(errors.constructor === Array) {
            this.errors = errors
        } else {
            this.errors = [errors]
        }
    }
    if(meta) this.meta = meta
}