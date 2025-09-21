import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  // Load tasks when app starts
  useEffect(() => {
    loadTasks();
  }, []);

  // Save tasks whenever updated
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const saveTasks = async (tasks) => {
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (e) {
      console.error("Error saving tasks", e);
    }
  };

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem("tasks");
      if (stored) setTasks(JSON.parse(stored));
    } catch (e) {
      console.error("Error loading tasks", e);
    }
  };

  const addTask = () => {
    if (task.trim().length > 0) {
      setTasks([...tasks, { id: Date.now().toString(), text: task }]);
      setTask("");
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 To-Do List</Text>

      {/* Input + Add Button */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={task}
          onChangeText={setTask}
          placeholder="Enter a task"
        />
        <Button title="Add" onPress={addTask} />
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <Text style={styles.task}>{item.text}</Text>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.delete}>❌</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40, backgroundColor: "#f9f9f9" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  inputContainer: { flexDirection: "row", marginBottom: 20 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  taskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  task: { fontSize: 18, color: "#333" },
  delete: { fontSize: 18, color: "red" },
});
