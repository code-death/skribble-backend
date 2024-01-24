import responseStatus from '../common/constants/responseStatus.json';

export function setSuccess(res, data) {
    res.status(responseStatus.STATUS_SUCCESS_OK);
    res.json({ status: 'Success', data });
}
export function setServerError(res, data) {
    res.status(responseStatus.INTERNAL_SERVER_ERROR);
    res.json({ status: 'Error', data });
}
