import Header from '../component/header/header.js';
import {
    authCheckReverse,
    prependChild,
    setCookie,
    validEmail,
} from '../utils/function.js';
import { userLogin } from '../api/loginRequest.js';

const HTTP_OK = 200;
const MAX_PASSWORD_LENGTH = 8;

const loginData = {
    id: '',
    password: '',
};

const updateHelperText = (helperTextElement, message = '') => {
    helperTextElement.textContent = message;
};

const loginClick = async () => {
    console.log("login click!!");
    const { id: email, password } = loginData;
    const helperTextElement = document.querySelector('.helperText');

    const response = await userLogin(email, password);
    if (!response.ok) {
        updateHelperText(
            helperTextElement,
            '*입력하신 계정 정보가 정확하지 않았습니다.',
        );
        return;
    }

    const result = await response.json();
    if (result.status !== HTTP_OK) {
        updateHelperText(
            helperTextElement,
            '*입력하신 계정 정보가 정확하지 않았습니다.',
        );
        return;
    }
    updateHelperText(helperTextElement);

    setCookie('session', result.data.sessionId, 14);
    setCookie('userId', result.data.userId, 14);
    console.log("setCookie ",result.data.sessionId,result.data.userId);
    location.href = '/html/index.html';
};

const observeSignupData = () => {
    console.log("observeSignupData");
    const { id: email, password } = loginData;
    const button = document.querySelector('#login');
    const helperTextElement = document.querySelector('.helperText');

    const isValidEmail = validEmail(email);
    updateHelperText(
        helperTextElement,
        isValidEmail || !email
            ? ''
            : '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)',
    );

    button.disabled = !(
        email &&
        isValidEmail &&
        password &&
        password.length >= MAX_PASSWORD_LENGTH
    );
    button.style.backgroundColor = button.disabled ? '#727272c9' : '#3A3A3A';
};

const eventSet = () => {
    console.log("eventSet");
    document.getElementById('login').addEventListener('click', loginClick);

    document.addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            loginClick();
            console.log("enter");
        }
    });

    ['id', 'pw'].forEach(field => {
        const inputElement = document.getElementById(field);
        inputElement.addEventListener('input', event =>
            onChangeHandler(event, field === 'id' ? 'id' : 'password'),
        );
    });

    document
        .getElementById('id')
        .addEventListener('input', event => validateEmail(event.target));

    document.getElementById('google-login-btn').addEventListener('click', () => {
        window.location.href = 'http://localhost:8080/login';
    });
};

const onChangeHandler = (event, uid) => {
    loginData[uid] = event.target.value;
    observeSignupData();
};

const validateEmail = input => {
    const regex = /^[A-Za-z0-9@.]+$/;
    if (!regex.test(input.value)) input.value = input.value.slice(0, -1);
};

const init = async () => {
    await authCheckReverse(); 
    observeSignupData();
    prependChild(document.body, Header('커뮤니티', 0));
    eventSet();
    localStorage.clear();
    document.cookie = '';
};

init();