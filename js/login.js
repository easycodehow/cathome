// ===== 로그인 페이지 기능 =====

// 이미 로그인된 상태면 메인으로 이동
supabaseClient.auth.getUser().then(({ data: { user } }) => {
  if (user) window.location.href = 'index.html';
});

// ===== 탭 전환 =====
const tabLogin  = document.getElementById('tabLogin');
const tabSignup = document.getElementById('tabSignup');
const formLogin  = document.getElementById('formLogin');
const formSignup = document.getElementById('formSignup');

tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabSignup.classList.remove('active');
  formLogin.classList.remove('hidden');
  formSignup.classList.add('hidden');
  clearMsg();
});

tabSignup.addEventListener('click', () => {
  tabSignup.classList.add('active');
  tabLogin.classList.remove('active');
  formSignup.classList.remove('hidden');
  formLogin.classList.add('hidden');
  clearMsg();
});

// ===== 메시지 출력 =====
function showMsg(text, isError = false) {
  const el = document.getElementById('loginMsg');
  el.textContent = text;
  el.className = 'login-msg ' + (isError ? 'error' : 'success');
}

function clearMsg() {
  const el = document.getElementById('loginMsg');
  el.textContent = '';
  el.className = 'login-msg';
}

// ===== 로그인 처리 =====
formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    showMsg('이메일 또는 비밀번호가 올바르지 않습니다.', true);
  } else {
    showMsg('로그인 성공! 잠시 후 이동합니다.');
    setTimeout(() => { window.location.href = 'index.html'; }, 1000);
  }
});

// ===== 회원가입 처리 =====
formSignup.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email    = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const nickname = document.getElementById('signupNickname').value.trim();

  const { error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { nickname } }
  });

  if (error) {
    showMsg('회원가입 실패: ' + error.message, true);
  } else {
    showMsg('회원가입 완료! 이메일 인증 후 로그인해주세요.');
    formSignup.reset();
  }
});
