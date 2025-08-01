// === AUTH ===
document.getElementById("loginButton").addEventListener("click", () => {
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;
    firebase.auth().signInWithEmailAndPassword(email, password)
      .catch(error => alert("Login failed: " + error.message));
  });
  
  document.getElementById("signupButton").addEventListener("click", () => {
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .catch(error => alert("Signup failed: " + error.message));
  });
  
  document.getElementById("logoutButton").addEventListener("click", () => {
    firebase.auth().signOut();
  });
  
// === AUTH STATE LISTENER ===
firebase.auth().onAuthStateChanged(user => {
    const authControls = document.getElementById("authControls");
    const logoutControls = document.getElementById("logoutControls");
    const taskSection = document.querySelector(".page-container");
  
    if (authControls && logoutControls) {
      if (user) {
        authControls.style.display = "none";
        logoutControls.style.display = "flex";
        taskSection.style.display = "block";
        document.getElementById("userEmailDisplay").textContent = `Logged in as ${user.email}`;
        loadTasks(user.uid); // load user's tasks from Firestore
      } else {
        authControls.style.display = "flex";
        logoutControls.style.display = "none";
        taskSection.style.display = "block"; // optional: allow usage without login
        loadTasks(); // load from localStorage
      }
    }
  });
  
  

//Event Listeners

//When Add Task button is clicked
addTaskButton.addEventListener('click', () => {
    setFormFields();
    addTaskFormFields.style.display = 'block';
    confirmAddTaskButton.textContent = 'Confirm Add';
    cancelAddTaskButton.textContent = 'Cancel';
    taskTextBox.focus();
    delete addTaskFormFields.dataset.updatingTaskId;
});

//When Confirm Add or Confirm Update button is clicked
confirmAddTaskButton.addEventListener('click', addTask);

//When Cancel or Cancel Update button is clicked
cancelAddTaskButton.addEventListener('click', () => {
    resetAddForm();
});

//When 'Enter' is pressed while in the task form fields
addTaskFormFields.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (event.target !== cancelAddTaskButton) {
            addTask();
        }
    }
});

//When you click anywhere in the main content area to select/deselect tasks
mainContent.addEventListener('click', function(event) {
    const clickedElement = event.target;
    const currentlySelected = document.querySelector('.selected');

    if (clickedElement && clickedElement.tagName === 'LI' && taskList.contains(clickedElement)) {
        if (clickedElement === currentlySelected) {
            clickedElement.classList.remove('selected');
        } else {
            if (currentlySelected) {
                currentlySelected.classList.remove('selected');
            }
            clickedElement.classList.add('selected');
        }
    } else {
        if (currentlySelected) {
            currentlySelected.classList.remove('selected');
        }
    }
});

//When a checkbox inside the task list is changed
taskList.addEventListener('change', function(event) {
    if (event.target && event.target.classList.contains('task-checkbox')) {
        const checkbox = event.target;
        const listItem = checkbox.closest('li');

        if (listItem) {
            let task = JSON.parse(listItem.dataset.task);
            task.completed = checkbox.checked;
            listItem.dataset.task = JSON.stringify(task);

            if (task.completed) {
                listItem.classList.add('completed');
            } else {
                listItem.classList.remove('completed');
            }
            listItem.classList.remove('selected');
            saveTasks();
        }
    }
});

//When the Delete Selected Task button is clicked
deleteTaskButton.addEventListener('click', deleteTask);

//If the Update Selected Task button exists on the page
if (updateTaskButton) {
    updateTaskButton.addEventListener('click', updateTask);
}

//If the Search button exists on the page
if (searchButton) {
    searchButton.addEventListener('click', searchTasks);
}

//If the Search Input box exists on the page and you press a key in it
if (searchInput) {
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            searchTasks();
        }
    });
}

//When the Filter By Date button is clicked
filterByDateButton.addEventListener('click', () => {
    filterOptionsDiv.innerHTML = '';

    const dateLabel = document.createElement('label');
    dateLabel.textContent = 'Due on or before: ';
    dateLabel.htmlFor = 'dueDateFilterInput';

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.id = 'dueDateFilterInput';
    dateInput.classList.add('filter-input');

    filterOptionsDiv.appendChild(dateLabel);
    filterOptionsDiv.appendChild(dateInput);

    dateInput.addEventListener('change', filterTasks);

    const clearDateFilterButton = document.createElement('button');
    clearDateFilterButton.textContent = 'Clear Date Filter';
    clearDateFilterButton.classList.add('clear-filter-button');
    filterOptionsDiv.appendChild(clearDateFilterButton);

    clearDateFilterButton.addEventListener('click', () => {
        dateInput.value = '';
        filterTasks();
    });

    filterTasks();
});

//When the Filter By Priority button is clicked
filterByPriorityButton.addEventListener('click', () => {
    filterOptionsDiv.innerHTML = '';

    const prioritySelect = document.createElement('select');
    prioritySelect.id = 'priorityFilterSelect';
    prioritySelect.innerHTML = `
        <option value="all">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
    `;
    filterOptionsDiv.appendChild(prioritySelect);

    prioritySelect.addEventListener('change', filterTasks);

    filterTasks();
});

//When the Filter By Category button is clicked
filterByCategoryButton.addEventListener('click', () => {
    filterOptionsDiv.innerHTML = '';

    const categoryLabel = document.createElement('label');
    categoryLabel.textContent = 'Filter by Category: ';
    categoryLabel.htmlFor = 'categoryFilterInput';

    const categoryInput = document.createElement('input');
    categoryInput.type = 'text';
    categoryInput.id = 'categoryFilterInput';
    categoryInput.placeholder = 'e.g., Work, Personal';
    categoryInput.classList.add('filter-input');

    filterOptionsDiv.appendChild(categoryLabel);
    filterOptionsDiv.appendChild(categoryInput);

    categoryInput.addEventListener('input', filterTasks);

    const clearCategoryFilterButton = document.createElement('button');
    clearCategoryFilterButton.textContent = 'Clear Category Filter';
    clearCategoryFilterButton.classList.add('clear-filter-button');
    filterOptionsDiv.appendChild(clearCategoryFilterButton);

    clearCategoryFilterButton.addEventListener('click', () => {
        categoryInput.value = '';
        filterTasks();
    });

    filterTasks();
});

//Initial Page Load
//These run when events.js is loaded
resetAddForm();
filterTasks();