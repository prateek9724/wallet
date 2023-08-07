module.exports.parseInteger = (val) => {
    return parseInt(val, 10);
}

module.exports.formatBool = (value) => {
    return !!value && ((typeof value === "boolean" && value) || (typeof value === "string" && ['y', 'true', '1'].includes(value.toLowerCase())))
}

module.exports.MONGO_SERVER_ERROR = 'MongoServerError';
module.exports.MONGO_DOCUMENT_VALIDATION_FAILURE = 'DocumentValidationFailure';
module.exports.MONGO_DOCUMENT_VALIDATION_FAILURE_CODE = 121;