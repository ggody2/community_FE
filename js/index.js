import BoardItem from '../component/board/boardItem.js';
import Header from '../component/header/header.js';
import { authCheck, getServerUrl, prependChild } from '../utils/function.js';
import { getPosts,getSearch } from '../api/indexRequest.js';

const DEFAULT_PROFILE_IMAGE = '/public/image/profile/default.jpg';
const HTTP_NOT_AUTHORIZED = 401;
const SCROLL_THRESHOLD = 0.9;
const INITIAL_OFFSET = 0; 
const ITEMS_PER_LOAD = 6;

let offset = INITIAL_OFFSET;
let isEnd = false;
let isProcessing = false;
let currentSort = 'created_at DESC';

const handleSortChange = async () => {
    const sort = boardSortElement.value;
    currentSort = sort;
    try {
        console.log("sort : ", sort);
        const resultSort = await getPosts(0, ITEMS_PER_LOAD, sort);
        if (!resultSort.ok) {
            throw new Error('Fail to load to sort post!!');
        }
        const data = await resultSort.json();
        console.log("data  ??? ", data);
        const boardListElement = document.querySelector('.boardList');
        boardListElement.innerHTML = '';
        setBoardItem(data.data);

        // Reset scroll state
        offset = ITEMS_PER_LOAD;
        isEnd = false;
        isProcessing = false;
    } catch (error) {
        console.log("sort Error:", error);
    }
};

// 정렬선택
const boardSortElement = document.getElementById('boardSort');
boardSortElement.addEventListener('change', handleSortChange);

// getBoardItem 함수
const getBoardItem = async (offset = 0, limit = 6, sort = 'created_at DESC') => {
    const response = await getPosts(offset, limit, sort);
    if (!response.ok) {
        throw new Error('Failed to load post list.');
    }

    const data = await response.json();
    return data.data;
};

const setBoardItem = boardData => {
    const boardList = document.querySelector('.boardList');
    if (boardList && boardData) {
        console.log("boardData   ", boardData);
        const itemsHtml = boardData
            .map(data =>
                BoardItem(
                    data.post_id,
                    data.created_at,
                    data.post_title,
                    data.hits,
                    data.profileImagePath,
                    data.nickname,
                    data.comment_count,
                    data.like,
                ),
            )
            .join('');
        boardList.innerHTML += ` ${itemsHtml}`;
    }
};

// 스크롤 이벤트 추가
const addInfinityScrollEvent = () => {
    window.addEventListener('scroll', async () => {
        const hasScrolledToThreshold =
            window.scrollY + window.innerHeight >=
            document.documentElement.scrollHeight * SCROLL_THRESHOLD;
        if (hasScrolledToThreshold && !isProcessing && !isEnd) {
            isProcessing = true;

            try {
                const newItems = await getBoardItem(offset, ITEMS_PER_LOAD, currentSort);
                if (!newItems || newItems.length === 0) {
                    isEnd = true;
                } else {
                    offset += ITEMS_PER_LOAD;
                    setBoardItem(newItems);
                }
            } catch (error) {
                console.error('Error fetching new items:', error);
                isEnd = true;
            } finally {
                isProcessing = false;
            }
        }
    });
};

// 사용자 이름 설정
const setUserNameInGreeting = (userName) => {
    const greetingElement = document.querySelector('.write h2');
    greetingElement.innerHTML = `
        Welcome <br />
        <b class="userName">${userName}</b> 's community
    `;
};

// 검색
document.addEventListener("DOMContentLoaded", function() {
    const searchIcon = document.getElementById("search-icon");
    const searchInput = document.getElementById("search-input");
    const searchContainer = document.querySelector(".search-container");

    searchIcon.addEventListener("click", function() {
        searchContainer.classList.toggle("active");
        if (searchContainer.classList.contains("active")) {
            searchInput.focus();
        }
    });

    searchInput.addEventListener("blur", function() {
        if (searchInput.value === "") {
            searchContainer.classList.remove("active");
        }
    });

    searchInput.addEventListener("input", function() {
        console.log("입력 : ",searchInput.value);
    });

    searchInput.addEventListener ("keydown", async function(event) {
        if (event.key === "Enter") {
            console.log("엔터 : ",searchInput.value);
            try {
                const response = await getSearch(0, ITEMS_PER_LOAD, searchInput.value);
                if (!response.ok) {
                    throw new Error('Failed to load post list.');
                }

                const data = await response.json();
                console.log("결과 !!! ",data); 
                //setBoardItem(data.data);
            } catch (error) {
                console.error(error.message);
            }

            event.preventDefault();
        }
    });
});

const init = async () => {
    try {
        const data = await authCheck();
        const userName = data.data.nickname;
        const userEmail = data.data.email;
        setUserNameInGreeting(userName);
        sessionStorage.setItem('userName', userName);
        sessionStorage.setItem('userEmail', userEmail);
        
        if (data.status === HTTP_NOT_AUTHORIZED) {
            window.location.href = '/html/login.html';
            return;
        }

        const profileImagePath =
            data.data.profileImagePath ?? DEFAULT_PROFILE_IMAGE;
        const fullProfileImagePath = `${getServerUrl()}${profileImagePath}`;
        prependChild(
            document.body,
            Header('', 0, fullProfileImagePath),
        );

        const boardList = await getBoardItem(INITIAL_OFFSET, ITEMS_PER_LOAD, currentSort);
        setBoardItem(boardList);

        offset = INITIAL_OFFSET + ITEMS_PER_LOAD;

        addInfinityScrollEvent();
    } catch (error) {
        console.error('Initialization failed:', error);
    }
};

init();