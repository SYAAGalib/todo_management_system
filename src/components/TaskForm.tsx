import React, { useState } from 'react';
import { Plus, Minus, Save } from 'lucide-react';
import { Task, TaskList } from '../types';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id'>) => void;
  initialTask?: Task;
  onCancel?: () => void;
}

export default function TaskForm({ onSubmit, initialTask, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [isComplete, setIsComplete] = useState(initialTask?.isComplete || false);
  const [deadline, setDeadline] = useState(initialTask?.deadline || '');
  const [lists, setLists] = useState<TaskList[]>(
    initialTask?.lists || [{ id: '1', text: '' }]
  );

  const handleAddList = () => {
    if (lists.every(list => list.text.trim() !== '')) {
      setLists([...lists, { id: Date.now().toString(), text: '' }]);
    }
  };

  const handleRemoveList = (id: string) => {
    setLists(lists.filter(list => list.id !== id));
  };

  const handleListChange = (id: string, text: string) => {
    setLists(lists.map(list => 
      list.id === id ? { ...list, text } : list
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      isComplete,
      deadline,
      lists: lists.filter(list => list.text.trim() !== '')
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={isComplete}
          onChange={(e) => setIsComplete(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">Complete</label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Deadline</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Lists</label>
        {lists.map((list, index) => (
          <div key={list.id} className="flex gap-2">
            <input
              type="text"
              value={list.text}
              onChange={(e) => handleListChange(list.id, e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter list item"
            />
            {lists.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveList(list.id)}
                className="p-2 text-red-600 hover:text-red-800"
              >
                <Minus size={20} />
              </button>
            )}
            {index === lists.length - 1 && (
              <button
                type="button"
                onClick={handleAddList}
                className="p-2 text-blue-600 hover:text-blue-800"
                disabled={!list.text.trim()}
              >
                <Plus size={20} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Save size={16} />
          {initialTask ? 'Update' : 'Create'} Task
        </button>
      </div>
    </form>
  );
}