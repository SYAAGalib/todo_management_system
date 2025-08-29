import React from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Task } from '../types';

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export default function TaskTable({ tasks, onEdit, onDelete, onToggleComplete }: TaskTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lists</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onToggleComplete(task.id)}
                  className={`${
                    task.isComplete ? 'text-green-600' : 'text-gray-400'
                  } hover:text-green-800`}
                >
                  {task.isComplete ? <CheckCircle size={20} /> : <XCircle size={20} />}
                </button>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{task.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {format(new Date(task.deadline), 'MMM dd, yyyy')}
                </div>
              </td>
              <td className="px-6 py-4">
                <ul className="text-sm text-gray-900">
                  {task.lists.map((list, index) => (
                    <li key={list.id}>{list.text}</li>
                  ))}
                </ul>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(task)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}