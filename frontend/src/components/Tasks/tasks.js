import React, { useState } from 'react';
import axios from 'axios';

const BASE_URL = "http://localhost:8000/api";   

const Tasks = ({ task, onTaskDelete, refresh_access_token, fetchTasks }) => {
  const [showModal, setShowModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description,
    effort: task.effort,
    due_date: task.due_date
  })

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    axios.patch(`${BASE_URL}/tasks/${task.id}`, editedTask, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    })
    .then(() => {
        fetchTasks();
    })
    .catch((err) => {
      if (err.response?.status === 401) {
        alert(err.response?.data?.detail);
        refresh_access_token();
      }
      alert(err.response?.data?.detail || "Failed to update task");
    })
    setEditModal(false);
  }
  
  return (
    <div className="task-item">
      <div className='task-content'>
        <span className='task-header'>{task.title}</span>
        <div className="task-actions">
          <i className="fa-solid fa-pen-to-square fa-lg edit-task" onClick={() => setEditModal(true)}></i>
          <i className="fa-solid fa-eye fa-lg show-task" onClick={() => setShowModal(true)}></i>
        </div>
      </div>
      <hr/>
      <span className='task-desc'>{task.description}</span>
      <div className="task-footer">
        <button className="delete-task" onClick={onTaskDelete}>Delete</button>
      </div>
      
      {showModal &&
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={() => setShowModal(false)}>✖</button>
            <span className='modal-header'>{task.title}</span>
            <hr/>
            <p className="task-description">{task.description}</p>
            <p className="task-effort">Effort (Days): {task.effort}</p>
            <p className="task-due-date">Due Date: {task.due_date}</p>
          </div>
        </div>    
      }

      {editModal &&
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={() => setEditModal(false)}>✖</button>
            <span className='modal-header'>Edit Task</span>
            <hr/>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editedTask.title}
                  onChange={handleEditChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={editedTask.description}
                  onChange={handleEditChange}
                  rows="4"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="effort">Effort (Days)</label>
                <input
                  type="number"
                  id="effort"
                  name="effort"
                  value={editedTask.effort}
                  onChange={handleEditChange}
                  min="1"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="due_date">Due Date</label>
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={editedTask.due_date}
                  onChange={handleEditChange}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setEditModal(false)}>Cancel</button>
                <button type="submit" onClick={handleEditSubmit} className="save-btn">Save Changes</button>
              </div>
          </div>
        </div>
      }
    </div>
  );
};

export default Tasks;