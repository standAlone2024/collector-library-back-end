export const IS_SERVICE             = false;
export const enum LOG_LEVEL {
    LOG, WARNING, ERROR
}
export enum SERVER_MODE {
    DEBUG = 'debug',
    PRODUCTION = 'production',
    REVIEW = 'review',
}
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'empty';
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'empty';
export const BAD_REQUEST = '잘못된 리퀘스트 파라미터 요청 입니다.';
export const ER_DUP_ENTRY = 1062; // key가 유니크인데 중복 insert를 시도한 경우
export const INTERNAL_SERVER_ERROR = '서버 에러: 시스템 장애가 발생하여 서비스를 이용할 수 없습니다. 상담톡을 통해 관리자에게 문의 주세요.';
export const enum ROLE {
    ADMIN = 1, 
    USER
}
export const IS_LOCALHOST = true;