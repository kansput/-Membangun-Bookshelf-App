/**
 * Bookshelf App
 * Submission Dicoding: Belajar Membuat Front-End Web untuk Pemula
 * File: main.js
 * Version: FINAL-FIX
 */

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'BOOKSHELF_APPS';
  const RENDER_EVENT = 'render-book';
  let books = [];

  // --- Selektor DOM ---
  const bookForm = document.getElementById('bookForm');
  const searchForm = document.getElementById('searchBook'); // Tambah selektor untuk form pencarian
  const searchInput = document.getElementById('searchBookTitle');
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');
  const editModal = document.getElementById('editBookModal');
  const editForm = document.getElementById('editBookForm');

  const isStorageExist = () => typeof Storage !== 'undefined';

  const showToast = (message, type = 'success') => {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.className = 'toast show';
    if (type === 'danger') {
      toast.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--danger-color').trim();
    } else if (type === 'edit') {
      toast.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--edit-color').trim();
    } else {
      toast.style.backgroundColor = '';
    }
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  const saveData = () => {
    if (isStorageExist()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    }
  };

  const loadDataFromStorage = () => {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    books = JSON.parse(serializedData) || [];
    document.dispatchEvent(new Event(RENDER_EVENT));
  };

  const findBook = (bookId) => books.find((book) => book.id === bookId);
  const findBookIndex = (bookId) => books.findIndex((book) => book.id === bookId);

  const addBook = (event) => {
    event.preventDefault();
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = document.getElementById('bookFormYear').value;
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    const newBook = { id: +new Date(), title, author, year: parseInt(year), isComplete };
    books.push(newBook);

    bookForm.reset();
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
    showToast(`Buku "${title}" berhasil ditambahkan!`);
  };

  const toggleBookStatus = (bookId) => {
    const book = findBook(bookId);
    if (!book) return;

    book.isComplete = !book.isComplete;
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
    const message = book.isComplete ? 'dipindahkan ke rak Selesai Dibaca.' : 'dipindahkan kembali ke rak Belum Selesai.';
    showToast(`Buku "${book.title}" ${message}`);
  };

  const deleteBook = (bookId) => {
    const book = findBook(bookId);
    if (!book) return;
    
    if (confirm(`Apakah Anda yakin ingin menghapus buku "${book.title}"?`)) {
      const bookIndex = findBookIndex(bookId);
      books.splice(bookIndex, 1);
      saveData();
      document.dispatchEvent(new Event(RENDER_EVENT));
      showToast(`Buku "${book.title}" telah dihapus.`, 'danger');
    }
  };

  const openEditModal = (bookId) => {
    const book = findBook(bookId);
    if (!book) return;
    
    editForm.querySelector('#editBookId').value = book.id;
    editForm.querySelector('#editBookTitle').value = book.title;
    editForm.querySelector('#editBookAuthor').value = book.author;
    editForm.querySelector('#editBookYear').value = book.year;
    editModal.style.display = 'block';
  };

  const closeEditModal = () => {
    editModal.style.display = 'none';
  };

  const saveBookEdits = (event) => {
    event.preventDefault();
    const id = parseInt(editForm.querySelector('#editBookId').value);
    const book = findBook(id);
    if (book) {
      book.title = editForm.querySelector('#editBookTitle').value;
      book.author = editForm.querySelector('#editBookAuthor').value;
      book.year = parseInt(editForm.querySelector('#editBookYear').value);
      saveData();
      document.dispatchEvent(new Event(RENDER_EVENT));
      closeEditModal();
      showToast('Data buku berhasil diperbarui!', 'edit');
    }
  };

  const makeBookElement = (book) => {
    const { id, title, author, year, isComplete } = book;

    const bookItem = document.createElement('div');
    bookItem.classList.add('book-item');
    bookItem.setAttribute('data-bookid', id);
    bookItem.setAttribute('data-testid', 'bookItem');
    
    bookItem.innerHTML = `
      <h3 data-testid="bookItemTitle">${title}</h3>
      <p data-testid="bookItemAuthor">Penulis: ${author}</p>
      <p data-testid="bookItemYear">Tahun: ${year}</p>
      <div class="action-buttons"></div>
    `;

    const actionContainer = bookItem.querySelector('.action-buttons');
    const toggleButton = document.createElement('button');
    toggleButton.innerText = isComplete ? 'Belum Selesai' : 'Selesai Dibaca';
    toggleButton.classList.add(isComplete ? 'is-incomplete-btn' : 'is-complete-btn');
    toggleButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    toggleButton.addEventListener('click', () => toggleBookStatus(id));

    const editButton = document.createElement('button');
    editButton.innerText = 'Edit';
    editButton.classList.add('edit-btn');
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.addEventListener('click', () => openEditModal(id));
    
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Hapus';
    deleteButton.classList.add('delete-btn');
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.addEventListener('click', () => deleteBook(id));

    actionContainer.append(toggleButton, editButton, deleteButton);
    return bookItem;
  };

  // --- Event Listeners ---
  bookForm.addEventListener('submit', addBook);

  // --- Penanganan Form Pencarian (PERBAIKAN) ---
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Mencegah form dari refresh halaman
    document.dispatchEvent(new Event(RENDER_EVENT)); // Memanggil render ulang untuk filter
  });

  // Pencarian live tetap berfungsi
  searchInput.addEventListener('input', () => {
    document.dispatchEvent(new Event(RENDER_EVENT));
  });
  
  editForm.addEventListener('submit', saveBookEdits);
  editModal.querySelector('.close-button').addEventListener('click', closeEditModal);
  window.addEventListener('click', (event) => {
    if (event.target === editModal) closeEditModal();
  });

  document.addEventListener(RENDER_EVENT, () => {
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    const query = searchInput.value.toLowerCase();
    const filteredBooks = books.filter(book => book.title.toLowerCase().includes(query));

    for (const book of filteredBooks) {
      const bookElement = makeBookElement(book);
      (book.isComplete ? completeBookList : incompleteBookList).append(bookElement);
    }
  });
  
  loadDataFromStorage();
});
