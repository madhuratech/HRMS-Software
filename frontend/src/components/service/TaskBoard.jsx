import React, { useState } from 'react';
import { MoreHorizontal, Plus, Filter, Clock } from 'lucide-react';
import { MOCK_TASKS } from '../../lib/mockData';
import { cn } from '../../lib/utils';
import { NewJobModal } from './NewJobModal';
import { TaskDetailsModal } from './TaskDetailsModal';
import { useToast } from '../ui/Toast';

export function TaskBoard() {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { addToast } = useToast();

  const handleUpdateTask = (updatedTask) => {
    setTasks(tasks.map((t) => t.id === updatedTask.id ? updatedTask : t));
    addToast(`Job card updated: ${updatedTask.vehicleModel}`, 'success');
    setSelectedTask(null);
  };

  const handleNewJob = (data) => {
    const newTask = {
      id: Math.random().toString(36).substr(2, 6),
      customerName: data.customerName,
      vehicleModel: data.vehicleModel,
      issue: data.issue,
      status: 'PENDING',
      assignedTo: data.assignedTo,
      date: data.date
    };
    // @ts-ignore
    setTasks([newTask, ...tasks]);
    addToast('New job card created', 'success');

    // Create a notification for the assigned staff
    if (data.assignedTo && data.assignedTo !== 'unassigned') {
      const notification = {
        id: Date.now().toString(),
        type: 'TASK_ASSIGNED',
        message: `New task assigned: ${data.vehicleModel} - ${data.issue}`,
        timestamp: new Date().toISOString(),
        read: false,
        data: newTask
      };

      // Store in localStorage for the prototype to pick up in StaffDashboard
      const existingnotes = JSON.parse(localStorage.getItem(`notifications_${data.assignedTo}`) || '[]');
      localStorage.setItem(`notifications_${data.assignedTo}`, JSON.stringify([notification, ...existingnotes]));

      // Also trigger a window event for immediate updates if on the same page
      window.dispatchEvent(new Event('storage'));
    }
  };

  const columns = [
  { id: 'PENDING', label: 'Pending', color: 'bg-orange-500' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500' },
  { id: 'COMPLETED', label: 'Completed', color: 'bg-green-500' }];


  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <NewJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewJob} />
      

      {selectedTask &&
      <TaskDetailsModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleUpdateTask} />

      }
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            
            <Plus size={16} /> New Job Card
          </button>
          <div className="h-8 w-px bg-slate-200"></div>
          <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 h-full min-w-[1000px]">
          {columns.map((col) =>
          <div key={col.id} className="flex-1 bg-slate-50 rounded-xl p-4 flex flex-col border border-slate-200">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", col.color)}></div>
                  <h3 className="font-bold text-slate-700">{col.label}</h3>
                  <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                    {tasks.filter((t) => t.status === col.id).length}
                  </span>
                </div>
                <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3">
                {tasks.filter((t) => t.status === col.id).map((task) =>
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group">
                
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-400">#JOB-{task.id.toUpperCase()}</span>
                      <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-all">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1">{task.vehicleModel}</h4>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.issue}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          {task.assignedTo.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-500">{task.customerName}</span>
                      </div>
                      
                      {col.id !== 'COMPLETED' &&
                  <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          <Clock size={12} />
                          <span>2h left</span>
                        </div>
                  }
                    </div>
                  </div>
              )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>);

}