// app/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Task = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
};

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [isEditing, setIsEditing] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Load tasks on start
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const stored = await AsyncStorage.getItem('tasks');
        if (stored) setTasks(JSON.parse(stored));
      } catch (e) {
        console.log('Error loading tasks', e);
      }
    };
    loadTasks();
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (task.trim() !== '') {
      const newTask = {
        id: Date.now().toString(),
        text: task,
        completed: false,
        createdAt: new Date().toLocaleDateString('en-GB'),
      };
      setTasks([...tasks, newTask]);
      setTask('');
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const toggleComplete = (id: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toLocaleDateString('en-GB') : undefined,
            }
          : t
      )
    );
  };

  const startEditing = (id: string, currentText: string) => {
    setEditingTaskId(id);
    setEditingText(currentText);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (editingTaskId && editingText.trim() !== '') {
      setTasks(
        tasks.map((t) =>
          t.id === editingTaskId ? { ...t, text: editingText } : t
        )
      );
    }
    setIsEditing(false);
    setEditingTaskId(null);
    setEditingText('');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingTaskId(null);
    setEditingText('');
  };

  const filteredTasks = tasks
    .filter((t) => t.text.toLowerCase().includes(searchText.toLowerCase()))
    .filter((t) => {
      if (filter === 'Pending') return !t.completed;
      if (filter === 'Completed') return t.completed;
      return true;
    });

  const totalTasks = tasks.length;
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>
      <Text style={styles.subtitle}>Stay organized and get things done</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalTasks}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#FFA500' }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      <Text style={styles.addTitle}>+ Add New Task</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="What needs to be done?"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+ Add Task</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'All' && styles.activeFilter]}
            onPress={() => setFilter('All')}
          >
            <Text>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'Pending' && styles.activeFilter]}
            onPress={() => setFilter('Pending')}
          >
            <Text>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'Completed' && styles.activeFilter]}
            onPress={() => setFilter('Completed')}
          >
            <Text>Completed</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tasksHeader}>
        <Text style={styles.tasksTitle}>▼ Tasks ({filteredTasks.length})</Text>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <TouchableOpacity onPress={() => toggleComplete(item.id)}>
              <Text style={[styles.checkbox, item.completed && styles.completedCheckbox]}>
                {item.completed ? '✓' : '○'}
              </Text>
            </TouchableOpacity>
            <View style={styles.taskInfo}>
              <Text style={[styles.taskText, item.completed && styles.completedText]}>
                {item.text}
              </Text>
              <Text style={styles.taskDate}>
                {item.createdAt}
                {item.completed && ` Completed ${item.completedAt}`}
              </Text>
            </View>
            <TouchableOpacity onPress={() => startEditing(item.id, item.text)}>
              <Text style={styles.icon}>📎</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditing}
        onRequestClose={cancelEdit}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Edit Task</Text>
          <TextInput
            style={styles.modalInput}
            value={editingText}
            onChangeText={setEditingText}
            placeholder="Enter new text"
          />
          <View style={styles.modalButtons}>
            <Pressable style={styles.button} onPress={cancelEdit}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.saveButton]} onPress={saveEdit}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: 'gray',
  },
  addTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#333',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filterButton: {
    padding: 5,
    marginLeft: 10,
  },
  activeFilter: {
    fontWeight: 'bold',
  },
  tasksHeader: {
    marginBottom: 10,
  },
  tasksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  checkbox: {
    fontSize: 20,
    marginRight: 10,
    color: 'gray',
  },
  completedCheckbox: {
    color: 'green',
  },
  taskInfo: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  taskDate: {
    fontSize: 12,
    color: 'gray',
  },
  icon: {
    fontSize: 20,
    marginHorizontal: 10,
    color: 'gray',
  },
  deleteIcon: {
    fontSize: 20,
    color: 'red',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalInput: {
    width: 250,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});