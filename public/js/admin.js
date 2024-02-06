const deleteProduct = document.querySelector(".delete-product-btn");

deleteProduct?.addEventListener("click", async function (e) {
  const bookId = this.parentNode.querySelector("[name=bookId]").value;
  const csrfToken = this.parentNode.querySelector("[name=_csrf]").value;

  const card = this.closest("article");

  const data = await fetch(`/admin/delete-book/${bookId}`, {
    method: "DELETE",
    headers: {
      "csrf-token": csrfToken,
    },
  });

  const response = await data.json();
  //   card.remove();
  card.parentNode.removeChild(card);
  //   console.log("clicked");
});
