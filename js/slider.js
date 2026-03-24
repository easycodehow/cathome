// ===== 히어로 슬라이더 =====

(function () {
  // 요소 참조
  const track = document.getElementById('slideTrack');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  const currentNumEl = document.getElementById('slideCurrentNum');
  const totalNumEl = document.getElementById('slideTotalNum');

  // 슬라이드 총 개수
  const slides = track.querySelectorAll('.slide-item');
  const total = slides.length;
  let current = 0;         // 현재 인덱스 (0부터 시작)
  let autoTimer = null;    // 자동 슬라이드 타이머
  let touchStartX = 0;     // 터치 시작 X좌표

  // 총 개수 표시
  totalNumEl.textContent = total;

  // 지정 인덱스로 이동
  function goToSlide(index) {
    // 순환 처리
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;

    current = index;
    track.style.transform = `translateX(-${current * 100}%)`;
    currentNumEl.textContent = current + 1;
  }

  // 이전 슬라이드
  function prevSlide() {
    goToSlide(current - 1);
  }

  // 다음 슬라이드
  function nextSlide() {
    goToSlide(current + 1);
  }

  // 자동 슬라이드 시작 (4초 간격)
  function startAuto() {
    autoTimer = setInterval(nextSlide, 4000);
  }

  // 자동 슬라이드 중지 (사용자 조작 시 일시정지)
  function stopAuto() {
    clearInterval(autoTimer);
  }

  // 버튼 클릭 이벤트
  prevBtn.addEventListener('click', () => {
    stopAuto();
    prevSlide();
    startAuto(); // 조작 후 다시 시작
  });

  nextBtn.addEventListener('click', () => {
    stopAuto();
    nextSlide();
    startAuto();
  });

  // 터치 스와이프 (모바일)
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    // 30px 이상 스와이프 시 슬라이드 전환
    if (Math.abs(diff) > 30) {
      stopAuto();
      if (diff > 0) {
        nextSlide(); // 왼쪽으로 스와이프 → 다음
      } else {
        prevSlide(); // 오른쪽으로 스와이프 → 이전
      }
      startAuto();
    }
  }, { passive: true });

  // 초기 실행
  goToSlide(0);
  startAuto();
})();
