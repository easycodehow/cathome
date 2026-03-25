// ===== 글쓰기 / 수정 기능 =====

// URL 파라미터에서 수정할 글 ID 확인
const params = new URLSearchParams(window.location.search);
const editId = params.get('id');

let currentUser = null;

// 초기화
init();

async function init() {
  // 로그인 확인
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    alert('로그인이 필요합니다.');
    window.location.href = 'login.html';
    return;
  }
  currentUser = user;

  // 수정 모드면 기존 내용 불러오기
  if (editId) {
    document.getElementById('pageTitle').textContent = '글 수정';
    document.getElementById('submitBtn').textContent = '수정';
    await loadPost();
  }
}

// ===== 수정 시 기존 글 불러오기 =====
async function loadPost() {
  const { data: post, error } = await supabaseClient
    .from('posts')
    .select('*')
    .eq('id', editId)
    .single();

  if (error || !post) {
    alert('글을 불러올 수 없습니다.');
    window.location.href = 'board.html';
    return;
  }

  // 본인 글인지 확인
  if (post.user_id !== currentUser.id) {
    alert('수정 권한이 없습니다.');
    window.location.href = 'board.html';
    return;
  }

  document.getElementById('postTitle').value = post.title;
  document.getElementById('postContent').value = post.content;

  // 기존 이미지 미리보기
  if (post.image_url) {
    document.getElementById('imagePreview').innerHTML =
      `<img src="${post.image_url}" alt="첨부 이미지">`;
  }
}

// ===== 이미지 미리보기 =====
document.getElementById('postImage').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('imagePreview').innerHTML =
      `<img src="${e.target.result}" alt="미리보기">`;
  };
  reader.readAsDataURL(file);
});

// ===== 폼 제출 =====
document.getElementById('writeForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title   = document.getElementById('postTitle').value.trim();
  const content = document.getElementById('postContent').value.trim();
  const file    = document.getElementById('postImage').files[0];
  const submitBtn = document.getElementById('submitBtn');

  submitBtn.disabled = true;
  submitBtn.textContent = '처리 중...';

  // 이미지 업로드
  let imageUrl = null;
  if (file) {
    const ext = file.name.split('.').pop();
    const fileName = `${currentUser.id}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabaseClient.storage
      .from('post-images')
      .upload(fileName, file);

    if (uploadError) {
      alert('이미지 업로드 실패: ' + uploadError.message);
      submitBtn.disabled = false;
      submitBtn.textContent = editId ? '수정' : '등록';
      return;
    }

    const { data } = supabaseClient.storage
      .from('post-images')
      .getPublicUrl(fileName);
    imageUrl = data.publicUrl;
  }

  if (editId) {
    // 수정
    const updateData = { title, content };
    if (imageUrl) updateData.image_url = imageUrl;

    const { error } = await supabaseClient
      .from('posts')
      .update(updateData)
      .eq('id', editId);

    if (error) {
      alert('수정 실패: ' + error.message);
    } else {
      window.location.href = `post.html?id=${editId}`;
    }
  } else {
    // 작성
    const nickname = currentUser.user_metadata?.nickname || currentUser.email.split('@')[0];

    const { data: post, error } = await supabaseClient
      .from('posts')
      .insert({
        title,
        content,
        author_name: nickname,
        image_url: imageUrl,
        user_id: currentUser.id
      })
      .select()
      .single();

    if (error) {
      alert('글 작성 실패: ' + error.message);
    } else {
      window.location.href = `post.html?id=${post.id}`;
    }
  }

  submitBtn.disabled = false;
});
