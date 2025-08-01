//constants

//Grab all buttons and input boxes
const addTaskButton = document.querySelector('#addTaskButton');
const addTaskFormFields = document.querySelector('#addTaskFormFields');
const taskTextBox = document.querySelector('#taskTextBox');
const taskDueDate = document.querySelector('#taskDueDate');
const taskPriority = document.querySelector('#taskPriority');
const taskCategory = document.querySelector('#taskCategory');
const confirmAddTaskButton = document.querySelector('#confirmAddTaskButton');
const cancelAddTaskButton = document.querySelector('#cancelAddTaskButton');

//Buttons for deleting and updating tasks
const deleteTaskButton = document.querySelector('#deleteTaskButton');
const taskList = document.querySelector('#taskList');
const placeholder = document.querySelector('main p');
const updateTaskButton = document.querySelector('#updateTaskButton');

//Elements for searching through tasks
const searchInput = document.querySelector('#searchInput');
const mainContent = document.querySelector('.main-content');

//Buttons and special div for filtering tasks
const filterByDateButton = document.querySelector('#filterByDateButton');
const filterByPriorityButton = document.querySelector('#filterByPriorityButton');
const filterByCategoryButton = document.querySelector('#filterByCategoryButton');
const filterOptionsDiv = document.querySelector('.filter-options');