// ===== 게시판 목록 기능 =====

const POSTS_PER_PAGE = 10;
let currentPage = 1;
let totalCount = 0;
let searchKeyword = '';

// 페이지 로드 시 실행
loadPosts();

// ===== 게시글 목록 조회 =====
async function loadPosts() {
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  let query = supabaseClient
    .from('posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  // 검색어가 있으면 제목 필터 적용
  if (searchKeyword) {
    query = query.ilike('title', `%${searchKeyword}%`);
  }

  const { data: posts, count, error } = await query;

  if (error) {
    console.error('글 목록 불러오기 실패:', error.message);
    return;
  }

  totalCount = count;
  renderPosts(posts);
  renderPagination();
  updateTotalCount();
}

// ===== 목록 렌더링 =====
function renderPosts(posts) {
  const tbody = document.querySelector('.board-table tbody');
  if (!tbody) return;

  if (posts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding: 40px; color:#aaa;">
          아직 작성된 글이 없습니다.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = posts.map((post, index) => {
    // 전체 번호 계산 (최신글이 높은 번호)
    const num = totalCount - ((currentPage - 1) * POSTS_PER_PAGE) - index;
    const date = new Date(post.created_at).toLocaleDateString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).replace(/\. /g, '.').replace('.', '');

    return `
      <tr>
        <td class="col-num">${num}</td>
        <td class="col-title"><a href="post.html?id=${post.id}">${escapeHtml(post.title)}</a></td>
        <td class="col-author">${escapeHtml(post.author_name)}</td>
        <td class="col-date">${date}</td>
        <td class="col-views">${post.views}</td>
        <td class="col-likes">${post.likes}</td>
      </tr>`;
  }).join('');
}

// ===== 전체 글 수 업데이트 =====
function updateTotalCount() {
  const el = document.querySelector('.board-total strong');
  if (el) el.textContent = totalCount;
}

// ===== 페이지네이션 렌더링 =====
function renderPagination() {
  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);
  const pageInfo = document.querySelector('.page-info');
  const prevBtn = document.querySelector('.page-prev');
  const nextBtn = document.querySelector('.page-next');

  if (pageInfo) pageInfo.textContent = `${currentPage} / ${totalPages || 1} 페이지`;
  if (prevBtn) prevBtn.disabled = currentPage <= 1;
  if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
}

// 이전/다음 버튼 이벤트
document.querySelector('.page-prev')?.addEventListener('click', () => {
  if (currentPage > 1) { currentPage--; loadPosts(); }
});
document.querySelector('.page-next')?.addEventListener('click', () => {
  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);
  if (currentPage < totalPages) { currentPage++; loadPosts(); }
});

// ===== 검색 폼 =====
document.getElementById('searchForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  searchKeyword = document.getElementById('searchInput').value.trim();
  currentPage = 1;
  loadPosts();
});

// ===== 글쓰기 버튼: 로그인 확인 =====
document.querySelector('.btn-write')?.addEventListener('click', async (e) => {
  e.preventDefault();
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    alert('로그인이 필요합니다.');
    window.location.href = 'login.html';
  } else {
    window.location.href = 'write.html';
  }
});

// ===== XSS 방지 =====
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
