// ===== 카테고리 탭 전환 =====

(function () {
  const tabs = document.querySelectorAll('.cat-tab');
  const grids = document.querySelectorAll('.icon-grid');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      // 모든 탭 비활성화
      tabs.forEach((t) => t.classList.remove('active'));
      // 모든 그리드 숨김
      grids.forEach((g) => g.classList.add('hidden'));

      // 클릭한 탭 활성화
      tab.classList.add('active');
      // 해당 그리드 표시
      const target = document.getElementById('tab-' + tab.dataset.tab);
      if (target) target.classList.remove('hidden');
    });
  });
})();
