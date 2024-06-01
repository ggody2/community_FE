import { deleteCookie, getCookie, getServerUrl } from '../../utils/function.js';

const DEFAULT_PROFILE_IMAGE = '/public/image/profile/default.jpg';

const updateTime = () => {
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}`;
    }
};
// title : 헤더 타이틀
// leftBtn: 헤더 좌측 기능. 0 : None , 1: back , 2 : index
// rightBtn : 헤더 우측 기능. image 주소값 들어옴
const Header = (
    title,
    leftBtn = 0,
    profileImage = `${getServerUrl()}${DEFAULT_PROFILE_IMAGE}`,
) => {
    let leftBtnElement;
    let headerElement;
    let h1Element;

    if (leftBtn == 1 || leftBtn == 2) {
        leftBtnElement = document.createElement('img');
        leftBtnElement.classList.add('back');
        leftBtnElement.src = '/public/navigate_before.svg';
        if (leftBtn == 1) {
            leftBtnElement.addEventListener('click', () => history.back());
        } else {
            leftBtnElement.addEventListener(
                'click',
                () => (location.href = '/'),
            );
        }
    }

    const profileInfo = document.createElement('div');
    profileInfo.classList.add('profile-info');

    const profileElement = document.createElement('img');
    profileElement.classList.add('profile-img');
    profileElement.loading = 'eager';
    profileElement.src = profileImage;

    const userName = document.createElement('h1');
    userName.textContent = sessionStorage.getItem('userName');

    const userEmail = document.createElement('p');
    userEmail.textContent = sessionStorage.getItem('userEmail');

    profileInfo.appendChild(profileElement);
    profileInfo.appendChild(userName);
    profileInfo.appendChild(userEmail);

    const profileNav = document.createElement('nav');
    profileNav.classList.add('profile-nav');

    const modifyInfoLink = document.createElement('a');
    const modifyPasswordLink = document.createElement('a');
    const logoutLink = document.createElement('a');
    const chatRoomManager = document.createElement('a');

    modifyInfoLink.textContent = '회원정보수정';
    modifyPasswordLink.textContent = '비밀번호수정';
    logoutLink.textContent = '로그아웃';
    chatRoomManager.textContent = '채팅방';

    modifyInfoLink.href = '/html/modifyInfo.html';
    modifyPasswordLink.href = '/html/modifyPassword.html';
    logoutLink.addEventListener('click', () => {
        deleteCookie('session');
        deleteCookie('userId');
        sessionStorage.removeItem('userName'); 
        sessionStorage.removeItem('userEmail'); 
        location.href = '/html/login.html';
    });
    chatRoomManager.href = '/html/manage-ChatRoom.html';

    profileNav.appendChild(modifyInfoLink);
    profileNav.appendChild(modifyPasswordLink);
    profileNav.appendChild(logoutLink);
    profileNav.appendChild(chatRoomManager);

    h1Element = document.createElement('h1');
    h1Element.textContent = title;

    // 시간
    const timeElement = document.createElement('div');
    timeElement.id = 'current-time';
    timeElement.classList.add('current-time');
    timeElement.textContent = '00:00'; // Initial time

    // 날씨
    const weatherElement = document.createElement('div');
    const apiKey = '761f96e26b32f8e35754f96e2dd34ac5';
        const lat = 35.84603035519296;
        const lon = 127.13445961475372;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log("날씨 데이터 ?? ",data);
                
                weatherElement.id = 'weather';
                weatherElement.classList.add('weather');

                const weatherInfo = `
                    <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">
                    <p>${(data.main.temp - 273.15).toFixed(2)} °C</p>
                `;
                weatherElement.innerHTML = weatherInfo;
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });

    headerElement = document.createElement('header');

    if (leftBtnElement) headerElement.appendChild(leftBtnElement);
    headerElement.appendChild(h1Element);
    headerElement.appendChild(profileInfo);
    headerElement.appendChild(timeElement);
    headerElement.appendChild(weatherElement);
    headerElement.appendChild(profileNav);
    
    setInterval(updateTime, 1000);

    return headerElement;
};

export default Header;
