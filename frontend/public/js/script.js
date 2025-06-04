document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded and parsed");
  
  // DOM Elements
  const mainContent = document.getElementById('main-content');
  const homeLink = document.getElementById('home-link');
  const addStudentLink = document.getElementById('add-student-link');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  
  // Modal Elements
  const studentModalElement = document.getElementById('studentModal');
  const studentModal = studentModalElement ? new bootstrap.Modal(studentModalElement) : null;
  const deleteModalElement = document.getElementById('deleteModal');
  const deleteModal = deleteModalElement ? new bootstrap.Modal(deleteModalElement) : null;
  const studentForm = document.getElementById('studentForm');
  const modalTitle = document.getElementById('modalTitle');
  const saveStudentBtn = document.getElementById('saveStudent');
  const confirmDeleteBtn = document.getElementById('confirmDelete');

  // Toast Elements
  const toastEl = document.getElementById('liveToast');
  const toast = toastEl ? new bootstrap.Toast(toastEl) : null;
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');
  
  // State variables
  let currentPage = 1;
  let currentStudentId = null;
  let isEditMode = false;

  // Debug initial elements
  console.log("Initial elements:", {
    mainContent,
    studentModal,
    deleteModal,
    studentForm,
    toast
  });

  // Event Listeners
  function initializeEventListeners() {
    console.log("Initializing event listeners...");
    
    if (homeLink) {
      homeLink.addEventListener('click', function(e) {
        e.preventDefault();
        loadHomePage();
      });
    }

    if (addStudentLink) {
      addStudentLink.addEventListener('click', function(e) {
        e.preventDefault();
        console.log("Navbar Add Student clicked");
        showAddStudentForm();
      });
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', searchStudents);
    }

    if (searchInput) {
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          searchStudents();
        }
      });
    }

    if (saveStudentBtn) {
      saveStudentBtn.addEventListener('click', saveStudent);
    }

    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', deleteStudent);
    }
  }

  // Initial load
  initializeEventListeners();
  loadHomePage();

  // Functions
  function loadHomePage() {
    console.log("Loading home page...");
    fetchStudents();
    updateActiveNav('home-link');
  }
  
  function fetchStudents(page = 1, limit = 10) {
    console.log(`Fetching students page ${page}`);
    currentPage = page;
    fetch(`http://localhost:3000/api/students?page=${page}&limit=${limit}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Received student data:", data);
        renderStudentTable(data.students, data.total, data.totalPages);
      })
      .catch(error => {
        console.error("Error fetching students:", error);
        showToast('Error', 'Failed to fetch students: ' + error.message, 'danger');
      });
  }
  
  function renderStudentTable(students, total, totalPages) {
    console.log("Rendering student table...");
    let html = `
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Student Records</h5>
          <div>
            <button class="btn btn-sm btn-primary" id="add-student-btn">
              <i class="fas fa-plus"></i> Add Student
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="filter-section mb-3">
            <div class="row">
              <div class="col-md-6">
                <label for="course-filter" class="form-label">Filter by Course:</label>
                <select class="form-select" id="course-filter">
                  <option value="">All Courses</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business">Business</option>
                  <option value="Arts">Arts</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Agriculture">Agriculture</option>
                </select>
              </div>
              <div class="col-md-6">
                <label for="year-filter" class="form-label">Filter by Year Level:</label>
                <select class="form-select" id="year-filter">
                  <option value="">All Years</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
            </div>
            <div class="row mt-2">
              <div class="col-12">
                <button class="btn btn-sm btn-primary" id="apply-filter">Apply Filter</button>
                <button class="btn btn-sm btn-secondary" id="reset-filter">Reset</button>
              </div>
            </div>
          </div>
          <div class="table-responsive">
            <table class="table table-striped table-hover student-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Course</th>
                  <th>Year</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
    `;
    
    if (students.length === 0) {
      html += `
        <tr>
          <td colspan="7" class="text-center">No students found</td>
        </tr>
      `;
    } else {
      students.forEach(student => {
        html += `
          <tr>
            <td>${student.studentId}</td>
            <td>${student.fullName}</td>
            <td>${student.email}</td>
            <td>${student.age}</td>
            <td>${student.course}</td>
            <td>${student.yearLevel}</td>
            <td class="action-buttons">
              <button class="btn btn-sm btn-warning edit-btn" data-id="${student.id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger delete-btn" data-id="${student.id}">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
      });
    }
    
    html += `
              </tbody>
            </table>
          </div>
    `;
    
    if (totalPages > 1) {
      html += `
        <nav aria-label="Page navigation">
          <ul class="pagination">
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
              <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
            </li>
      `;
      
      for (let i = 1; i <= totalPages; i++) {
        html += `
          <li class="page-item ${i === currentPage ? 'active' : ''}">
            <a class="page-link" href="#" data-page="${i}">${i}</a>
          </li>
        `;
      }
      
      html += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
              <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
            </li>
          </ul>
        </nav>
      `;
    }
    
    html += `
        </div>
      </div>
    `;
    
    mainContent.innerHTML = html;
    
    // Add event listeners to dynamically created elements
    const addStudentBtn = document.getElementById('add-student-btn');
    if (addStudentBtn) {
      addStudentBtn.addEventListener('click', function() {
        console.log("Card Add Student button clicked");
        showAddStudentForm();
      });
    }

    document.getElementById('apply-filter')?.addEventListener('click', applyFilters);
    document.getElementById('reset-filter')?.addEventListener('click', resetFilters);
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        editStudent(this.getAttribute('data-id'));
      });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        showDeleteConfirmation(this.getAttribute('data-id'));
      });
    });
    
    document.querySelectorAll('.page-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const page = parseInt(this.getAttribute('data-page'));
        fetchStudents(page);
      });
    });
  }
  
  function applyFilters() {
    console.log("Applying filters...");
    const course = document.getElementById('course-filter').value;
    const year = document.getElementById('year-filter').value;
    
    let url = 'http://localhost:3000/api/students/filter?';
    if (course) url += `course=${course}&`;
    if (year) url += `yearLevel=${year}`;
    
    console.log("Filter URL:", url);
    
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(students => {
        console.log("Filtered students:", students);
        renderFilteredStudentTable(students);
      })
      .catch(error => {
        console.error("Error filtering students:", error);
        showToast('Error', 'Failed to filter students: ' + error.message, 'danger');
      });
  }
  
  function renderFilteredStudentTable(students) {
    console.log("Rendering filtered student table...");
    let html = `
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Filtered Student Records</h5>
          <button class="btn btn-sm btn-secondary" id="back-to-all">
            <i class="fas fa-arrow-left"></i> Back to All
          </button>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped table-hover student-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Course</th>
                  <th>Year</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
    `;
    
    if (students.length === 0) {
      html += `
        <tr>
          <td colspan="7" class="text-center">No students match the filter criteria</td>
        </tr>
      `;
    } else {
      students.forEach(student => {
        html += `
          <tr>
            <td>${student.studentId}</td>
            <td>${student.fullName}</td>
            <td>${student.email}</td>
            <td>${student.age}</td>
            <td>${student.course}</td>
            <td>${student.yearLevel}</td>
            <td class="action-buttons">
              <button class="btn btn-sm btn-warning edit-btn" data-id="${student.id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger delete-btn" data-id="${student.id}">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
      });
    }
    
    html += `
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    
    mainContent.innerHTML = html;
    
    // Add event listeners
    document.getElementById('back-to-all')?.addEventListener('click', loadHomePage);
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        editStudent(this.getAttribute('data-id'));
      });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        showDeleteConfirmation(this.getAttribute('data-id'));
      });
    });
  }
  
  function resetFilters() {
    console.log("Resetting filters...");
    document.getElementById('course-filter').value = '';
    document.getElementById('year-filter').value = '';
    fetchStudents();
  }
  
  function searchStudents() {
    const query = searchInput.value.trim();
    console.log("Searching for:", query);
    
    if (!query) {
      showToast('Warning', 'Please enter a search term', 'warning');
      return;
    }
    
    fetch(`http://localhost:3000/api/students/search?query=${query}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(students => {
        console.log("Search results:", students);
        renderSearchResults(students, query);
      })
      .catch(error => {
        console.error("Error searching students:", error);
        showToast('Error', 'Failed to search students: ' + error.message, 'danger');
      });
  }
  
  function renderSearchResults(students, query) {
    console.log("Rendering search results...");
    let html = `
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Search Results for "${query}"</h5>
          <button class="btn btn-sm btn-secondary" id="back-to-all-search">
            <i class="fas fa-arrow-left"></i> Back to All
          </button>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped table-hover student-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Course</th>
                  <th>Year</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
    `;
    
    if (students.length === 0) {
      html += `
        <tr>
          <td colspan="7" class="text-center">No students found matching "${query}"</td>
        </tr>
      `;
    } else {
      students.forEach(student => {
        html += `
          <tr>
            <td>${student.studentId}</td>
            <td>${student.fullName}</td>
            <td>${student.email}</td>
            <td>${student.age}</td>
            <td>${student.course}</td>
            <td>${student.yearLevel}</td>
            <td class="action-buttons">
              <button class="btn btn-sm btn-warning edit-btn" data-id="${student.id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger delete-btn" data-id="${student.id}">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
      });
    }
    
    html += `
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    
    mainContent.innerHTML = html;
    
    // Add event listeners
    document.getElementById('back-to-all-search')?.addEventListener('click', loadHomePage);
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        editStudent(this.getAttribute('data-id'));
      });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        showDeleteConfirmation(this.getAttribute('data-id'));
      });
    });
  }
  
  function showAddStudentForm() {
  console.log("Showing add student form...");
  
   if (!modalTitle) {
     console.error("Error: modalTitle element not found!");
     return;
   }

    isEditMode = false;
    modalTitle.textContent = 'Add Student';
  
   if (studentForm) {
      studentForm.reset();
   } else {
      console.error("Error: studentForm not found!");
   }

    if (studentModal) {
      studentModal.show();
    } else {
     console.error("Error: studentModal not initialized!");
    }
  }
  
  function editStudent(id) {
    console.log("Editing student ID:", id);
    isEditMode = true;
    currentStudentId = id;
    modalTitle.textContent = 'Edit Student';
    
    fetch(`http://localhost:3000/api/students/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(student => {
        console.log("Student data for edit:", student);
        document.getElementById('studentId').value = student.id;
        document.getElementById('studentIdInput').value = student.studentId;
        document.getElementById('fullName').value = student.fullName;
        document.getElementById('email').value = student.email;
        document.getElementById('age').value = student.age;
        document.getElementById('course').value = student.course;
        document.getElementById('yearLevel').value = student.yearLevel;
        
        if (studentModal) {
          studentModal.show();
        }
      })
      .catch(error => {
        console.error("Error fetching student:", error);
        showToast('Error', 'Failed to fetch student: ' + error.message, 'danger');
      });
  }
  
  function saveStudent() {
    console.log("Saving student...");
    
    const studentData = {
      studentId: document.getElementById('studentIdInput').value.trim(),
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      age: parseInt(document.getElementById('age').value),
      course: document.getElementById('course').value,
      yearLevel: parseInt(document.getElementById('yearLevel').value)
    };
    
    console.log("Student data to save:", studentData);
    
    // Client-side validation
    if (!validateStudentForm(studentData)) {
      console.log("Validation failed");
      return;
    }
    
    const url = isEditMode 
      ? `http://localhost:3000/api/students/${currentStudentId}`
      : 'http://localhost:3000/api/students';
    
    const method = isEditMode ? 'PUT' : 'POST';
    
    console.log(`Making ${method} request to:`, url);
    
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studentData)
    })
    .then(response => {
      console.log("Response status:", response.status);
      if (!response.ok) {
        return response.json().then(err => { 
          throw new Error(err.error || `Server error: ${response.status}`); 
        });
      }
      return response.json();
    })
    .then(data => {
      console.log("Save successful:", data);
      if (studentModal) {
        studentModal.hide();
      }
      showToast('Success', `Student ${isEditMode ? 'updated' : 'added'} successfully`, 'success');
      fetchStudents(currentPage);
    })
    .catch(error => {
      console.error("Error saving student:", error);
      showToast('Error', error.message, 'danger');
    });
  }
  
  function validateStudentForm(data) {
    console.log("Validating form data...");
    let isValid = true;
    
    // Reset validation
    const fields = ['studentIdInput', 'fullName', 'email', 'age', 'course', 'yearLevel'];
    fields.forEach(field => {
      const element = document.getElementById(field);
      if (element) {
        element.classList.remove('is-invalid');
      }
    });
    
    // Validate each field
    if (!data.studentId) {
      document.getElementById('studentIdInput').classList.add('is-invalid');
      isValid = false;
    }
    
    if (!data.fullName) {
      document.getElementById('fullName').classList.add('is-invalid');
      isValid = false;
    }
    
    if (!data.email || !data.email.includes('@')) {
      document.getElementById('email').classList.add('is-invalid');
      isValid = false;
    }
    
    if (!data.age || data.age < 16 || data.age > 100) {
      document.getElementById('age').classList.add('is-invalid');
      isValid = false;
    }
    
    if (!data.course) {
      document.getElementById('course').classList.add('is-invalid');
      isValid = false;
    }
    
    if (!data.yearLevel || data.yearLevel < 1 || data.yearLevel > 5) {
      document.getElementById('yearLevel').classList.add('is-invalid');
      isValid = false;
    }
    
    if (!isValid) {
      console.log("Form validation failed");
      showToast('Validation Error', 'Please fill all fields correctly', 'warning');
    }
    
    return isValid;
  }
  
  function showDeleteConfirmation(id) {
    console.log("Showing delete confirmation for ID:", id);
    currentStudentId = id;
    if (deleteModal) {
      deleteModal.show();
    }
  }
  
  function deleteStudent() {
    console.log("Deleting student ID:", currentStudentId);
    
    fetch(`http://localhost:3000/api/students/${currentStudentId}`, {
      method: 'DELETE'
    })
    .then(response => {
      console.log("Delete response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(() => {
      console.log("Delete successful");
      if (deleteModal) {
        deleteModal.hide();
      }
      showToast('Success', 'Student deleted successfully', 'success');
      fetchStudents(currentPage);
    })
    .catch(error => {
      console.error("Error deleting student:", error);
      showToast('Error', error.message, 'danger');
    });
  }
  
  function showToast(title, message, type = 'success') {
    console.log(`Showing toast: ${title} - ${message} (${type})`);
    
    if (!toast || !toastTitle || !toastMessage) {
      console.error("Toast elements not found");
      return;
    }
    
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Set toast color based on type
    const toastHeader = toastEl.querySelector('.toast-header');
    if (toastHeader) {
      toastHeader.className = 'toast-header';
      toastHeader.classList.add(`bg-${type}`, 'text-white');
    }
    
    toast.show();
  }
  
  function updateActiveNav(activeId) {
    console.log("Updating active nav to:", activeId);
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    const activeElement = document.getElementById(activeId);
    if (activeElement) {
      activeElement.classList.add('active');
    }
  }
});