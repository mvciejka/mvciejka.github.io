class TODO {
  constructor() {
    this.tasks = this.loadTasks();
    this.validationStatus = Object.freeze({
      VALID: "valid",
      USER_CHOICE: "user_choice",
      INVALID: "invalid"
    });
    this.draw();
  }

  // ===============================================================================
//                  draw - wyświetlanie listy zadań
//  ===============================================================================
  draw(tasks = []) {
    if (Array.isArray(tasks) && tasks.length === 0)
      tasks = this.tasks;
    let taskList = document.getElementById("task-list");
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
      let taskRow = document.createElement("tr");
      taskRow.id = `task-${task.id}`;

      let taskTextCell = document.createElement("td");
      let taskTextSpan = document.createElement("span");
      if (task.highlight)
        taskTextSpan.append(this.highlight(task.text, task.highlight));
      else
        taskTextSpan.textContent = task.text;
      taskTextSpan.addEventListener("click", () => this.startEditing(task.id));
      taskTextCell.appendChild(taskTextSpan);
      taskTextCell.classList = "task-title";
      taskRow.appendChild(taskTextCell);

      let taskDateCell = document.createElement("td");
      let taskDateSpan = document.createElement("span");
      taskDateSpan.textContent = task.date;
      taskDateSpan.addEventListener("click", () => this.startEditing(task.id));
      taskDateCell.appendChild(taskDateSpan);
      taskDateCell.classList = "task-date";
      taskRow.appendChild(taskDateCell);

      let deleteButtonCell = document.createElement("td");
      deleteButtonCell.classList = "buttons";
      let deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.onclick = () => this.deleteTask(task.id);
      deleteButtonCell.appendChild(deleteButton);
      taskRow.appendChild(deleteButtonCell);

      taskList.appendChild(taskRow);
    });
  }

// ===============================================================================
//           validateTaskInput - walidacja nazwy i daty zadania
//  ===============================================================================
  validateTaskInput(taskInput, taskDate) {
    const result = {
      status: this.validationStatus.VALID,
      message: ""
    }

    if (!taskDate) {
      result.status = this.validationStatus.USER_CHOICE;
      result.message = "Nie wybrano daty. Czy chcesz kontynuować bez daty?";
    }

    if (taskDate && taskDate < new Date().toISOString().split("T")[0]) {
      result.status = this.validationStatus.INVALID;
      result.message = "Data zadania nie może być wcześniejsza niż dzisiejsza data!";
    }

    if (taskInput.length < 3 || taskInput.length > 255) {
      result.status = this.validationStatus.INVALID;
      result.message = "Nazwa zadania musi mieć od 3 do 255 znaków!";
    }

    if (taskInput === "") {
      result.status = this.validationStatus.INVALID;
      result.message = "Nazwa zadania nie może być pusta!";
    }

    return result;
  }

// ===============================================================================
//                  loadTasks - wczytuje zadania z localStorage
//  ===============================================================================
  loadTasks() {
    const tasks = localStorage.getItem("tasks");
    return tasks ? JSON.parse(tasks) : [];
  }

// ===============================================================================
//       newTask - dodaje nowe zadanie do listy i aktualizuje localStorage
//  ===============================================================================
  newTask() {
    let taskInput = document.getElementById("new-task-input");
    let taskDate = document.getElementById("new-task-date");

    const validation = this.validateTaskInput(taskInput.value.trim(), taskDate.value);
    if (validation.status === this.validationStatus.INVALID) {
      alert(validation.message);
      return;
    }
    if (validation.status === this.validationStatus.USER_CHOICE) {
      const userChoice = confirm(validation.message);
      if (!userChoice) {
        return;
      }
    }

    let task = {
      id: Date.now(),
      text: taskInput.value.trim(),
      date: taskDate.value
    };
    this.tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(this.tasks));

    taskInput.value = "";
    taskDate.value = "";
    this.draw();
  }

// ===============================================================================
//           deleteTask - usuwa zadanie z listy i aktualizuje localStorage
//  ===============================================================================
  deleteTask(taskId) {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
    this.draw();
  }

  // ===============================================================================
  //           editTask - edycja zadania i akutalizacja localStorage
  //  ===============================================================================
  editTask(taskId) {
    let taskInput = document.getElementById("edit-task-input");
    let taskDate = document.getElementById("edit-task-date");
    const validation = this.validateTaskInput(taskInput.value.trim(), taskDate.value);
    if (validation.status === this.validationStatus.INVALID) {
      alert(validation.message);
      return;
    }
    if (validation.status === this.validationStatus.USER_CHOICE) {
      const userChoice = confirm(validation.message);
      if (!userChoice) {
        return;
      }
    }

    let task = this.tasks.find(task => task.id === taskId);
    task.text = taskInput.value.trim();
    task.date = taskDate.value;
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
    this.stopEditing();
  }

  // ===============================================================================
  //           startEditing - zmiana spanów na inputy i dodanie przycisku zapisu
  //  ===============================================================================
  startEditing(taskId) {
    const oldTask = this.tasks.find(task => task.id === taskId);
    const oldTaskRow = document.getElementById(`task-${taskId}`);

    let taskInput = document.createElement("input");
    taskInput.id = "edit-task-input"
    taskInput.type = "text";
    taskInput.value = oldTask.text;
    let textSpan = oldTaskRow.getElementsByClassName("task-title")[0].querySelector("span");
    textSpan.replaceWith(taskInput);

    let taskDate = document.createElement("input");
    taskDate.id = "edit-task-date"
    taskDate.type = "date";
    taskDate.value = oldTask.date;
    let dateSpan = oldTaskRow.getElementsByClassName("task-date")[0].querySelector("span");
    dateSpan.replaceWith(taskDate);


    let editButton = document.createElement("button");
    editButton.id = "edit-task";
    editButton.textContent = "save";
    editButton.addEventListener("click", () => this.editTask(taskId));
    let buttonsTd = oldTaskRow.getElementsByClassName("buttons")[0];
    buttonsTd.prepend(editButton);

    this.outsideClickHandler = (e) => {
      if (!oldTaskRow.contains(e.target)) {
        this.stopEditing();
      }
    };

    // setTimeout, żeby to samo kliknięcie, które włączyło edycję,
    // nie dotarło do dokumentu i od razu jej nie wyłączyło
    setTimeout(() => document.addEventListener("click", this.outsideClickHandler));

  }

  // ===============================================================================
  //           stopEditing - powrót do widoku wyświetlania zadań
  //  ===============================================================================
  stopEditing(taskId) {
    this.tasks = this.loadTasks();
    if (this.outsideClickHandler) {
      document.removeEventListener("click", this.outsideClickHandler);
      this.outsideClickHandler = null;
    }
    this.draw();
  }

// ===============================================================================
  //      searchFilter - filtrowanie wyników wyszukiwania
  //  ===============================================================================
  searchFilter() {
    let zawartosc = document.getElementById("search").value.toLowerCase();
    let tasks = [];
    if (zawartosc.length >= 2) {
      tasks = this.tasks;
      tasks = tasks.filter(task => task.text.toLowerCase().includes(zawartosc)).map(task => ({
        ...task,
        highlight: zawartosc
      }));

      if (Array.isArray(tasks) && tasks.length === 0)
        tasks = [{text: "Nie znaleziono pasujących zadań.", date: "", id: ""}];
    }
    this.draw(tasks);

  }

  highlight(text, phrase) {
    const fragment = document.createDocumentFragment();

    const lowerText = text.toLowerCase();
    let start = 0;
    let index;

    while ((index = lowerText.indexOf(phrase, start)) !== -1) {
      fragment.append(text.slice(start, index));

      const mark = document.createElement("mark");
      mark.textContent = text.slice(index, index + phrase.length);
      fragment.append(mark);

      start = index + phrase.length;
    }

    fragment.append(text.slice(start));
    return fragment;
  }
}

// ===============================================================================
//
//                  Koniec definicji klasy TODO + inicjalizacja
//
//  ===============================================================================
const todo = new TODO();
document.getElementById("add-task").addEventListener("click", () => todo.newTask());
document.getElementById("search").addEventListener("input", () => todo.searchFilter());
