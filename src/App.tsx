import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import TaskForm from './components/TaskForm';
import TaskTable from './components/TaskTable';
import Auth from './components/Auth';
import { Task, SortOption } from './types';
import { supabase } from './lib/supabase';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('index');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchTasks();
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchTasks();
      } else {
        setTasks([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchTasks() {
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          is_complete,
          deadline,
          task_lists (
            id,
            text
          )
        `)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      const formattedTasks: Task[] = tasksData.map(task => ({
        id: task.id,
        title: task.title,
        isComplete: task.is_complete,
        deadline: task.deadline,
        lists: task.task_lists
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert([{
          title: taskData.title,
          is_complete: taskData.isComplete,
          deadline: taskData.deadline,
          user_id: session?.user?.id
        }])
        .select()
        .single();

      if (taskError) throw taskError;

      const { error: listsError } = await supabase
        .from('task_lists')
        .insert(
          taskData.lists.map(list => ({
            task_id: task.id,
            text: list.text
          }))
        );

      if (listsError) throw listsError;

      await fetchTasks();
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskData: Omit<Task, 'id'>) => {
    if (!editingTask) return;

    try {
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          title: taskData.title,
          is_complete: taskData.isComplete,
          deadline: taskData.deadline
        })
        .eq('id', editingTask.id);

      if (taskError) throw taskError;

      // Delete existing lists
      const { error: deleteError } = await supabase
        .from('task_lists')
        .delete()
        .eq('task_id', editingTask.id);

      if (deleteError) throw deleteError;

      // Insert new lists
      const { error: listsError } = await supabase
        .from('task_lists')
        .insert(
          taskData.lists.map(list => ({
            task_id: editingTask.id,
            text: list.text
          }))
        );

      if (listsError) throw listsError;

      await fetchTasks();
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_complete: !task.isComplete })
        .eq('id', id);

      if (error) throw error;

      await fetchTasks();
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const sortTasks = (tasksToSort: Task[]): Task[] => {
    switch (sortBy) {
      case 'createdDate':
        return [...tasksToSort].sort((a, b) => a.id.localeCompare(b.id));
      case 'completed':
        return [...tasksToSort].sort((a, b) => (a.isComplete === b.isComplete ? 0 : a.isComplete ? -1 : 1));
      case 'deadlineFarthest':
        return [...tasksToSort].sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());
      case 'deadlineNearest':
        return [...tasksToSort].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      default:
        return tasksToSort;
    }
  };

  const filteredTasks = sortTasks(
    tasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (!session) {
    return <Auth onSignIn={() => fetchTasks()} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus size={20} />
                Create Task
              </button>
              <button
                onClick={() => supabase.auth.signOut()}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border rounded-md bg-white"
            >
              <option value="index">Sort by Default</option>
              <option value="createdDate">Sort by Created Date</option>
              <option value="completed">Sort by Completed</option>
              <option value="deadlineFarthest">Sort by Deadline (Farthest)</option>
              <option value="deadlineNearest">Sort by Deadline (Nearest)</option>
            </select>
          </div>

          {(isCreating || editingTask) ? (
            <TaskForm
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              initialTask={editingTask || undefined}
              onCancel={() => {
                setIsCreating(false);
                setEditingTask(null);
              }}
            />
          ) : (
            <TaskTable
              tasks={filteredTasks}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;