// ===== 상품 더보기 버튼 =====

(function () {
  const btns = document.querySelectorAll('.product-more-btn');

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const gridId = btn.dataset.target;
      const grid = document.getElementById(gridId);
      if (!grid) return;

      // 숨겨진 상품 카드 표시
      grid.querySelectorAll('.product-hidden').forEach((card) => {
        card.classList.remove('product-hidden');
      });

      // 버튼 영역 숨김
      btn.closest('.product-more-wrap').style.display = 'none';
    });
  });
})();
