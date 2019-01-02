import React, { Component } from 'react';
import update, { extend } from 'immutability-helper';
// import logo from './logo.svg';
import './App.css';

function Input(parent, name, props) {
  return (
    <input
      {...props}
      onChange={(ev) => parent.setState({[name]: ev.target.value})}
      value={parent.state[name]}
    ></input>
  )
}

class TaskList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      // tasks: [],
      newTaskName: "",
    }
  }
  addTask() {
    if (!!this.state.newTaskName && this.state.newTaskName.trim().length > 0) {
      this.props.onAddTask(this.props.i, this.state.newTaskName)
      this.setState({newTaskName: ""})
    }
  }
  render(props) {
    let i = this.props.i
    return (
      <div className="TaskList" ref={(el) => this.props.registerScrollElement(el)}>
        <input
          className='TaskList-name'
          onChange={(ev) => this.props.onSetTaskListName(i, ev.target.value)}
          value={this.props.name}
        ></input>
        <ul>{this.props.tasks.map((t, j) =>
          (t===null?null:
            <li>
              <input
                id={`cb-task-${i}-${j}`}
                type="checkbox"
                checked={t.done}
                onChange={(ev) => this.props.onSetTask(i, j, ev.target.checked)}
              ></input>
              <label for={`cb-task-${i}-${j}`}></label>
              <input
                className='TaskList-name'
                onChange={(ev) => this.props.onSetTaskName(i, j, ev.target.value)}
                onBlur={(ev) => this.props.onMaybeRemoveTask(i, j)}
                value={t.name}
              ></input>
            </li>
          )
        )}</ul>
        {Input(this, 'newTaskName')}
        <button onClick={() => this.addTask()}>add</button>
        <button onClick={() => this.props.onClearTasks(i)}>clear</button>
        <div className="TaskList-nav">
          <button onClick={() => this.props.onScrollTo(i - 1)}>&lt;</button>
          <button onClick={() => this.props.onScrollTo(i + 1)}>&gt;</button>
        </div>
      </div>
    )
  }
}

class Carousel extends Component {
  constructor(props) {
    super(props)
    this.state = {
      taskListCount: props.taskLists.length,
    }
    this.elements = []
  }
  render() {
    let taskLists = []
    for (let i=0; i<this.props.taskLists.length; i++) {
      let list = this.props.taskLists[i]
      let tl = (
        <TaskList
          i={i} name={list.name}
          tasks={list.tasks}
          onAddTask={this.props.onAddTask}
          onSetTask={this.props.onSetTask}
          onSetTaskListName={this.props.onSetTaskListName}
          onSetTaskName={this.props.onSetTaskName}
          onClearTasks={this.props.onClearTasks}
          onMaybeRemoveTask={this.props.onMaybeRemoveTask}
          registerScrollElement={(el) => this.elements[i] = el}
          onScrollTo={(j) => {
            if (!!this.elements[j]) {
              this.elements[j].scrollIntoView({behavior: "smooth"})
            } else {
              console.warn(j, this.elements[j])
            }
          }}
        >
        </TaskList>
      )
      taskLists.push(tl)
    }
    return (
      <div className="Row">
        <div className="Row-contents">
          {taskLists}
        </div>
      </div>
    )
  }
}

class App extends Component {
  constructor() {
    super()
    let state
    let data = localStorage.getItem("data")
    if (!!data) state = JSON.parse(data)
    this.state = state || {
      taskLists: [],
    }
  }
  componentDidUpdate() {
    localStorage.setItem("data", JSON.stringify(this.state))
  }
  addTaskList() {
    let newList = {
      name: `New List ${this.state.taskLists.length + 1}`,
      tasks: [
        // {name: 'task', done: false},
      ],
    }
    this.setState({taskLists: [...this.state.taskLists, newList]})
  }
  addTask(i, newTaskName) {
    let state = update(this.state, {
      taskLists: {
        [i]: {tasks: {$push: [{name: newTaskName, done: false}]}},
      }
    })
    this.setState(state)
  }
  setTask(i, j, done) {
    let task = {...this.state.taskLists[i].tasks[j], done}
    let state = update(this.state, {
      taskLists: {
        [i]: {tasks: {[j]: {$set: task}}},
      }
    })
    this.setState(state)
  }
  setTaskName(i, j, name) {
    let task = {...this.state.taskLists[i].tasks[j], name}
    let state = update(this.state, {
      taskLists: {
        [i]: {tasks: {[j]: {$set: task}}},
      }
    })
    this.setState(state)
  }
  maybeRemoveTask(i, j) {
    let task = this.state.taskLists[i].tasks[j]
    if (!task.name || task.name.trim() === "") {
      let state = update(this.state, {
        taskLists: {
          [i]: {tasks: {$unset: [j]}},
        }
      })
      this.setState(state)
    }
  }
  setTaskListName(i, name) {
    let state = update(this.state, {
      taskLists: {
        [i]: {name: {$set: name}},
      }
    })
    this.setState(state)
  }
  clearTasks(i) {
    let state = update(this.state, {})
    for (let j=0; j<this.state.taskLists[i].tasks.length; j++) {
      let task = this.state.taskLists[i].tasks[j]
      if (!!task && !!task.name) {
        task = {...task, done: false}
        state = update(state, {
          taskLists: {
            [i]: {tasks: {[j]: {$set: task}}},
          }
        })
      }
    }
    this.setState(state)
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          Cheqee
        </header>
        <Carousel
          onAddTask={this.addTask.bind(this)}
          onSetTask={this.setTask.bind(this)}
          onSetTaskListName={this.setTaskListName.bind(this)}
          onSetTaskName={this.setTaskName.bind(this)}
          onMaybeRemoveTask={this.maybeRemoveTask.bind(this)}
          onClearTasks={this.clearTasks.bind(this)}
          taskLists={this.state.taskLists}
        ></Carousel>
        
        <button onClick={() => this.addTaskList()}>+</button>
      </div>
    );
  }
}

export default App;
