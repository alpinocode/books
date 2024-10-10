const STORAGE_KEY = "BOOKSHELF_APPS";
let books = [];
let editedBookId = null; // Untuk menyimpan ID buku yang sedang diedit

document.addEventListener("DOMContentLoaded", () => {
  const bookForm = document.getElementById("bookForm");
  const searchForm = document.getElementById("searchBook");

  if (isStorageAvailable()) {
    loadDataFromStorage();
  }

  bookForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (editedBookId) {
      editBook(editedBookId);
    } else {
      addBook();
    }
    clearForm(); // Bersihkan form setelah submit
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchBook();
  });
});

// Helper untuk mengecek apakah localStorage tersedia
function isStorageAvailable() {
  return typeof Storage !== "undefined";
}

// Simpan data ke localStorage
function saveData() {
  const parsed = JSON.stringify(books);
  localStorage.setItem(STORAGE_KEY, parsed);
  document.dispatchEvent(new Event("ondatasaved"));
}

// Ambil data dari localStorage
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  if (serializedData !== null) {
    books = JSON.parse(serializedData);
  }
  refreshBookList();
}

// Buat ID buku unik menggunakan timestamp
function generateId() {
  return +new Date();
}

// Buat objek buku
function generateBookObject(id, title, author, year, isComplete) {
  return { id, title, author, year, isComplete };
}

// Cari buku berdasarkan ID
function findBook(bookId) {
  return books.find((book) => book.id === bookId) || null;
}

// Temukan index buku berdasarkan ID
function findBookIndex(bookId) {
  return books.findIndex((book) => book.id === bookId);
}

// Tambah buku baru
function addBook() {
  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = parseInt(document.getElementById("bookFormYear").value);
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const newBook = generateBookObject(
    generateId(),
    title,
    author,
    year,
    isComplete
  );

  books.push(newBook);
  saveData();
  refreshBookList();
}

// Edit buku yang sudah ada
function editBook(bookId) {
  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = document.getElementById("bookFormYear").value;
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const bookIndex = findBookIndex(bookId);
  books[bookIndex] = { ...books[bookIndex], title, author, year, isComplete };
  saveData();
  refreshBookList();
  editedBookId = null;
}

// Bersihkan form setelah edit atau tambah
function clearForm() {
  document.getElementById("bookForm").reset();
  document.getElementById("bookFormSubmit").textContent =
    "Masukkan Buku ke rak Belum selesai dibaca";
}

// Buat elemen buku
function createBookElement(book) {
  const bookItemTitle = document.createElement("h3");
  bookItemTitle.textContent = book.title;
  bookItemTitle.setAttribute("data-testid", "bookItemTitle");

  const bookItemAuthor = document.createElement("p");
  bookItemAuthor.textContent = `Penulis: ${book.author}`;
  bookItemAuthor.setAttribute("data-testid", "bookItemAuthor");

  const bookItemYear = document.createElement("p");
  bookItemYear.textContent = `Tahun: ${book.year}`;
  bookItemYear.setAttribute("data-testid", "bookItemYear");

  const buttonContainer = document.createElement("div");

  const bookItemIsCompleteButton = document.createElement("button");
  bookItemIsCompleteButton.textContent = book.isComplete
    ? "Belum selesai dibaca"
    : "Selesai dibaca";
  bookItemIsCompleteButton.setAttribute(
    "data-testid",
    "bookItemIsCompleteButton"
  );
  bookItemIsCompleteButton.addEventListener("click", () =>
    toggleBookCompletion(book.id)
  );

  const bookItemDeleteButton = document.createElement("button");
  bookItemDeleteButton.textContent = "Hapus Buku";
  bookItemDeleteButton.setAttribute("data-testid", "bookItemDeleteButton");
  bookItemDeleteButton.addEventListener("click", () => removeBook(book.id));

  const bookItemEditButton = document.createElement("button");
  bookItemEditButton.textContent = "Edit Buku";
  bookItemEditButton.setAttribute("data-testid", "bookItemEditButton");
  bookItemEditButton.addEventListener("click", () => loadBookToForm(book.id));

  buttonContainer.append(
    bookItemIsCompleteButton,
    bookItemDeleteButton,
    bookItemEditButton
  );

  const container = document.createElement("div");
  container.setAttribute("data-bookid", book.id);
  container.setAttribute("data-testid", "bookItem");
  container.append(
    bookItemTitle,
    bookItemAuthor,
    bookItemYear,
    buttonContainer
  );

  return container;
}

// Load buku ke form untuk diedit
function loadBookToForm(bookId) {
  const book = findBook(bookId);
  if (!book) return;

  document.getElementById("bookFormTitle").value = book.title;
  document.getElementById("bookFormAuthor").value = book.author;
  document.getElementById("bookFormYear").value = book.year;
  document.getElementById("bookFormIsComplete").checked = book.isComplete;

  editedBookId = book.id;
  document.getElementById("bookFormSubmit").textContent = "Simpan Perubahan";
}

// Refresh tampilan buku di rak
function refreshBookList() {
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  books.forEach((book) => {
    const bookElement = createBookElement(book);
    if (book.isComplete) {
      completeBookList.append(bookElement);
    } else {
      incompleteBookList.append(bookElement);
    }
  });
}

// Pindah buku antara rak
function toggleBookCompletion(bookId) {
  const book = findBook(bookId);
  if (!book) return;

  book.isComplete = !book.isComplete;
  saveData();
  refreshBookList();
}

// Hapus buku
function removeBook(bookId) {
  const bookIndex = findBookIndex(bookId);
  if (bookIndex === -1) return;

  books.splice(bookIndex, 1);
  saveData();
  refreshBookList();
}

// Cari buku berdasarkan judul
function searchBook() {
  const searchTitle = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  books.forEach((book) => {
    if (book.title.toLowerCase().includes(searchTitle)) {
      const bookElement = createBookElement(book);
      if (book.isComplete) {
        completeBookList.append(bookElement);
      } else {
        incompleteBookList.append(bookElement);
      }
    }
  });
}
