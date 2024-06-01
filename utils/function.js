import Dialog from '../component/dialog/dialog.js';

export const getServerUrl = () => {
    const host = window.location.hostname;
    return host.includes('localhost')
        ? 'http://localhost:8080'
        : 'https://node-community-api.startupcode.kr:443';
};

export const setCookie = (cookie_name, value, days) => {
    const exdate = new Date();
    exdate.setDate(exdate.getDate() + days);
    // 설정 일수만큼 현재시간에 만료값으로 지정

    const cookie_value =
        escape(value) +
        (days == null ? '' : `; expires=${exdate.toUTCString()}`);
    document.cookie = `${cookie_name}=${cookie_value}`;
};

export const getCookie = cookie_name => {
    let x;
    let y;
    const val = document.cookie.split(';');

    for (let i = 0; i < val.length; i++) {
        x = val[i].substr(0, val[i].indexOf('='));
        y = val[i].substr(val[i].indexOf('=') + 1);
        x = x.replace(/^\s+|\s+$/g, ''); // 앞과 뒤의 공백 제거하기
        if (x == cookie_name) {
            return unescape(y); // unescape로 디코딩 후 값 리턴
        }
    }
};

export const deleteCookie = cookie_name => {
    setCookie(cookie_name, '', -1);
};

// 사용자 정보
export const serverSessionCheck = async () => {
    const res = await fetch(`${getServerUrl()}/users/auth/check`, {
        method: 'GET',
        headers: {
            session: getCookie('session'),
            userId: getCookie('userId'),
        },
    });
    const data = await res.json();
    console.log("serverSessionCheck !!! ",data);
    return data;
};

export const authCheck = async () => {
    const HTTP_OK = 200;
    const session = getCookie('session');
    if (session === undefined) {
        Dialog('로그인이 필요합니다.', '로그인 페이지로 이동합니다.');
        location.href = '/html/login.html';
    }

    const data = await serverSessionCheck();

    if (!data || data.status !== HTTP_OK) {
        deleteCookie('session');
        deleteCookie('userId');
        Dialog('로그인이 필요합니다.', '로그인 페이지로 이동합니다.');
        location.href = '/html/login.html';
    }
    return data;
};

//로그인 확인
export const authCheckReverse = async () => {
    const session = getCookie('session');
    console.log("authCheckReverse session  ",session);
    if (session) {  // 세션있으면 페이지이동
        const data = await serverSessionCheck();
        if (data) {
            location.href = '/';
        }
    }
};
// 이메일 유효성 검사
export const validEmail = email => {
    const REGEX =
        /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
    return REGEX.test(email);
};

export const validPassword = password => {
    const REGEX =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    return REGEX.test(password);
};

export const validNickname = nickname => {
    const REGEX = /^[가-힣a-zA-Z0-9]{2,10}$/;
    return REGEX.test(nickname);
};

export const prependChild = (parent, child) => {
    parent.insertBefore(child, parent.firstChild);
};

/**
 *
 * @param {File} file  이미지 파일
 * @param {boolean} isHigh? : true면 origin, false면  1/4 사이즈
 * @returns
 */
export const fileToBase64 = (file, isHigh) => {
    return new Promise((resolve, reject) => {
        const size = isHigh ? 1 : 4;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = e => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const width = img.width / size;
                const height = img.height / size;
                const elem = document.createElement('canvas');
                elem.width = width;
                elem.height = height;
                const ctx = elem.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(ctx.canvas.toDataURL());
            };
            img.onerror = e => {
                reject(e);
            };
        };
        reader.onerror = e => {
            reject(e);
        };
    });
};

/**
 *
 * @param {string} param
 * @returns
 */
export const getQueryString = param => {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
};

export const padTo2Digits = number => {
    return number.toString().padStart(2, '0');
};