// Seletores
const taskInput = document.getElementById("task");
const addTaskButton = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("search");
const toggleThemeButton = document.getElementById("toggleTheme");
const filters = document.querySelectorAll(".filters button");
const progressBar = document.getElementById("progress");

// Lista de Tarefas
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Salvar Tarefas no localStorage
const saveTasks = () => localStorage.setItem("tasks", JSON.stringify(tasks));

// Alternar Tema com Mudança de Imagem de Fundo
toggleThemeButton.addEventListener("click", () => {
  const isDarkTheme = document.body.dataset.theme === "dark";
  document.body.dataset.theme = isDarkTheme ? "light" : "dark";

  // Alterar a imagem de fundo
document.body.style.backgroundImage = isDarkTheme
  ? "url('./claro.jpg')" // Caminho da imagem para o tema claro
  : "url('./escuro.jpg')"; // Caminho da imagem para o tema escuro

// Atualizar Barra de Progresso
const updateProgress = () => {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const progressValue = tasks.length
    ? (completedTasks / tasks.length) * 100
    : 0;
  progressBar.value = progressValue;
};

// Adicionar Nova Tarefa
const addTask = () => {
  const taskText = taskInput.value.trim();
  if (!taskText) return alert("A tarefa não pode estar vazia!");

  if (tasks.some((task) => task.text === taskText)) {
    return alert("Esta tarefa já existe!");
  }

  tasks.push({ text: taskText, completed: false });
  saveTasks();
  renderTasks();
  updateProgress();
  taskInput.value = "";
};

// Renderizar Tarefas no DOM
const renderTasks = (filter = "all") => {
  taskList.innerHTML = "";
  const filteredTasks = tasks.filter((task) =>
    filter === "completed"
      ? task.completed
      : filter === "pending"
        ? !task.completed
        : true,
  );

  filteredTasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed" : "";

    const span = document.createElement("span");
    span.textContent = task.text;
    li.appendChild(span);

    const completeButton = document.createElement("button");
    completeButton.textContent = task.completed ? "Reabrir" : "Concluir";
    completeButton.addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks(filter);
      updateProgress();
    });
    li.appendChild(completeButton);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Excluir";
    deleteButton.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks(filter);
      updateProgress();
    });
    li.appendChild(deleteButton);

    taskList.appendChild(li);
  });

  updateProgress();
};

// Filtros de Tarefas (Todas, Pendentes, Concluídas)
filters.forEach((filter) =>
  filter.addEventListener("click", () => {
    filters.forEach((btn) => btn.classList.remove("active"));
    filter.classList.add("active");
    renderTasks(filter.id.replace("filter", "").toLowerCase());
  }),
);

// Buscar Tarefas
searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredTasks = tasks.filter((task) =>
    task.text.toLowerCase().includes(searchTerm),
  );
  taskList.innerHTML = "";
  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.textContent = task.text;
    taskList.appendChild(li);
  });
});

// Exportar Tarefas como Arquivo .txt
const exportTasksButton = document.createElement("button");
exportTasksButton.textContent = "Exportar Tarefas";
exportTasksButton.style.marginTop = "10px";
document.querySelector(".container").appendChild(exportTasksButton);

exportTasksButton.addEventListener("click", () => {
  const text = tasks
    .map(
      (task) => `${task.text} - ${task.completed ? "Concluída" : "Pendente"}`,
    )
    .join("\n");
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "tarefas.txt";
  a.click();
});

// Eventos
addTaskButton.addEventListener("click", addTask);
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

// Renderizar Tarefas ao Carregar
renderTasks();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((registration) => {
        console.log("Service Worker registrado com sucesso:", registration);
      })
      .catch((error) => {
        console.log("Falha ao registrar o Service Worker:", error);
      });
  });
}
