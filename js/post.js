// ===== 게시글 상세 기능 =====

const params = new URLSearchParams(window.location.search);
const postId = params.get('id');

if (!postId) window.location.href = 'board.html';

let currentPost = null;

// 초기화
loadPost();

// ===== 게시글 불러오기 =====
async function loadPost() {
  const { data: post, error } = await supabaseClient
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (error || !post) {
    document.getElementById('postArticle').innerHTML =
      '<p style="color:#aaa; text-align:center; padding:40px;">게시글을 찾을 수 없습니다.</p>';
    return;
  }

  currentPost = post;
  renderPost(post);
  checkOwner(post);

  // 조회수 증가
  await supabaseClient
    .from('posts')
    .update({ views: post.views + 1 })
    .eq('id', postId);
}

// ===== 게시글 렌더링 =====
function renderPost(post) {
  const date = new Date(post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  document.title = `${post.title} - CatHome`;

  document.getElementById('postArticle').innerHTML = `
    <div class="post-header">
      <h1 class="post-title">${escapeHtml(post.title)}</h1>
      <div class="post-meta">
        <span class="post-author">${escapeHtml(post.author_name)}</span>
        <span class="post-date">${date}</span>
        <span class="post-views">조회 ${post.views}</span>
        <span class="post-likes">좋아요 ${post.likes}</span>
      </div>
    </div>
    <div class="post-divider"></div>
    ${post.image_url ? `<div class="post-image"><img src="${post.image_url}" alt="첨부 이미지"></div>` : ''}
    <div class="post-content">${escapeHtml(post.content).replace(/\n/g, '<br>')}</div>
  `;
}

// ===== 본인 글 확인 → 수정/삭제 버튼 표시 =====
async function checkOwner(post) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (user && user.id === post.user_id) {
    const actions = document.getElementById('postActions');
    actions.style.display = 'flex';
    document.getElementById('btnEdit').href = `write.html?id=${post.id}`;
  }
}

// ===== 삭제 =====
document.getElementById('btnDelete')?.addEventListener('click', async () => {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  // 이미지 삭제
  if (currentPost.image_url) {
    const fileName = currentPost.image_url.split('/').pop();
    await supabaseClient.storage.from('post-images').remove([fileName]);
  }

  const { error } = await supabaseClient
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) {
    alert('삭제 실패: ' + error.message);
  } else {
    alert('삭제되었습니다.');
    window.location.href = 'board.html';
  }
});

// ===== XSS 방지 =====
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
