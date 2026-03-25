// ===== 로그인 상태 관리 =====
// 페이지 로드 시 로그인 여부 확인 후 헤더 UI 업데이트

// 스크립트가 body 하단에 위치하므로 DOM이 이미 준비된 상태 — 바로 실행
updateAuthUI();

// 현재 로그인 상태에 따라 헤더 프로필 버튼 동작 변경
async function updateAuthUI() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  const profileBtn = document.querySelector('.icon-btn[aria-label="프로필"]');

  if (!profileBtn) return;

  if (user) {
    // 로그인 상태: 아이콘을 로그아웃 아이콘으로 교체
    profileBtn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>`;
    profileBtn.setAttribute('aria-label', '로그아웃');
    profileBtn.title = `${user.email} (로그아웃)`;
    profileBtn.addEventListener('click', handleLogout);
  } else {
    // 비로그인 상태: 클릭 시 로그인 페이지로 이동
    profileBtn.title = '로그인';
    profileBtn.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }
}

// 로그아웃 처리
async function handleLogout() {
  const { error } = await supabaseClient.auth.signOut();
  if (!error) {
    alert('로그아웃 되었습니다.');
    window.location.reload();
  }
}
