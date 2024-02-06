document.addEventListener("click", async function (e) {
  if (e.target && e.target.classList.contains("delete-product-btn")) {
    const deleteProduct = e.target;
    const bookId =
      deleteProduct.parentNode.querySelector("[name=bookId]").value;
    const csrfToken =
      deleteProduct.parentNode.querySelector("[name=_csrf]").value;

    const card = deleteProduct.closest("article");

    const data = await fetch(`/admin/delete-book/${bookId}`, {
      method: "DELETE",
      headers: {
        "csrf-token": csrfToken,
      },
    });

    const response = await data.json();
    card.parentNode.removeChild(card);
  }
});
