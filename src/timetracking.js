class TaskTracker {
  constructor() {
    // Initialize an empty array to store tasks
    this.tasks = this.getFromLocalStorage() ?? [];
    this.saveToLocalStorage()

  }

  startTask(taskName, h, m) {
    // console.log("startTask", taskName, h, m)
    // Create a new task object with start time and name
    const newTask = {
      name: taskName,
      startTime: Date.now() - (h * 3600000) - (m * 60000) - (0 * 1000),
      pausedTime: 0,
      elapsedTime: 0,
      savedTime: 0,
      status: 'In Progress'
    };

    // Add the task to the tasks array
    if (!this.getTask(taskName)) {
      this.tasks.push(newTask);
    } else {
      // console.log('task', this.tasks[this.getTaskIndex(taskName)], newTask)
      this.tasks[this.getTaskIndex(taskName)] = newTask
    }
    this.saveToLocalStorage()
  }
  pauseTask(taskName) {
    // Find the task in the tasks array with the matching name
    const task = this.tasks.find(task => task.name === taskName);
    
    if (task) {
      task.status = 'Paused';
      // Calculate the paused time and add it to the task object
      task.pausedTime += Date.now() - task.startTime - task.pausedTime;
    }
    this.saveToLocalStorage()

  }
  resumeTask(taskName) {
    // Find the task in the tasks array with the matching name
    const task = this.tasks.find(task => task.name === taskName);
    if (task.status) {
      task.status = 'In Progress';
    }

    if (task) {
      // Update the start time and elapsed time for the task
      task.startTime = Date.now() - task.pausedTime;
      task.elapsedTime += task.pausedTime;
      task.pausedTime = 0;
    }
    this.saveToLocalStorage()

  }
  removeTask(taskName) {
    console.log(this.getTaskIndex(taskName))
    this.tasks.splice(this.getTaskIndex(taskName), 1);
    this.saveToLocalStorage()

  }
  getTaskIndex(taskName) {
    return this.tasks.findIndex(x => x.name == taskName);
  }
  getTask(taskName) {
    return this.tasks.filter(x => x.name == taskName)[0]
  }
  ts2(timestamp) {
    const hours = Math.floor(timestamp / 3600000);
    const minutes = Math.floor((timestamp % 3600000) / 60000);
    const seconds = Math.floor((timestamp % 60000) / 1000);

    return {hours,minutes,seconds};
    // return `${hours}h ${minutes}m ${seconds}s`;
  }
  getTimeTracked(taskName) {
    // Find the task in the tasks array with the matching name
    const task = this.tasks.find(task => task.name === taskName);
    // console.log(task,">>>>>>>>",taskName,this.tasks)
    if (task && task.status === "In Progress") {
      // Calculate the elapsed time (including paused time)
      const elapsed = Date.now() - task.startTime - task.pausedTime;
      // Format the elapsed time as hours, minutes, and seconds
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      return {hours,minutes,seconds};

      // return `${hours}h ${minutes}m ${seconds}s`;
    } else {
      const hours = Math.floor(0 / 3600000);
      const minutes = Math.floor((0 % 3600000) / 60000);
      const seconds = Math.floor((0 % 60000) / 1000);
      return {hours,minutes,seconds};
    }
  }
  getTotalTimeToday() {
    // Get the current date
    const today = new Date().toLocaleDateString();

    // Filter tasks to only include those started today
    const todayTasks = this.tasks.filter(task => new Date(task.startTime).toLocaleDateString() === today);
    // const todayTasks = this.tasks.filter(task => {
    //   const isToday = new Date(task.startTime).toLocaleDateString() === today;
    //   const isInProgress = task.status === "In Progress";
    //   return isToday && isInProgress;
    // });
    // Calculate the total elapsed time for today's tasks
    const totalElapsed = todayTasks.reduce((acc, task) => {
      return acc + (Date.now() - task.startTime - task.pausedTime);
    }, 0);
    // Calculate the hours, minutes, and seconds from the total elapsed time
    const hours = Math.floor(totalElapsed / 3600000);
    const minutes = Math.floor((totalElapsed % 3600000) / 60000);
    const seconds = Math.floor((totalElapsed % 60000) / 1000);
    // Return the total elapsed time as an object with hours, minutes, and seconds properties
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  // getTotalTimeToday() {
  //   // Get the current date
  //   const today = new Date().toLocaleDateString();

  //   // Filter tasks to only include those started today
  //   const todayTasks = this.tasks.filter(task => {
  //     const isToday = new Date(task.startTime).toLocaleDateString() === today;
  //     if (isToday) {
  //       if (task.status === "In Progress") {
  //         return true;
  //       } else {
  //         return task.pausedTime > 0;
  //       }
  //     }
  //     return false;
  //   });

  //   // Calculate the total elapsed time for today's tasks
  //   const totalElapsed = todayTasks.reduce((acc, task) => {
  //     if (task.status === "In Progress") {
  //       return acc + (Date.now() - task.startTime);
  //     } else {
  //       return acc + task.pausedTime;
  //     }
  //   }, 0);

  //   // Calculate the hours, minutes, and seconds from the total elapsed time
  //   const hours = Math.floor(totalElapsed / 3600000);
  //   const minutes = Math.floor((totalElapsed % 3600000) / 60000);
  //   const seconds = Math.floor((totalElapsed % 60000) / 1000);

  //   // Return the total elapsed time as an object with hours, minutes, and seconds properties
  //   return `${hours}h ${minutes}m ${seconds}s`;
  // }
  toggle(taskName, h, m) {
    console.log("startTask", taskName, h, m, this.getTask(taskName))

    if (this.getTask(taskName)) {
      // this.resumeTask(taskName);
      this.startTask(taskName, h, m)

    } else {
      this.startTask(taskName, h, m)
    }
  }
  saveToLocalStorage() {
    // localStorage.setItem("tasks", JSON.stringify(this.tasks))
  }
  getFromLocalStorage() {
    let data = localStorage.getItem("tasks");
    return JSON.parse(data);
  }
  clear() {
    localStorage.removeItem("tasks")
  }
}
