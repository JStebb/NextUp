//Helper Function


//Clears or fills form fields with existing task information
function setFormFields(task = { text: '', dueDate: '', priority: '', category: '' }) {
    taskTextBox.value = task.text;
    taskDueDate.value = task.dueDate;
    taskPriority.value = task.priority;
    taskCategory.value = task.category;
}

//Makes the add/update task form disappear and clears it out
function resetAddForm() {
    setFormFields();
    addTaskFormFields.style.display = 'none';
    confirmAddTaskButton.textContent = 'Confirm Add';
    cancelAddTaskButton.textContent = 'Cancel';
    delete addTaskFormFields.dataset.updatingTaskId;
}

//Persistence Functions

//Takes all tasks currently in the task list and saves them to localStorage
function saveTasks() {
    const tasksToSave = [];
    taskList.querySelectorAll('li').forEach(taskItem => {
        const taskData = taskItem.dataset.task;
        if (taskData) {
            try {
                tasksToSave.push(JSON.parse(taskData));
            } catch (e) {
                console.error("Error parsing task data from a list item, skipping:", taskData, e);
            }
        }
    });

    const user = firebase.auth().currentUser;
    if (user) {
        // Save to Firestore
        firebase.firestore().collection("users").doc(user.uid).set({ tasks: tasksToSave })
            .then(() => console.log("Tasks saved to Firestore"))
            .catch(error => console.error("Failed to save to Firestore:", error));
    } else {
        // Save to localStorage (fallback for dev/testing)
        localStorage.setItem('nextup_tasks', JSON.stringify(tasksToSave));
    }
}


//Runs when the page loads. Tries to get and saved tasks from localStorage
function loadTasks(uid = null) {
    if (uid) {
        // Load from Firestore
        firebase.firestore().collection("users").doc(uid).get()
            .then(doc => {
                const data = doc.data();
                const tasksParsed = data?.tasks || [];
                renderTasks(tasksParsed);
            })
            .catch(error => {
                console.error("Error loading tasks from Firestore:", error);
                renderTasks([]);
            });
    } else {
        // Load from localStorage
        const savedTasksRaw = localStorage.getItem('nextup_tasks');
        if (!savedTasksRaw || savedTasksRaw === '[]') {
            renderTasks([]);
            return;
        }

        let tasksParsed;
        try {
            tasksParsed = JSON.parse(savedTasksRaw);
        } catch (e) {
            console.error("Error parsing saved tasks from localStorage:", e);
            localStorage.removeItem('nextup_tasks');
            alert("Your saved tasks might be corrupted and have been cleared.");
            renderTasks([]);
            return;
        }

        renderTasks(tasksParsed);
    }
}

function renderTasks(tasksParsed) {
    const sortedTasks = sortTasksByDate(tasksParsed);

    taskList.innerHTML = '';
    if (placeholder) {
        placeholder.style.display = tasksParsed.length === 0 ? 'block' : 'none';
    }

    sortedTasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.dataset.task = JSON.stringify(task);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('task-checkbox');
        checkbox.checked = task.completed;

        const taskTextSpan = document.createElement('span');
        taskTextSpan.textContent = task.text;
        taskTextSpan.classList.add('task-text');

        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('task-details');

        if (task.dueDate && task.dueDate.trim() !== '') {
            const dueDateSpan = document.createElement('span');
            dueDateSpan.classList.add('task-due-date');
            try {
                dueDateSpan.textContent = `Due: ${new Date(task.dueDate).toLocaleDateString()}`;
            } catch (e) {
                dueDateSpan.textContent = `Due: ${task.dueDate}`;
            }
            detailsDiv.appendChild(dueDateSpan);
        }

        if (task.priority && task.priority.trim() !== '') {
            const prioritySpan = document.createElement('span');
            prioritySpan.classList.add('task-priority');
            prioritySpan.textContent = `Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`;
            detailsDiv.appendChild(prioritySpan);
        }

        if (task.category && task.category.trim() !== '') {
            const categorySpan = document.createElement('span');
            categorySpan.classList.add('task-category');
            categorySpan.textContent = `Category: ${task.category}`;
            detailsDiv.appendChild(categorySpan);
        }

        if (task.completed) {
            listItem.classList.add('completed');
        }

        listItem.appendChild(checkbox);
        listItem.appendChild(taskTextSpan);
        if (detailsDiv.children.length > 0) {
            listItem.appendChild(detailsDiv);
        }

        taskList.appendChild(listItem);
    });
}


//Task Management Functions (CRUD)

//Either adds a new task or updates an existing one
function addTask() {
    const taskText = taskTextBox.value.trim();
    const dueDate = taskDueDate.value;
    const priority = taskPriority.value;
    const category = taskCategory.value.trim();

    if (taskText === "") {
        alert("Please enter a task description!");
        return;
    }

    const updatingTaskId = addTaskFormFields.dataset.updatingTaskId;
    let listItemToModify = null;

    if (updatingTaskId) {
        const allListItems = taskList.querySelectorAll('li');
        for (let i = 0; i < allListItems.length; i++) {
            const item = allListItems[i];
            const taskObj = JSON.parse(item.dataset.task);
            if (taskObj.text === updatingTaskId) {
                listItemToModify = item;
                break;
            }
        }

        if (!listItemToModify) {
            console.error("Error: Could not find the task to update with ID:", updatingTaskId);
            alert("Error updating task. Please try again.");
            resetAddForm();
            return;
        }

        let taskToModify = JSON.parse(listItemToModify.dataset.task);

        taskToModify.text = taskText;
        taskToModify.dueDate = dueDate;
        taskToModify.priority = priority;
        taskToModify.category = category;

        listItemToModify.querySelector('.task-text').textContent = taskToModify.text;

        const existingDetailsDiv = listItemToModify.querySelector('.task-details');
        const detailsDiv = existingDetailsDiv || document.createElement('div');
        detailsDiv.classList.add('task-details');
        detailsDiv.innerHTML = '';

        if (taskToModify.dueDate) {
            const dueDateSpan = document.createElement('span');
            dueDateSpan.classList.add('task-due-date');
            dueDateSpan.textContent = `Due: ${new Date(taskToModify.dueDate).toLocaleDateString()}`;
            detailsDiv.appendChild(dueDateSpan);
        }
        if (taskToModify.priority) {
            const prioritySpan = document.createElement('span');
            prioritySpan.classList.add('task-priority');
            prioritySpan.textContent = `Priority: ${taskToModify.priority.charAt(0).toUpperCase() + taskToModify.priority.slice(1)}`;
            detailsDiv.appendChild(prioritySpan);
        }
        if (taskToModify.category) {
            const categorySpan = document.createElement('span');
            categorySpan.classList.add('task-category');
            categorySpan.textContent = `Category: ${taskToModify.category}`;
            detailsDiv.appendChild(categorySpan);
        }

        if (!existingDetailsDiv && detailsDiv.children.length > 0) {
             listItemToModify.appendChild(detailsDiv);
        } else if (existingDetailsDiv && detailsDiv.children.length === 0) {
             existingDetailsDiv.remove();
        }

        listItemToModify.dataset.task = JSON.stringify(taskToModify);
        listItemToModify.classList.remove('selected');

    } else {
        const existingTasks = [];
        taskList.querySelectorAll('li').forEach(item => {
            existingTasks.push(JSON.parse(item.dataset.task));
        });

        const newTask = {
            text: taskText,
            completed: false,
            dueDate: dueDate,
            priority: priority,
            category: category
        };

        existingTasks.push(newTask);
        renderTasks(existingTasks);
    }

    saveTasks();
    resetAddForm();
    filterTasks();
}

//Deletes the task that is currently selected
function deleteTask() {
    const taskToDelete = document.querySelectorAll('#taskList .selected');
    if (taskToDelete.length > 0) {
        taskToDelete.forEach(task => task.remove());
        saveTasks();
        filterTasks();
    } else {
        alert("Please select a task to delete.");
    }
}

//Fills the update form with selected tasks information which is then updated with the addTask() function
function updateTask() {
    const taskToUpdate = document.querySelectorAll('#taskList .selected');

    if (taskToUpdate.length === 1) {
        const task = JSON.parse(taskToUpdate[0].dataset.task);

        setFormFields(task);

        addTaskFormFields.style.display = 'block';
        confirmAddTaskButton.textContent = 'Confirm Update';
        cancelAddTaskButton.textContent = 'Cancel Update';

        addTaskFormFields.dataset.updatingTaskId = task.text;

    } else if (taskToUpdate.length > 1) {
        alert("Please select only one task to update.")
    } else {
        alert("Please select a task to update.");
    }
}

//Hides or shows tasks based on user input
function searchTasks() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const allTasks = taskList.querySelectorAll('li');

    if (searchTerm === "") {
        filterTasks();
        return;
    }

    allTasks.forEach(taskItem => {
        const taskData = taskItem.dataset.task;
        if (!taskData) {
            taskItem.style.display = 'none';
            return;
        }
        let task;
        try {
            task = JSON.parse(taskData);
        } catch (e) {
            console.error("Error parsing task data-attribute during search:", taskData, e);
            taskItem.style.display = 'none';
            return;
        }

        const taskTextLower = task.text ? task.text.toLowerCase() : '';
        const taskCategoryLower = task.category ? task.category.toLowerCase() : '';
        const taskPriorityLower = task.priority ? task.priority.toLowerCase() : '';

        if (taskTextLower.includes(searchTerm) || taskCategoryLower.includes(searchTerm) || taskPriorityLower.includes(searchTerm)) {
            taskItem.style.display = '';
        } else {
            taskItem.style.display = 'none';
            if (taskItem.classList.contains('selected')) {
                taskItem.classList.remove('selected');
            }
        }
    });

    const visibleTasksInDOM = Array.from(allTasks).filter(item => item.style.display !== 'none');
    if (visibleTasksInDOM.length === 0 && placeholder) {
        placeholder.style.display = 'block';
    } else if (placeholder) {
        placeholder.style.display = 'none';
    }
}

//Filtering Functions

//Main filter function that decides which tasks to show based on selected filtering options
function filterTasks() {
    const allTasks = taskList.querySelectorAll('li');

    const selectedPriority = document.querySelector('#priorityFilterSelect') ? document.querySelector('#priorityFilterSelect').value : 'all';
    const selectedDueDateRaw = document.querySelector('#dueDateFilterInput') ? document.querySelector('#dueDateFilterInput').value : '';
    const selectedCategory = document.querySelector('#categoryFilterInput') ? document.querySelector('#categoryFilterInput').value.toLowerCase().trim() : '';

    const selectedDueDate = selectedDueDateRaw ? new Date(selectedDueDateRaw) : null;
    if (selectedDueDate) {
        selectedDueDate.setHours(23, 59, 59, 999);
    }

    let anyFilterActive = (selectedPriority !== 'all' || selectedDueDate !== null || selectedCategory !== '');

    if (!anyFilterActive && allTasks.length > 0) {
        allTasks.forEach(listItem => {
            listItem.style.display = '';
        });
        const currentlySelected = document.querySelector('.selected');
        if (currentlySelected) {
            currentlySelected.classList.remove('selected');
        }
        if (allTasks.length === 0 && placeholder) {
            placeholder.style.display = 'block';
        } else if (placeholder) {
            placeholder.style.display = 'none';
        }
        return;
    }

    allTasks.forEach(listItem => {
        const taskData = listItem.dataset.task;
        if (!taskData) {
            listItem.style.display = 'none';
            return;
        }

        let task;
        try {
            task = JSON.parse(taskData);
        } catch (e) {
            console.error("Error parsing task data-attribute:", taskData, e);
            listItem.style.display = 'none';
            return;
        }

        let isVisible = true;

        if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
            isVisible = false;
        }

        if (isVisible && selectedDueDate) {
            const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;
            if (taskDueDate) {
                taskDueDate.setHours(23, 59, 59, 999);
                if (taskDueDate > selectedDueDate) {
                    isVisible = false;
                }
            } else {
                isVisible = false;
            }
        }

        if (isVisible && selectedCategory !== '') {
            const taskCategoryLower = task.category ? task.category.toLowerCase().trim() : '';
            if (!taskCategoryLower.includes(selectedCategory)) {
                isVisible = false;
            }
        }

        if (isVisible) {
            listItem.style.display = '';
        } else {
            listItem.style.display = 'none';
            if (listItem.classList.contains('selected')) {
                listItem.classList.remove('selected');
            }
        }
    });

    const visibleTasksInDOM = Array.from(allTasks).filter(item => item.style.display !== 'none');
    if (visibleTasksInDOM.length === 0 && placeholder) {
        placeholder.style.display = 'block';
    } else if (placeholder) {
        placeholder.style.display = 'none';
    }
}

function sortTasksByDate(tasks) {
    return tasks.sort((a,b) => {
        //If a task has no due date it will appear at the end of the list
        if (!a.dueDate && !b.dueDate) return 0; // both have no date so order doesnt matter
        if (!a.dueDate) return 1;               // a has no date so b comes first
        if (!b.dueDate) return -1;              // b has no date so a comes first

        //If both tasks have a due date, compare them directly
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
}