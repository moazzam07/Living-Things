import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import './dashboard.css';
import Tasks from "../Tasks/tasks";
import { useAuth } from "../../authProvider";
import * as XLSX from 'xlsx';

const BASE_URL = "http://localhost:8000/api";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalShow, setIsModalShow] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [effort, setEffort] = useState('');
  const [dueDate, setDueDate] = useState('');
  const { logout } = useAuth();
  const { refresh_access_token } = useAuth();

  const fileInputRef = useRef(null);

  const fetchTasks = () => {
    axios
      .get(`${BASE_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      .then((res) => {
        setTasks(res.data);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          refresh_access_token();
          fetchTasks();
        } else {
          alert(err.response?.data?.detail || "Failed to fetch tasks");
        }
      });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  function handleSave() {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    axios.post(`${BASE_URL}/tasks`, {
      title,
      description,
      effort,
      due_date: dueDate,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    })
    .then((res) => {
      setTasks([...tasks, res.data]);
      setIsModalShow(false);
      setTitle('');
      setDescription('');
      setEffort('');
      setDueDate('');

    })  
    .catch((err) => {
      if (err.response?.status === 401) {
        refresh_access_token();
      }
      console.log(err);
      alert(err.response?.data?.detail || "Failed to create task");
    })
  }


  function onTaskDelete(id) {

    axios.delete(`${BASE_URL}/tasks/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    })
    .then((res) => {
      console.log(res.data);
      setTasks(res.data);
    })
    .catch((err) => {
      if (err.response?.status === 401) {
        refresh_access_token();
      }
      alert(err.response?.data?.detail || "Failed to delete task");
    })
  }

  function handleExport() {
    // Prepare data for Excel
    const exportData = tasks.map(task => ({
      'title': task.title,
      'description': task.description,
      'effort': task.effort,
      'due_date': task.due_date
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tasks");

    XLSX.writeFile(wb, "tasks.xlsx");
  }

  function logoutUser() {
    logout(localStorage.getItem('token'));
  }
  function handleImportClick() {
    fileInputRef.current.click();
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        axios.post(`${BASE_URL}/tasks/import`, {
          file: event.target.result
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'multipart/form-data'
          },
        })
        .then((res) => {
          setTasks([...tasks, res.data]);
          fetchTasks();
          alert('Tasks imported successfully!');
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            refresh_access_token();
          }
          alert(err.response?.data?.detail || "Failed to import tasks");
        });
      } catch (error) {
        alert('Error reading file. Please make sure it is a valid Excel file.');
        console.error('Import error:', error);
      }
    };

    reader.readAsArrayBuffer(file); // Read as ArrayBuffer for Excel files
  }

  return (
    <>
     <nav className="navbar">
        <span className="nav-header">Welcome {localStorage.getItem('user_name')}!!!</span>
        <div className="navbar-buttons">
          <button className="save-btn" onClick={() => setIsModalShow(true)}>Add Task</button>
          <button className="save-btn" onClick={handleExport}>Export</button>
          <button className="save-btn" onClick={handleImportClick}>Import</button>
          <input
            type="file"
            accept=".xlsx"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button onClick={logoutUser}>Logout</button>
        </div>
      </nav>

      <div className="task-list">
        {!tasks || tasks.length === 0 ? (
          <p className="empty-msg">No tasks yet!</p>
        ) : (
          tasks.map((task) => (
            <Tasks
              key={task.id}
              task={task}
              refresh_access_token={refresh_access_token}
              onTaskDelete={() => onTaskDelete(task.id)}
              fetchTasks={fetchTasks}
            />
          ))
        )}
      </div>

      {isModalShow && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={() => setIsModalShow(false)}>✖</button>
            <h2>Add Task</h2>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task Title" required />
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
              <input type="number" value={effort} onChange={e => setEffort(e.target.value)} placeholder="Effort (Days)" required />
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
              <button type="submit" className="save-btn" onClick={handleSave}>Save Task</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
