const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const dataPanel = document.querySelector("#data-panel");
const USERS_PER_PAGE = 20
const users = [];
let filteredUsers = []

const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

//  renderFriendsList朋友清單建立
function renderFriendsList(users) {
  let rawHTML = "";
  users.forEach((user) => {
    rawHTML += `
    <div class="col-sm-3">
      <div class="card mb-2">
        <img src="${user.avatar}" class="card-img-top" alt="Friend Poster" />
        <div class="card-body p-3">
        <h6 class="card-title">${user.name} ${user.surname}</h6>
        <button class="btn btn-primary btn-sm btn-show-friendModal" data-toggle="modal" data-target="#friend-modal" data-id="${user.id}">Info</button>
        <button class="btn btn-danger btn-sm btn-add-favorite" data-id="${user.id}" >+</button>
        </div>
     </div>
  </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
}

// showUserModal 使用者彈出介紹
function showUserModal(id) {
  const modalName = document.querySelector("#modal-name");
  const modalImg = document.querySelector("#modal-avatar");
  const modalInfo = document.querySelector("#modal-info");
  axios.get(INDEX_URL + id).then((response) => {
    const modalUser = response.data;
    console.log(modalUser);
    modalImg.src = modalUser.avatar;
    modalName.innerHTML = modalUser.name + "  " + modalUser.surname;
    modalInfo.innerHTML = `
    Age : ${modalUser.age} <br>
    Gender : ${modalUser.gender} <br>
    Birthday : ${modalUser.birthday} <br>
    Region : ${modalUser.region} <br>
    Email : ${modalUser.email}
    `;
  });
}

// 滑鼠點選功能
dataPanel.addEventListener("click", function onPanelClicked(event) {
  // 1. Modal - 抓出該User的ID 執行 showUserModal
  // 4. favorite User
  if (event.target.matches(".btn-show-friendModal")) {
    showUserModal(event.target.dataset.id);
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
});
// 2. Search Form  
searchForm.addEventListener('submit', function onSearchFormSubmittied(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredUsers = users.filter((user) => (user.name + " " + user.surname).toLowerCase().includes(keyword))
  if (filteredUsers.length === 0) {
    return alert(`Cannot find movies with keyword: ${keyword}`)
  }
  renderPaginator(filteredUsers.length)
  renderFriendsList(getUsersByPage(1))
})
// 3. paginator 點選分頁
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderFriendsList(getUsersByPage(page))

})

// 製作分頁
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

// 製作分頁後的資料
function getUsersByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users
  const startIndex = (page - 1) * USERS_PER_PAGE
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

// 加入最愛，儲存至local storage
function addToFavorite(id) {

  const list = JSON.parse(localStorage.getItem('favoriteUser')) || []
  const user = users.find((user) => user.id === id)

  if (list.some((user) => user.id === id)) {
    return alert('此使用者已在收藏清單中')
  }

  list.push(user)
  localStorage.setItem('favoriteUser', JSON.stringify(list))
}

// axios 資料匯入users
axios.get(INDEX_URL).then((response) => {
  users.push(...response.data.results);
  renderPaginator(users.length)
  renderFriendsList(getUsersByPage(1));
});


