// ===== 글쓰기 / 수정 기능 =====

// URL 파라미터에서 수정할 글 ID 확인
const params = new URLSearchParams(window.location.search);
const editId = params.get('id');

let currentUser = null;
let existingImageUrl = null; // 수정 시 기존 이미지 URL 보관
let removeExistingImage = false; // 수정 시 기존 이미지 제거 여부

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

  // 기존 이미지 미리보기 (제거 버튼 포함)
  if (post.image_url) {
    existingImageUrl = post.image_url;
    showPreview(post.image_url, true);
  }
}

// ===== 미리보기 렌더링 =====
function showPreview(src, isExisting = false) {
  const preview = document.getElementById('imagePreview');
  preview.innerHTML = `
    <div class="preview-wrap">
      <img src="${src}" alt="미리보기">
      <button type="button" class="btn-remove-image" aria-label="이미지 제거">✕</button>
    </div>
  `;

  preview.querySelector('.btn-remove-image').addEventListener('click', () => {
    preview.innerHTML = '';
    if (isExisting) {
      // 기존 이미지 제거 표시
      removeExistingImage = true;
    } else {
      // 새로 선택한 파일 취소
      document.getElementById('postImage').value = '';
    }
  });
}

// ===== 이미지 파일 유효성 검사 =====
function validateImage(file) {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    alert('JPG, PNG, GIF, WEBP 형식만 업로드 가능합니다.');
    return false;
  }
  if (file.size > MAX_SIZE) {
    alert('파일 크기는 5MB 이하만 가능합니다.');
    return false;
  }
  return true;
}

// ===== 이미지 미리보기 =====
document.getElementById('postImage').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!validateImage(file)) {
    e.target.value = '';
    return;
  }

  // 새 이미지 선택 시 기존 이미지 제거 상태 초기화
  removeExistingImage = false;

  const reader = new FileReader();
  reader.onload = (ev) => showPreview(ev.target.result, false);
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
    // 수정: 기존 이미지 교체 또는 제거 시 Storage에서 삭제
    if ((imageUrl || removeExistingImage) && existingImageUrl) {
      const oldFileName = existingImageUrl.split('/').pop();
      await supabaseClient.storage.from('post-images').remove([oldFileName]);
    }

    const updateData = { title, content };
    if (imageUrl) {
      updateData.image_url = imageUrl;
    } else if (removeExistingImage) {
      updateData.image_url = null;
    }

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
