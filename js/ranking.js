// ===== 나캣랭킹 어코디언 =====

(function () {
  const items = document.querySelectorAll('.ranking-item');

  items.forEach((item) => {
    const header = item.querySelector('.ranking-header');

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // 모든 항목 닫기
      items.forEach((i) => i.classList.remove('active'));

      // 클릭한 항목이 닫혀있었으면 열기
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
})();
